// ─── TaskSubmitModal ──────────────────────────────────────────────────────────
import { useState } from "react";
import { useStore } from "../store";
import { X, Play, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatDistanceToNow } from "date-fns";

const TASK_LABELS = {
  triage_ticket: "Triage Tickets",
  draft_response: "Draft Response",
  analyze_sentiment: "Analyze Sentiment",
  bulk_classify: "Bulk Classify",
  respond_to_dm: "Reply to DM",
  reply_to_comment: "Reply to Comment",
  handle_review: "Handle Review",
  social_monitor: "Social Monitoring",
  extract_fields: "Extract Fields",
  validate_records: "Validate Records",
  transform_data: "Transform Data",
  enrich_records: "Enrich Records",
  deduplicate: "Deduplicate",
  parse_document: "Parse Document",
  generate_code: "Generate Code",
  generate_project: "Generate Project",
  review_pr: "Review PR",
  write_tests: "Write Tests",
  detect_bugs: "Detect Bugs",
  generate_docs: "Generate Docs",
  refactor: "Refactor Code",
  generate_migration: "Generate Migration",
};

const TASK_DEFINITIONS = {
  customer_support: {
    tasks: ["triage_ticket", "draft_response", "analyze_sentiment", "bulk_classify", "respond_to_dm", "reply_to_comment", "handle_review", "social_monitor"],
    defaultPayload: (type) => {
      if (type === "triage_ticket") return { ticket_id: `TKT-${Math.random().toString(36).slice(2,6).toUpperCase()}`, text: "Customer complaint about billing charge", customer_tier: "standard" };
      if (type === "draft_response") return { category: "billing", customer_name: "Alex" };
      if (type === "analyze_sentiment") return { text: "I'm very frustrated with the recent changes to your pricing!" };
      if (type === "respond_to_dm") return { platform: "twitter", message: "Hey, I ordered 3 days ago and still haven't received a shipping update. What's going on?", customer_name: "Sarah" };
      if (type === "reply_to_comment") return { platform: "instagram", comment: "Love your new product launch! When will it be available in Canada?", customer_name: "Mike", product: "Pro Plan", post_context: "Product launch announcement" };
      if (type === "handle_review") return { platform: "google", review: "Service was fine but shipping took way too long.", rating: 3, customer_name: "Jordan T.", product: "our service" };
      if (type === "social_monitor") return { platforms: ["twitter", "instagram", "facebook"], brand_name: "Acme Corp", time_window_hours: 24 };
      return { tickets: [{ id: "1", text: "billing issue" }, { id: "2", text: "tech support" }] };
    }
  },
  data_entry: {
    tasks: ["extract_fields", "validate_records", "transform_data", "enrich_records", "deduplicate", "parse_document"],
    defaultPayload: (type) => {
      if (type === "extract_fields") return { text: "John Doe, john@example.com, +1-555-0100", fields: ["name", "email", "phone"] };
      if (type === "validate_records") return { records: [{ name: "Alice", email: "alice@test.com" }, { name: "Bob", email: "not-an-email" }], schema: { email: { required: true, type: "email" } } };
      if (type === "parse_document") return { document_type: "invoice", content: "Invoice #1234" };
      return { records: [{ name: "Alice", email: "alice@test.com", country: "US" }] };
    }
  },
  software_engineer: {
    tasks: ["generate_code", "generate_project", "review_pr", "write_tests", "detect_bugs", "generate_docs", "refactor", "generate_migration"],
    defaultPayload: (type) => {
      if (type === "generate_code") return { type: "rest_endpoint", language: "python", spec: { resource: "users", description: "User management" } };
      if (type === "generate_project") return { description: "A todo app with user authentication", language: "python", framework: "fastapi", features: ["REST API", "database", "auth"] };
      if (type === "review_pr") return { files_changed: 5, lines_added: 120, lines_removed: 30 };
      if (type === "detect_bugs") return { code: "def process(data):\n  return data[0]", lines: 50 };
      if (type === "generate_migration") return { table: "subscriptions", columns: ["user_id UUID", "plan VARCHAR(50)", "expires_at TIMESTAMPTZ"], description: "Create subscriptions table" };
      return { target_function: "process_payment", class_name: "PaymentService" };
    }
  }
};

const TASK_PLACEHOLDERS = {
  triage_ticket: "Describe the support ticket to triage, e.g. 'Customer says they were double-charged on their last invoice'",
  draft_response: "Describe what to respond about, e.g. 'Write a friendly reply to a customer asking for a refund on their Pro plan'",
  analyze_sentiment: "Paste the text to analyze, e.g. 'I love your product but the support team was unhelpful and slow'",
  bulk_classify: "Describe what to classify, e.g. 'Sort these tickets: billing issue, can't login, feature request, shipping delayed'",
  respond_to_dm: "Paste or describe the DM to reply to, e.g. 'Customer on Twitter DM asking when their order ships'",
  reply_to_comment: "Paste the comment to reply to, e.g. 'User on Instagram asking if we ship to Canada'",
  handle_review: "Paste the review to respond to, e.g. '3-star Google review saying shipping was slow but product was good'",
  social_monitor: "Describe what to monitor, e.g. 'Check mentions of our brand Acme Corp across Twitter and Instagram in the last 24 hours'",
  extract_fields: "Describe or paste the data to extract from, e.g. 'Extract name, email, and phone from: John Doe, john@example.com, 555-0100'",
  validate_records: "Describe the data to validate, e.g. 'Check these emails are valid: alice@test.com, bob@invalid, charlie@gmail.com'",
  transform_data: "Describe the transformation, e.g. 'Convert these CSV records to JSON format with uppercase names'",
  enrich_records: "Describe what to enrich, e.g. 'Add country codes to these phone numbers: 555-0100, 555-0200'",
  deduplicate: "Describe the data to deduplicate, e.g. 'Find and merge duplicate customer records with similar names and emails'",
  parse_document: "Describe the document to parse, e.g. 'Extract line items and totals from Invoice #1234'",
  generate_code: "Describe what code to write, e.g. 'A Python function that validates email addresses using regex'",
  generate_project: "Describe the project to build, e.g. 'A todo list API with FastAPI, SQLite database, and JWT authentication'",
  review_pr: "Paste the code to review, or describe the PR, e.g. 'Review this auth middleware for security issues'",
  write_tests: "Describe what to test, or paste the code, e.g. 'Write pytest tests for a user registration function'",
  detect_bugs: "Paste the code to analyze, or describe the issue, e.g. 'Find bugs in this payment processing function'",
  generate_docs: "Describe what to document, or paste the code, e.g. 'Write API docs for our /users endpoint'",
  refactor: "Paste the code to refactor, or describe what to improve, e.g. 'Refactor this 200-line function into smaller clean functions'",
  generate_migration: "Describe the database change, e.g. 'Create a subscriptions table with user_id, plan name, and expiry date'",
};

// Detect whether a short description sounds like a full project/app
const PROJECT_KEYWORDS = /\b(app|application|website|web\s?app|dashboard|platform|service|api|server|saas|system|portal|marketplace|e-?commerce|blog|forum|chat|clone|full.?stack|project|site|landing|startup)\b/i;

function buildPayload(taskType, agentType, description) {
  // Software engineer tasks — description is the primary input
  if (agentType === "software_engineer") {
    // Auto-upgrade generate_code → generate_project when the prompt sounds like a whole app
    if (taskType === "generate_code" && PROJECT_KEYWORDS.test(description)) {
      return { description, language: "python", _upgraded: "generate_project" };
    }
    if (taskType === "generate_code") return { description, language: "python" };
    if (taskType === "generate_project") return { description, language: "python" };
    if (taskType === "review_pr") return { code: description };
    if (taskType === "write_tests") return { code: description };
    if (taskType === "detect_bugs") return { code: description, lines: description.split("\n").length };
    if (taskType === "generate_docs") return { code: description, target: "code" };
    if (taskType === "refactor") return { code: description };
    if (taskType === "generate_migration") return { description };
  }
  // Customer support tasks
  if (agentType === "customer_support") {
    if (taskType === "triage_ticket") return { text: description, customer_tier: "standard" };
    if (taskType === "draft_response") return { category: "general", customer_name: "Customer", text: description };
    if (taskType === "analyze_sentiment") return { text: description };
    if (taskType === "respond_to_dm") return { platform: "twitter", message: description, customer_name: "Customer" };
    if (taskType === "reply_to_comment") return { platform: "social", comment: description, customer_name: "Customer" };
    if (taskType === "handle_review") return { platform: "google", review: description, rating: 3, customer_name: "Customer" };
    if (taskType === "social_monitor") return { platforms: ["twitter", "instagram"], brand_name: description, time_window_hours: 24 };
    return { text: description };
  }
  // Data entry tasks
  if (agentType === "data_entry") {
    if (taskType === "extract_fields") return { text: description, fields: ["name", "email", "phone"] };
    if (taskType === "validate_records") return { text: description };
    if (taskType === "parse_document") return { content: description, document_type: "document" };
    return { text: description };
  }
  return { description };
}

export function TaskSubmitModal({ agent, onClose }) {
  const { submitTask, addNotification } = useStore();
  const def = TASK_DEFINITIONS[agent.type] || { tasks: [] };
  const [taskType, setTaskType] = useState(def.tasks[0] || "");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      addNotification({ type: "error", message: "Please describe what you want done" });
      return;
    }

    const payload = buildPayload(taskType, agent.type, description.trim());

    // If buildPayload auto-upgraded the task type, use the upgraded type
    let finalTaskType = taskType;
    if (payload._upgraded) {
      finalTaskType = payload._upgraded;
      delete payload._upgraded;
    }

    setSubmitting(true);
    try {
      await submitTask({ agent_id: agent.id, task_type: finalTaskType, payload, priority });
      addNotification({ type: "success", message: `Task assigned — ${TASK_LABELS[taskType] || taskType}` });
      onClose();
    } catch (err) {
      addNotification({ type: "error", message: `Failed to assign task: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...modalStyle, maxWidth: "520px" }} className="animate-fadeInUp">
        <div style={mHeader}>
          <div>
            <div style={mTitle}>Assign a Task</div>
            <div style={mSub}>Worker: {agent.name}</div>
          </div>
          <button style={closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div style={mBody}>
          <div>
            <label className="label">Task Type</label>
            <select className="select" value={taskType} onChange={(e) => setTaskType(e.target.value)}>
              {def.tasks.map(t => <option key={t} value={t}>{TASK_LABELS[t] || t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Priority (1–10)</label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input type="range" min={1} max={10} value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                style={{ flex: 1, accentColor: "var(--accent)" }} />
              <span style={{ color: priority >= 8 ? "var(--red)" : priority >= 5 ? "var(--amber)" : "var(--text-muted)", fontWeight: 700, fontSize: "15px", width: "24px", textAlign: "center" }}>
                {priority}
              </span>
            </div>
          </div>
          <div>
            <label className="label">What do you need done?</label>
            <textarea
              className="input"
              style={{ fontSize: "14px", resize: "vertical", minHeight: "120px", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}
              placeholder={TASK_PLACEHOLDERS[taskType] || "Describe what you want the worker to do..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div style={mFooter}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !taskType || !description.trim()}>
            <Play size={14} />
            {submitting ? "Assigning..." : "Start Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TaskFeed ─────────────────────────────────────────────────────────────────
export function TaskFeed({ tasks }) {
  if (tasks.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px", color: "var(--text-muted)", fontSize: "14px" }}>
        No activity yet
      </div>
    );
  }

  const FEED_LABELS = {
    triage_ticket: "Triage Tickets", draft_response: "Draft Response", analyze_sentiment: "Sentiment Analysis",
    bulk_classify: "Bulk Classify", respond_to_dm: "Reply to DM", reply_to_comment: "Reply to Comment",
    handle_review: "Handle Review", social_monitor: "Social Monitor", extract_fields: "Extract Fields",
    validate_records: "Validate Records", transform_data: "Transform Data", enrich_records: "Enrich Records",
    deduplicate: "Deduplicate", parse_document: "Parse Document", generate_code: "Generate Code",
    generate_project: "Generate Project",
    review_pr: "Review PR", write_tests: "Write Tests", detect_bugs: "Detect Bugs",
    generate_docs: "Generate Docs", refactor: "Refactor", generate_migration: "Migration",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "460px", overflow: "auto" }}>
      {tasks.map((task) => (
        <div key={task.id} style={feedItem}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>#{task.id}</span>
            <span className={`status-badge status-${task.status}`} style={{ fontSize: "11px", padding: "3px 8px" }}>
              {task.status === "running" && <span className="dot dot-cyan" />}
              {task.status}
            </span>
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>{FEED_LABELS[task.type] || task.type}</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
          </div>
          {task.error && (
            <div style={{ fontSize: "12px", color: "var(--red)", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {task.error}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const feedItem = {
  padding: "12px 14px",
  background: "rgba(18, 24, 43, 0.6)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "10px",
  cursor: "default",
  transition: "border-color 0.15s",
};

// ─── ThroughputChart ──────────────────────────────────────────────────────────
export function ThroughputChart({ tasks }) {
  const now = new Date();
  const buckets = Array.from({ length: 12 }, (_, i) => {
    const h = new Date(now - (11 - i) * 5 * 60 * 1000);
    return {
      time: `${String(h.getHours()).padStart(2,"0")}:${String(h.getMinutes()).padStart(2,"0")}`,
      completed: 0, failed: 0,
    };
  });

  tasks.forEach((t) => {
    if (!t.finished_at) return;
    // Backend stores UTC timestamps without 'Z' suffix — append it so JS parses as UTC
    const ts = t.finished_at.endsWith("Z") ? t.finished_at : t.finished_at + "Z";
    const age = (now - new Date(ts)) / 1000 / 60;
    if (age > 60) return;
    const idx = Math.min(11, Math.floor(age / 5));
    const bucket = buckets[11 - idx];
    if (t.status === "completed") bucket.completed++;
    else if (t.status === "failed") bucket.failed++;
  });

  const hasData = buckets.some(b => b.completed > 0 || b.failed > 0);

  if (!hasData) {
    return (
      <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px", color: "var(--text-muted)" }}>
        <TrendingUp size={32} style={{ opacity: 0.15 }} />
        <span style={{ fontSize: "13px" }}>No activity in the last hour</span>
      </div>
    );
  }

  return (
    <div style={{ height: "160px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={buckets} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gcCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gcFailed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--red)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--red)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "rgba(12, 17, 30, 0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", fontSize: "12px", backdropFilter: "blur(12px)" }}
            labelStyle={{ color: "rgba(255,255,255,0.5)" }}
          />
          <Area type="monotone" dataKey="completed" stroke="var(--accent)" strokeWidth={2} fill="url(#gcCompleted)" />
          <Area type="monotone" dataKey="failed" stroke="var(--red)" strokeWidth={1.5} fill="url(#gcFailed)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── NotificationStack ────────────────────────────────────────────────────────
export function NotificationStack() {
  const { notifications, dismissNotification } = useStore();
  
  if (notifications.length === 0) return null;

  return (
    <div style={notifContainer}>
      {notifications.map((n) => (
        <div key={n.id}
          style={{
            ...notifItem,
            borderLeftColor: n.type === "success" ? "#22c55e" : n.type === "error" ? "#ef4444" : "var(--accent)",
          }}
          className="animate-slideInLeft"
        >
          <span style={{ flex: 1, fontSize: "13px", color: "var(--text-primary)" }}>{n.message}</span>
          <button style={notifClose} onClick={() => dismissNotification(n.id)}><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

// Shared modal styles
const overlayStyle = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.35)",
  backdropFilter: "blur(6px)",
  zIndex: 1000,
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "20px",
};
const modalStyle = {
  width: "100%",
  background: "rgba(12, 17, 30, 0.97)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "16px",
  boxShadow: "0 24px 48px rgba(0,0,0,0.5), 0 0 40px rgba(0,229,255,0.05)",
  overflow: "hidden",
  backdropFilter: "blur(20px)",
};
const mHeader = { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "24px 24px 0" };
const mTitle = { fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" };
const mSub = { fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" };
const closeBtn = { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "6px", borderRadius: "8px" };
const mBody = { display: "flex", flexDirection: "column", gap: "16px", padding: "20px 24px" };
const mFooter = { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", padding: "18px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" };
const notifContainer = { position: "fixed", bottom: "20px", right: "20px", zIndex: 2000, display: "flex", flexDirection: "column", gap: "8px", width: "360px" };
const notifItem = { display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", background: "rgba(12, 17, 30, 0.95)", border: "1px solid rgba(255,255,255,0.08)", borderLeft: "4px solid", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.3)", backdropFilter: "blur(12px)" };
const notifClose = { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px", flexShrink: 0 };
