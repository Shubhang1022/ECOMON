require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { connect, User } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.AUTH_PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

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
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
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