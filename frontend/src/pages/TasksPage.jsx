import { useState } from "react";
import { useStore } from "../store";
import { ClipboardList, RefreshCw, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { TaskResultModal } from "../components/TaskResultModal";

const STATUS_ORDER = ["running", "queued", "completed", "failed"];
const STATUS_LABELS = { running: "Active", queued: "Queued", completed: "Done", failed: "Failed" };

const TASK_LABELS = {
  triage_ticket: "Triage Tickets", draft_response: "Draft Response", analyze_sentiment: "Sentiment Analysis",
  bulk_classify: "Bulk Classify", respond_to_dm: "Reply to DM", reply_to_comment: "Reply to Comment",
  handle_review: "Handle Review", social_monitor: "Social Monitor", extract_fields: "Extract Fields",
  validate_records: "Validate Records", transform_data: "Transform Data", enrich_records: "Enrich Records",
  deduplicate: "Deduplicate", parse_document: "Parse Document", generate_code: "Generate Code",
  generate_project: "Generate Project",
  review_pr: "Review PR", write_tests: "Write Tests", detect_bugs: "Detect Bugs",
  generate_docs: "Generate Docs", refactor: "Refactor", generate_migration: "Migration",
};

function getStatusColor(status) {
  const map = { running: "#4f6ef7", queued: "#8b5cf6", completed: "#22c55e", failed: "#ef4444" };
  return map[status] || "var(--text-muted)";
}

export function TasksPage() {
  const { tasks, tasksLoading, fetchTasks, agents } = useStore();
  const [statusFilter, setStatusFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);

  const filtered = tasks.filter((t) => {
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchAgent = agentFilter === "all" || t.agent_id === agentFilter;
    return matchStatus && matchAgent;
  });

  const counts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={styles.page}>
      <div style={styles.header} className="page-header">
        <div>
          <h1 style={styles.title}>Activity</h1>
          <p style={styles.subtitle}>{tasks.length} total tasks across all workers</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchTasks} disabled={tasksLoading}>
          <RefreshCw size={14} className={tasksLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Status summary */}
      <div style={styles.statusRow} className="status-row">
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            style={{
              ...styles.statusChip,
              borderColor: statusFilter === s ? getStatusColor(s) : "var(--border)",
              color: statusFilter === s ? getStatusColor(s) : "var(--text-secondary)",
              background: statusFilter === s ? `${getStatusColor(s)}12` : "#ffffff",
            }}
            onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
          >
            <span style={{ ...styles.statusDot, background: getStatusColor(s) }} />
            {STATUS_LABELS[s]}
            <span style={styles.statusCount}>{counts[s] || 0}</span>
          </button>
        ))}

        {/* Agent filter */}
        <select
          className="select"
          style={{ width: "200px", marginLeft: "auto" }}
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
        >
          <option value="all">All Workers</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Task table */}
      <div style={styles.tableWrapper} className="table-wrapper">
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Task</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Worker</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}>Duration</th>
              <th style={styles.th}>Result</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((task) => {
              const agent = agents.find((a) => a.id === task.agent_id);
              const fa = task.finished_at ? (task.finished_at.endsWith("Z") ? task.finished_at : task.finished_at + "Z") : null;
              const sa = task.started_at ? (task.started_at.endsWith("Z") ? task.started_at : task.started_at + "Z") : null;
              const duration = fa && sa
                ? `${((new Date(fa) - new Date(sa)) / 1000).toFixed(1)}s`
                : task.status === "running" ? "in progress" : "—";
              
              return (
                <tr key={task.id} style={{ ...styles.row, cursor: task.result || task.error ? "pointer" : "default" }}
                  onClick={() => (task.result || task.error) && setSelectedTask(task)}
                  onMouseEnter={(e) => { if (task.result || task.error) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
                >
                  <td style={styles.td}>
                    <span style={{ color: "var(--accent)", fontSize: "13px", fontWeight: 600 }}>
                      #{task.id}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span className={`status-badge status-${task.status}`}>
                      {task.status === "running" && <span className="dot dot-cyan" />}
                      {STATUS_LABELS[task.status] || task.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: "var(--text-primary)", fontSize: "13px" }}>
                      {TASK_LABELS[task.type] || task.type}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                      {agent?.name || task.agent_id}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: task.priority >= 8 ? "var(--red)" : task.priority >= 5 ? "var(--amber)" : "var(--text-muted)"
                    }}>
                      {task.priority}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      {formatDistanceToNow(new Date(task.created_at.endsWith("Z") ? task.created_at : task.created_at + "Z"), { addSuffix: true })}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      {duration}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {task.error ? (
                      <button
                        style={styles.viewBtn}
                        onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                      >
                        <Eye size={13} /> Error
                      </button>
                    ) : task.result ? (
                      <button
                        style={{ ...styles.viewBtn, color: "#4f6ef7", borderColor: "#4f6ef7" }}
                        onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                      >
                        <Eye size={13} /> View Output
                      </button>
                    ) : task.status === "running" ? (
                      <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Running…</span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={styles.empty}>
            <ClipboardList size={40} style={{ opacity: 0.15, marginBottom: "16px" }} />
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", fontWeight: 500 }}>No tasks match this filter</p>
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskResultModal
          task={selectedTask}
          agentName={agents.find((a) => a.id === selectedTask.agent_id)?.name}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

const styles = {
  page: { padding: "32px", display: "flex", flexDirection: "column", gap: "24px" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  title: { fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" },
  subtitle: { color: "var(--text-muted)", fontSize: "15px", marginTop: "4px" },
  statusRow: { display: "flex", gap: "8px", alignItems: "center" },
  statusChip: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "8px 14px",
    background: "#ffffff",
    border: "1.5px solid",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  statusDot: { width: "7px", height: "7px", borderRadius: "50%" },
  statusCount: {
    background: "#f1f3f5",
    padding: "2px 7px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--text-muted)",
  },
  tableWrapper: {
    background: "#ffffff",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    overflow: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f9fafb", borderBottom: "1px solid var(--border)" },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--text-muted)",
    whiteSpace: "nowrap",
  },
  row: {
    borderBottom: "1px solid var(--border)",
    transition: "background 0.1s",
    cursor: "default",
  },
  td: {
    padding: "14px 16px",
    verticalAlign: "middle",
  },
  viewBtn: {
    display: "inline-flex", alignItems: "center", gap: "5px",
    padding: "5px 12px", fontSize: "12px", fontWeight: 600,
    border: "1px solid var(--border)", borderRadius: "6px",
    background: "#fff", color: "var(--text-secondary)",
    cursor: "pointer", transition: "all 0.15s",
    whiteSpace: "nowrap",
  },
  empty: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "60px", textAlign: "center",
  },
};
