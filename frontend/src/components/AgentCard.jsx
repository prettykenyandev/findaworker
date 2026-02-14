import { useState } from "react";
import { useStore } from "../store";
import { Users, Code, Database, Headphones, Play, Trash2, Activity, Clock, CheckCircle, AlertCircle, Loader, Eye } from "lucide-react";
import { TaskResultModal } from "./TaskResultModal";

const AGENT_ICONS = {
  customer_support: Headphones,
  data_entry: Database,
  software_engineer: Code,
};

const AGENT_LABELS = {
  customer_support: "Customer Support",
  data_entry: "Data Entry",
  software_engineer: "Software Engineer",
};

const AGENT_COLORS = {
  customer_support: { bg: "rgba(0, 229, 255, 0.08)", color: "#00e5ff" },
  data_entry: { bg: "rgba(168, 85, 247, 0.08)", color: "#a855f7" },
  software_engineer: { bg: "rgba(0, 255, 136, 0.08)", color: "#00ff88" },
};

const TASK_LABELS = {
  triage_ticket: "Triage Ticket", draft_response: "Draft Response", analyze_sentiment: "Sentiment",
  bulk_classify: "Classify", respond_to_dm: "Reply DM", reply_to_comment: "Reply Comment",
  handle_review: "Handle Review", social_monitor: "Monitor", extract_fields: "Extract",
  validate_records: "Validate", transform_data: "Transform", enrich_records: "Enrich",
  deduplicate: "Deduplicate", parse_document: "Parse Doc", generate_code: "Generate Code",
  generate_project: "Generate Project", review_pr: "Review PR", write_tests: "Write Tests",
  detect_bugs: "Detect Bugs", generate_docs: "Generate Docs", refactor: "Refactor",
  generate_migration: "Migration",
};

const STATUS_ICONS = {
  running: Loader,
  queued: Clock,
  completed: CheckCircle,
  failed: AlertCircle,
};

const STATUS_COLORS = {
  running: "#00e5ff",
  queued: "#a855f7",
  completed: "#00ff88",
  failed: "#ff3366",
};

export function AgentCard({ agent, compact = false, onSubmitTask }) {
  const { terminateAgent, tasks } = useStore();
  const [terminating, setTerminating] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const Icon = AGENT_ICONS[agent.type] || Users;
  const colors = AGENT_COLORS[agent.type] || AGENT_COLORS.customer_support;
  const typeLabel = AGENT_LABELS[agent.type] || agent.type.replace(/_/g, " ");

  // Get this agent's tasks — active first, then recent
  const agentTasks = tasks
    .filter((t) => t.agent_id === agent.id)
    .sort((a, b) => {
      const order = { running: 0, queued: 1, completed: 2, failed: 3 };
      const diff = (order[a.status] ?? 9) - (order[b.status] ?? 9);
      return diff !== 0 ? diff : new Date(b.created_at) - new Date(a.created_at);
    })
    .slice(0, 4);

  const activeTasks = agentTasks.filter((t) => t.status === "running" || t.status === "queued");

  const uptimeHours = Math.floor(agent.uptime_seconds / 3600);
  const uptimeMins = Math.floor((agent.uptime_seconds % 3600) / 60);
  const uptimeStr = uptimeHours > 0 ? `${uptimeHours}h ${uptimeMins}m` : `${uptimeMins}m`;

  const handleTerminate = async () => {
    if (!confirm(`Remove worker "${agent.name}"? This will stop all their current tasks.`)) return;
    setTerminating(true);
    try {
      await terminateAgent(agent.id);
    } finally {
      setTerminating(false);
    }
  };

  const successRate = agent.tasks_completed + agent.tasks_failed > 0
    ? Math.round(agent.tasks_completed / (agent.tasks_completed + agent.tasks_failed) * 100)
    : 100;

  if (compact) {
    return (
      <div style={styles.compactCard}>
        <div style={{ ...styles.compactIcon, background: colors.bg, color: colors.color }}>
          <Icon size={14} />
        </div>
        <div style={styles.compactInfo}>
          <div style={styles.compactName}>{agent.name}</div>
          <div style={styles.compactMeta}>
            {agent.tasks_completed} tasks done · {successRate}% success
          </div>
        </div>
        <span className={`status-badge status-${agent.status}`}>
          {agent.status === "running" && <span className="dot dot-green" />}
          {agent.status === "running" ? "Active" : agent.status}
        </span>
      </div>
    );
  }

  return (
    <div style={styles.card} className="animate-fadeInUp">
      {/* Header */}
      <div style={styles.cardHeader}>
        <div style={{ ...styles.agentIcon, background: colors.bg, color: colors.color }}>
          <Icon size={20} />
        </div>
        <div style={styles.agentInfo}>
          <div style={styles.agentName}>{agent.name}</div>
          <div style={styles.agentType}>{typeLabel}</div>
        </div>
        <span className={`status-badge status-${agent.status}`}>
          {agent.status === "running" && <span className="dot dot-green" />}
          {agent.status === "running" ? "Active" : agent.status}
        </span>
      </div>

      {/* Description */}
      {agent.description && (
        <p style={styles.description}>{agent.description}</p>
      )}

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <div style={{ ...styles.statValue, color: "var(--green)" }}>{agent.tasks_completed}</div>
          <div style={styles.statLabel}>Done</div>
        </div>
        <div style={styles.stat}>
          <div style={{ ...styles.statValue, color: agent.tasks_failed > 0 ? "var(--red)" : "var(--text-muted)" }}>
            {agent.tasks_failed}
          </div>
          <div style={styles.statLabel}>Issues</div>
        </div>
        <div style={styles.stat}>
          <div style={{ ...styles.statValue, color: colors.color }}>{successRate}%</div>
          <div style={styles.statLabel}>Success</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statValue}>{uptimeStr}</div>
          <div style={styles.statLabel}>Uptime</div>
        </div>
      </div>

      {/* Active / Recent Tasks */}
      {agentTasks.length > 0 && (
        <div style={styles.taskSection}>
          <div style={styles.taskSectionHeader}>
            {activeTasks.length > 0
              ? <><Activity size={13} color="#00e5ff" /> <span>Working on {activeTasks.length} task{activeTasks.length > 1 ? "s" : ""}</span></>
              : <><CheckCircle size={13} color="var(--text-muted)" /> <span>Recent tasks</span></>
            }
          </div>
          <div style={styles.taskList}>
            {agentTasks.map((task) => {
              const TaskIcon = STATUS_ICONS[task.status] || Clock;
              const statusColor = STATUS_COLORS[task.status] || "var(--text-muted)";
              const isClickable = task.result || task.error || task.status === "running";
              return (
                <button
                  key={task.id}
                  style={{
                    ...styles.taskItem,
                    cursor: isClickable ? "pointer" : "default",
                    borderLeftColor: statusColor,
                  }}
                  onClick={() => isClickable && setSelectedTask(task)}
                  onMouseEnter={(e) => { if (isClickable) e.currentTarget.style.background = "rgba(0, 229, 255, 0.04)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(15, 20, 35, 0.6)"; }}
                >
                  <TaskIcon
                    size={14}
                    color={statusColor}
                    className={task.status === "running" ? "animate-spin" : ""}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.taskItemName}>
                      {TASK_LABELS[task.type] || task.type}
                    </div>
                    <div style={styles.taskItemMeta}>
                      {task.status === "running" ? "In progress…" :
                       task.status === "queued" ? "Waiting…" :
                       task.status === "completed" && task.started_at && task.finished_at
                         ? `Done in ${((new Date(task.finished_at) - new Date(task.started_at)) / 1000).toFixed(1)}s`
                         : task.status === "failed" ? "Failed"
                         : "Done"}
                    </div>
                  </div>
                  {isClickable && (
                    <Eye size={13} color="var(--text-muted)" style={{ flexShrink: 0, opacity: 0.5 }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={styles.actions}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onSubmitTask}>
          <Play size={14} />
          Assign Task
        </button>
        <button
          className="btn btn-danger"
          onClick={handleTerminate}
          disabled={terminating}
          title="Remove worker"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Task result modal */}
      {selectedTask && (
        <TaskResultModal
          task={selectedTask}
          agentName={agent.name}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "rgba(18, 24, 43, 0.85)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    backdropFilter: "blur(12px)",
    transition: "box-shadow 0.3s, border-color 0.3s",
  },
  cardHeader: { display: "flex", alignItems: "center", gap: "12px" },
  agentIcon: {
    width: "44px", height: "44px",
    borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  agentInfo: { flex: 1, minWidth: 0 },
  agentName: { fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" },
  agentType: { fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" },
  description: { fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 },
  statsRow: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    background: "var(--bg-elevated)",
    borderRadius: "10px",
    overflow: "hidden",
  },
  stat: { padding: "12px 8px", textAlign: "center" },
  statValue: { fontSize: "18px", fontWeight: 700, lineHeight: 1, color: "var(--text-primary)" },
  statLabel: { fontSize: "12px", fontWeight: 500, color: "var(--text-muted)", marginTop: "4px" },
  taskSection: {
    display: "flex", flexDirection: "column", gap: "8px",
  },
  taskSectionHeader: {
    display: "flex", alignItems: "center", gap: "6px",
    fontSize: "13px", fontWeight: 600, color: "var(--text-muted)",
  },
  taskList: {
    display: "flex", flexDirection: "column", gap: "4px",
  },
  taskItem: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "8px 10px",
    background: "rgba(15, 20, 35, 0.6)",
    borderRadius: "8px",
    border: "none",
    borderLeft: "3px solid transparent",
    fontSize: "13px",
    textAlign: "left",
    width: "100%",
    transition: "background 0.15s",
    fontFamily: "inherit",
    color: "var(--text-primary)",
  },
  taskItemName: {
    fontWeight: 600, color: "var(--text-primary)", fontSize: "13px",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  taskItemMeta: {
    fontSize: "12px", color: "var(--text-muted)", marginTop: "1px",
  },
  actions: { display: "flex", gap: "8px" },
  // Compact
  compactCard: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "12px 16px",
    background: "var(--bg-elevated)",
    borderRadius: "10px",
    border: "1px solid var(--border)",
    transition: "background 0.2s",
  },
  compactIcon: {
    width: "32px", height: "32px",
    borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  compactInfo: { flex: 1 },
  compactName: { fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" },
  compactMeta: { fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" },
};
