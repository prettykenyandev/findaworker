/**
 * Auth Middleware - JWT validation
 * In production: integrate with Auth0, Clerk, or your IdP
 */
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-replace-in-production";

const authMiddleware = (req, res, next) => {
  // Allow OPTIONS for CORS preflight
  if (req.method === "OPTIONS") return next();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // In dev mode, allow demo token
    if (token === "demo-token") {
      req.user = { id: "demo-user", org: "demo-org", role: "admin" };
      return next();
    }
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = { authMiddleware };
