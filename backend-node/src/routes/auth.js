/**
 * Auth Routes - Login, Register, Token management
 */
const express = require("express");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-replace-in-production";

// In-memory user store (replace with DB in production)
const users = new Map([
  ["admin@demo.com", { id: "user-1", email: "admin@demo.com", password: "demo1234", org: "Demo Corp", role: "admin" }],
  ["dev@demo.com", { id: "user-2", email: "dev@demo.com", password: "demo1234", org: "Demo Corp", role: "developer" }],
]);

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, org: user.org, role: user.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const user = users.get(email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const { accessToken, refreshToken } = generateTokens(user);
  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, org: user.org, role: user.role },
  });
});

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { email, password, orgName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  if (users.has(email.toLowerCase())) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const user = { id: uuidv4(), email: email.toLowerCase(), password, org: orgName || "New Org", role: "admin" };
  users.set(email.toLowerCase(), user);

  const { accessToken, refreshToken } = generateTokens(user);
  res.status(201).json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, org: user.org, role: user.role },
  });
});

// POST /api/auth/demo - instant demo access
router.post("/demo", (req, res) => {
  const demoUser = { id: "demo-user", email: "demo@workforce.ai", org: "Acme Corporation", role: "admin" };
  const { accessToken, refreshToken } = generateTokens(demoUser);
  res.json({ accessToken, refreshToken, user: demoUser });
});

// POST /api/auth/refresh
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = [...users.values()].find(u => u.id === decoded.id) || 
                 { id: "demo-user", email: "demo@workforce.ai", org: "Acme Corporation", role: "admin" };
    const tokens = generateTokens(user);
    res.json(tokens);
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

module.exports = router;
