const COLOR_MAP = {
  cyan: { bg: "rgba(79, 110, 247, 0.08)", icon: "#4f6ef7", text: "#4f6ef7" },
  green: { bg: "rgba(34, 197, 94, 0.08)", icon: "#22c55e", text: "#22c55e" },
  red: { bg: "rgba(239, 68, 68, 0.06)", icon: "#ef4444", text: "#ef4444" },
  amber: { bg: "rgba(245, 158, 11, 0.08)", icon: "#f59e0b", text: "#f59e0b" },
  purple: { bg: "rgba(139, 92, 246, 0.08)", icon: "#8b5cf6", text: "#8b5cf6" },
};

export function MetricCard({ label, value, subtitle, icon, color = "cyan", trend }) {
  const c = COLOR_MAP[color] || COLOR_MAP.cyan;

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <div style={{ ...styles.iconWrap, background: c.bg, color: c.icon }}>
          {icon}
        </div>
        {trend && (
          <span style={{ ...styles.trend, color: c.text, background: c.bg }}>
            {trend}
          </span>
        )}
      </div>
      <div style={{ ...styles.value, color: "var(--text-primary)" }}>{value}</div>
      <div style={styles.label}>{label}</div>
      {subtitle && <div style={styles.subtitle}>{subtitle}</div>}
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "20px",
    transition: "box-shadow 0.2s",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "14px",
  },
  iconWrap: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  trend: {
    fontSize: "12px",
    fontWeight: 500,
    padding: "4px 10px",
    borderRadius: "20px",
  },
  value: {
    fontSize: "32px",
    fontWeight: 800,
    lineHeight: 1,
    marginBottom: "4px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  subtitle: {
    fontSize: "13px",
    color: "var(--text-muted)",
    marginTop: "2px",
  },
};
