import { useStore } from "../store";
import { AgentCard } from "../components/AgentCard";
import { TaskFeed } from "../components/TaskFeed";
import { MetricCard } from "../components/MetricCard";
import { ThroughputChart } from "../components/ThroughputChart";
import { Users, CheckCircle, AlertTriangle, Zap, TrendingUp, Clock } from "lucide-react";

export function Dashboard() {
  const { agents, tasks, metrics } = useStore();

  const m = metrics || {
    agents: { total: 0, running: 0, idle: 0 },
    tasks: { total: 0, completed: 0, failed: 0, running: 0, success_rate: 0 },
    throughput: { per_minute: 0, per_5_minutes: 0 },
  };

  const recentTasks = tasks.slice(0, 15);
  const runningAgents = agents.filter((a) => a.status === "running");

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header} className="page-header">
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Here's what's happening with your AI workforce today</p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.liveIndicator}>
            <span className="dot dot-green" />
            <span style={{ color: "var(--green)", fontSize: "13px", fontWeight: 600 }}>Live</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div style={styles.kpiGrid} className="kpi-grid">
        <MetricCard
          label="Active Workers"
          value={m.agents.running}
          subtitle={`${m.agents.total} total hired`}
          icon={<Users size={18} />}
          color="cyan"
          trend="+2 this week"
        />
        <MetricCard
          label="Tasks Done"
          value={m.tasks.completed.toLocaleString()}
          subtitle={`${m.tasks.running} in progress`}
          icon={<CheckCircle size={18} />}
          color="green"
          trend={`${m.tasks.success_rate}% success`}
        />
        <MetricCard
          label="Issues"
          value={m.tasks.failed}
          subtitle={m.tasks.failed === 0 ? "Everything looks good!" : "Needs attention"}
          icon={<AlertTriangle size={18} />}
          color={m.tasks.failed > 10 ? "red" : "amber"}
          trend={m.tasks.failed === 0 ? "All clear" : "Review needed"}
        />
        <MetricCard
          label="Speed"
          value={m.throughput.per_minute}
          subtitle="tasks per minute"
          icon={<Zap size={18} />}
          color="purple"
          trend={`${m.throughput.per_5_minutes} in last 5 min`}
        />
      </div>

      {/* Main content grid */}
      <div style={styles.contentGrid} className="content-grid">
        {/* Left column */}
        <div style={styles.leftCol}>
          {/* Active workers */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>
                <Users size={16} />
                Your Workers
              </div>
              <span className="tag">{runningAgents.length} online</span>
            </div>
            {runningAgents.length === 0 ? (
              <div style={styles.emptyState}>
                <Users size={40} style={{ opacity: 0.15, marginBottom: "12px" }} />
                <p style={{ fontSize: "15px", fontWeight: 600 }}>No workers hired yet</p>
                <p style={{ color: "var(--text-muted)", marginTop: "4px", fontSize: "14px" }}>Click "Hire a Worker" to get started</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {runningAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} compact />
                ))}
              </div>
            )}
          </div>

          {/* Throughput chart */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>
                <TrendingUp size={16} />
                Work Output
              </div>
            </div>
            <ThroughputChart tasks={tasks} />
          </div>
        </div>

        {/* Right column - task feed */}
        <div style={styles.rightCol}>
          <div style={{ ...styles.section, height: "100%" }}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>
                <Clock size={16} />
                Recent Activity
              </div>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {tasks.length} total
              </span>
            </div>
            <TaskFeed tasks={recentTasks} />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  title: {
    fontSize: "28px",
    fontWeight: 800,
    color: "var(--text-primary)",
  },
  subtitle: {
    color: "var(--text-muted)",
    fontSize: "15px",
    marginTop: "4px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 14px",
    background: "var(--green-dim)",
    borderRadius: "20px",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: "16px",
    flex: 1,
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
  },
  section: {
    background: "#ffffff",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "20px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
    color: "var(--text-secondary)",
    fontSize: "14px",
    textAlign: "center",
  },
};
