/**
 * MongoDB connection via mongoose
 */
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/workforce";

let connected = false;

async function connectDB() {
  if (connected) return;
  try {
    await mongoose.connect(MONGODB_URI);
    connected = true;
    console.log("✓ MongoDB connected");
  } catch (err) {
    console.error("✗ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

// ─── User Schema ─────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  org:      { type: String, default: "My Company" },
  role:     { type: String, default: "admin" },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = { connectDB, User };
