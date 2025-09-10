require("dotenv").config();
const mongoose = require("mongoose");

async function connect() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/green_quiz_glow";
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB connected to", uri);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

const userSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Gamification / stats
  ecoPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  nextLevelPoints: { type: Number, default: 1000 },
  streakDays: { type: Number, default: 0 },
  lastActive: { type: Date, default: null },
  quizzesCompleted: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },

  // optional: track completed task ids to avoid duplicates
  completedTaskIds: { type: [String], default: [] },

  role: { type: String, default: "student" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = { connect, User };
