require("dotenv").config();
const mongoose = require("mongoose");

async function connect() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/green_quiz_glow";
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
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
  role: { type: String, default: "student" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = { connect, User };
