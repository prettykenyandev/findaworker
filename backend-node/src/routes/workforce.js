/**
 * Workforce Routes - Team/org-level workforce management
 */
const express = require("express");
const router = express.Router();

// GET /api/workforce/summary
router.get("/summary", (req, res) => {
  const { org } = req.user;
  res.json({
    org,
    workers_deployed: Math.floor(Math.random() * 10) + 3,
    workers_available: 50,  // plan limit
    monthly_tasks_run: Math.floor(Math.random() * 10000) + 5000,
    monthly_task_limit: 100000,
    estimated_hours_saved: Math.floor(Math.random() * 500) + 200,
    cost_savings_usd: Math.floor(Math.random() * 8000) + 2000,
    plan: "Growth",
  });
});

// GET /api/workforce/templates
router.get("/templates", (req, res) => {
  res.json([
    {
      id: "tpl-cs-basic",
      name: "Customer Support Starter",
      description: "Handles ticket triage, sentiment analysis, and response drafting",
      agent_type: "customer_support",
      config: { categories: ["billing", "technical", "general"], auto_resolve_threshold: 0.85 },
      estimated_tasks_per_day: 200,
    },
    {
      id: "tpl-de-invoice",
      name: "Invoice Processor",
      description: "Extracts and validates data from invoices and receipts",
      agent_type: "data_entry",
      config: { document_types: ["invoice", "receipt"], output_format: "json" },
      estimated_tasks_per_day: 500,
    },
    {
      id: "tpl-swe-review",
      name: "Code Review Bot",
      description: "Reviews PRs, detects bugs, and suggests improvements",
      agent_type: "software_engineer",
      config: { languages: ["python", "typescript"], test_coverage_target: 80 },
      estimated_tasks_per_day: 50,
    },
    {
      id: "tpl-de-crm",
      name: "CRM Data Enricher",
      description: "Enriches CRM records with company and contact data",
      agent_type: "data_entry",
      config: { enrichment_sources: ["company_db", "geo_api"], output_format: "json" },
      estimated_tasks_per_day: 1000,
    },
  ]);
});

module.exports = router;
