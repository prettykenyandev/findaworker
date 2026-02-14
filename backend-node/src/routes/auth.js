/**
 * Auth Routes - Login, Register, Token management
 * Users stored in MongoDB
 */
const express = require("express");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { User } = require("../database");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-replace-in-production";

const generateTokens = (user) => {
  const payload = { id: user._id || user.id, email: user.email, org: user.org, role: user.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  const refreshToken = jwt.sign({ id: payload.id }, JWT_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, org: user.org, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { email, password, orgName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      org: orgName || "My Company",
      role: "admin",
    });

    const { accessToken, refreshToken } = generateTokens(user);
    res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, org: user.org, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/demo - instant demo access
router.post("/demo", async (req, res) => {
  // Upsert a demo user so it always exists in the DB
  try {
    let user = await User.findOne({ email: "demo@workforce.ai" });
    if (!user) {
      user = await User.create({
        email: "demo@workforce.ai",
        password: "demo1234",
        org: "Acme Corporation",
        role: "admin",
      });
    }
    const { accessToken, refreshToken } = generateTokens(user);
    res.json({ accessToken, refreshToken, user: { id: user._id, email: user.email, org: user.org, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: "Demo login failed" });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = await User.findById(decoded.id) ||
                 { _id: "demo-user", email: "demo@workforce.ai", org: "Acme Corporation", role: "admin" };
    const tokens = generateTokens(user);
    res.json(tokens);
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

module.exports = router;
