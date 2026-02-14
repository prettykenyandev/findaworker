/**
 * AI Workforce Platform - Node.js API Gateway
 * Acts as the primary entry point: auth, rate limiting, routing to Python agents
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware, fixRequestBody } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const authRouter = require("./routes/auth");
const workforceRouter = require("./routes/workforce");
const analyticsRouter = require("./routes/analytics");
const { authMiddleware } = require("./middleware/auth");
const { requestLogger } = require("./middleware/logger");
const { connectDB } = require("./database");

const app = express();
const PORT = process.env.PORT || 3001;
const PYTHON_BACKEND = process.env.PYTHON_BACKEND_URL || "http://localhost:8001";

// ── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("combined"));
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/workforce", authMiddleware, workforceRouter);
app.use("/api/analytics", authMiddleware, analyticsRouter);

// Health check
app.get("/api/health", async (req, res) => {
  let agentBackendHealth = "unknown";
  try {
    const response = await fetch(`${PYTHON_BACKEND}/health`, { signal: AbortSignal.timeout(3000) });
    agentBackendHealth = response.ok ? "ok" : "degraded";
  } catch {
    agentBackendHealth = "unreachable";
  }
  
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      gateway: "ok",
      agent_backend: agentBackendHealth,
    },
    version: "1.0.0",
  });
});

// ── Proxy to Python Agent Backend ───────────────────────────────────────────
app.use(
  "/api/agents",
  authMiddleware,
  createProxyMiddleware({
    target: PYTHON_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/agents": "/agents" },
    onProxyReq: fixRequestBody,
    onError: (err, req, res) => {
      res.status(502).json({ error: "Agent backend unavailable", detail: err.message });
    },
  })
);

app.use(
  "/api/tasks",
  authMiddleware,
  createProxyMiddleware({
    target: PYTHON_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/tasks": "/tasks" },
    onProxyReq: fixRequestBody,
  })
);

app.use(
  "/api/metrics",
  authMiddleware,
  createProxyMiddleware({
    target: PYTHON_BACKEND,
    changeOrigin: true,
    pathRewrite: { "^/api/metrics": "/metrics" },
    onProxyReq: fixRequestBody,
  })
);

// WebSocket proxy for real-time updates
app.use(
  "/ws",
  createProxyMiddleware({
    target: PYTHON_BACKEND,
    changeOrigin: true,
    ws: true,
  })
);

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error", requestId: uuidv4() });
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`✅ AI Workforce Gateway running on http://localhost:${PORT}`);
  console.log(`📡 Proxying agent calls to ${PYTHON_BACKEND}`);
});

module.exports = app;
