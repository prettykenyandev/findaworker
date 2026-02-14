import { useState } from "react";
import { useStore } from "../store";
import { Users, Code, Database, Headphones, Play, Trash2, Activity, ChevronDown, ChevronUp } from "lucide-react";

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
  customer_support: { bg: "rgba(79, 110, 247, 0.08)", color: "#4f6ef7" },
  data_entry: { bg: "rgba(139, 92, 246, 0.08)", color: "#8b5cf6" },
  software_engineer: { bg: "rgba(34, 197, 94, 0.08)", color: "#22c55e" },
};

export function AgentCard({ agent, compact = false, onSubmitTask }) {
  const { terminateAgent } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [terminating, setTerminating] = useState(false);

  const Icon = AGENT_ICONS[agent.type] || Users;
  const colors = AGENT_COLORS[agent.type] || AGENT_COLORS.customer_support;
  const typeLabel = AGENT_LABELS[agent.type] || agent.type.replace(/_/g, " ");

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

      {/* Current task */}
      {agent.current_task && (
        <div style={styles.currentTask}>
          <Activity size={12} style={{ color: "var(--accent)" }} />
          <span>Working on: <strong>{agent.current_task.replace(/_/g, " ")}</strong></span>
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
        <button
          className="btn btn-secondary"
          onClick={() => setExpanded(!expanded)}
          title="View details"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded config */}
      {expanded && (
        <div style={styles.expandedConfig}>
          <div style={styles.configTitle}>Settings</div>
          <pre style={styles.configPre}>{JSON.stringify(agent.config, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    transition: "box-shadow 0.2s, border-color 0.2s",
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
  currentTask: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "8px 12px",
    background: "var(--accent-glow)",
    borderRadius: "8px",
    fontSize: "13px",
    color: "var(--text-secondary)",
  },
  actions: { display: "flex", gap: "8px" },
  expandedConfig: {
    background: "var(--bg-elevated)",
    borderRadius: "8px",
    padding: "14px",
  },
  configTitle: { fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px" },
  configPre: { fontSize: "12px", color: "var(--text-secondary)", overflow: "auto", lineHeight: 1.7 },
  // Compact
  compactCard: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "12px 16px",
    background: "var(--bg-elevated)",
    borderRadius: "10px",
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
