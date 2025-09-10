require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { connect, User } = require("./db.cjs");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.AUTH_PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// Helper: auth middleware
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "User already exists" });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash, role });
    await user.save();
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
    // return user without password
    const safeUser = (({ _id, name, email, role, ecoPoints, level, streakDays, quizzesCompleted, tasksCompleted, nextLevelPoints }) => ({ id: _id, name, email, role, ecoPoints, level, streakDays, quizzesCompleted, tasksCompleted, nextLevelPoints }))(user);
    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
});

// login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
    const safeUser = (({ _id, name, email, role, ecoPoints, level, streakDays, quizzesCompleted, tasksCompleted, nextLevelPoints }) => ({ id: _id, name, email, role, ecoPoints, level, streakDays, quizzesCompleted, tasksCompleted, nextLevelPoints }))(user);
    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
});

// get current user
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
});

// helper: update streak based on lastActive
function updateStreak(user) {
  const today = new Date();
  const last = user.lastActive ? new Date(user.lastActive) : null;
  if (!last) {
    user.streakDays = 1;
  } else {
    const diffDays = Math.floor((new Date(today.toDateString()) - new Date(last.toDateString())) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      // same day - no change
    } else if (diffDays === 1) {
      user.streakDays = (user.streakDays || 0) + 1;
    } else {
      user.streakDays = 1;
    }
  }
  user.lastActive = today;
}

// task completion endpoint
app.post("/api/user/complete-task", authMiddleware, async (req, res) => {
  const { taskId, reward = 100 } = req.body || {};
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // prevent duplicate same-task completion
    if (taskId && user.completedTaskIds && user.completedTaskIds.includes(taskId)) {
      return res.status(400).json({ error: "Task already completed" });
    }

    user.tasksCompleted = (user.tasksCompleted || 0) + 1;
    user.ecoPoints = (user.ecoPoints || 0) + Number(reward || 0);
    if (taskId) user.completedTaskIds.push(String(taskId));

    // update streak
    updateStreak(user);

    // optional: level up simple logic
    if (user.ecoPoints >= (user.nextLevelPoints || 1000)) {
      user.level = (user.level || 1) + 1;
      user.nextLevelPoints = ((user.nextLevelPoints || 1000) * 1.5) | 0;
    }

    await user.save();
    const safeUser = (({ _id, name, email, ecoPoints, level, streakDays, quizzesCompleted, tasksCompleted, nextLevelPoints }) => ({ id: _id, name, email, ecoPoints, level, streakDays, quizzesCompleted, tasksCompleted, nextLevelPoints }))(user);
    return res.json({ ok: true, user: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
});

// quiz completion endpoint
app.post("/api/user/complete-quiz", authMiddleware, async (req, res) => {
  const { reward = 100, score = 0, total = 0 } = req.body || {};
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.quizzesCompleted = (user.quizzesCompleted || 0) + 1;
    // reward may be adjusted based on score/total
    user.ecoPoints = (user.ecoPoints || 0) + Number(reward || 0);

    updateStreak(user);

    if (user.ecoPoints >= (user.nextLevelPoints || 1000)) {
      user.level = (user.level || 1) + 1;
      user.nextLevelPoints = ((user.nextLevelPoints || 1000) * 1.5) | 0;
    }

    await user.save();
    const safeUser = (({ _id, name, email, ecoPoints, level, streakDays, quizzesCompleted, tasksCompleted, nextLevelPoints }) => ({ id: _id, name, email, ecoPoints, level, streakDays, quizzesCompleted, tasksCompleted, nextLevelPoints }))(user);
    return res.json({ ok: true, user: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
});

// leaderboard
app.get("/api/leaderboard", async (req, res) => {
  try {
    // return top users by ecoPoints (adjust fields as needed)
    const top = await User.find().select("name email ecoPoints level").sort({ ecoPoints: -1 }).limit(50).lean();
    return res.json({ leaderboard: top });
  } catch (err) {
    console.error("leaderboard error", err);
    return res.status(500).json({ error: "server error" });
  }
});

connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Auth server listening on http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error("Failed to connect to MongoDB", e);
    process.exit(1);
  });