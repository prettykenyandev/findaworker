const COLOR_MAP = {
  cyan: { bg: "rgba(0, 229, 255, 0.08)", icon: "#00e5ff", text: "#00e5ff" },
  green: { bg: "rgba(0, 255, 136, 0.08)", icon: "#00ff88", text: "#00ff88" },
  red: { bg: "rgba(255, 51, 102, 0.06)", icon: "#ff3366", text: "#ff3366" },
  amber: { bg: "rgba(255, 184, 0, 0.08)", icon: "#ffb800", text: "#ffb800" },
  purple: { bg: "rgba(168, 85, 247, 0.08)", icon: "#a855f7", text: "#a855f7" },
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
    background: "rgba(18, 24, 43, 0.85)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "20px",
    backdropFilter: "blur(12px)",
    transition: "box-shadow 0.3s, border-color 0.3s",
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
