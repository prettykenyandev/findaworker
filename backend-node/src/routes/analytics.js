/**
 * Analytics Routes - aggregated workforce insights
 */
const express = require("express");
const router = express.Router();

// GET /api/analytics/overview
router.get("/overview", async (req, res) => {
  try {
    const metricsRes = await fetch("http://localhost:8001/metrics", { signal: AbortSignal.timeout(5000) });
    const metrics = await metricsRes.json();
    
    // Augment with historical trend data (mock - replace with DB queries)
    const trends = generateTrends();
    res.json({ ...metrics, trends, timestamp: new Date().toISOString() });
  } catch {
    res.json({ ...mockMetrics(), trends: generateTrends(), timestamp: new Date().toISOString() });
  }
});

// GET /api/analytics/agent/:id
router.get("/agent/:id", (req, res) => {
  const { id } = req.params;
  res.json({
    agent_id: id,
    performance: {
      avg_task_duration_ms: Math.floor(Math.random() * 2000) + 500,
      success_rate: (Math.random() * 15 + 85).toFixed(1),
      tasks_today: Math.floor(Math.random() * 100) + 20,
      peak_hour: `${Math.floor(Math.random() * 8) + 9}:00`,
    },
    history: Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, "0")}:00`,
      tasks: Math.floor(Math.random() * 30),
      errors: Math.floor(Math.random() * 2),
    })),
  });
});

function generateTrends() {
  const hours = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    tasks: Math.floor(Math.random() * 50) + 5,
    agents_active: Math.floor(Math.random() * 8) + 2,
  }));
  
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return {
      day: days[i],
      tasks_completed: Math.floor(Math.random() * 500) + 100,
      cost_saved_usd: Math.floor(Math.random() * 2000) + 500,
    };
  });
  
  return { hourly: hours, weekly };
}

function mockMetrics() {
  return {
    agents: { total: 3, running: 3, idle: 0 },
    tasks: { total: 847, completed: 821, failed: 12, running: 14, success_rate: 97.1 },
    throughput: { per_minute: 8, per_5_minutes: 38 },
  };
}

module.exports = router;
