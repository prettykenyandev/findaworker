import { useState } from "react";
import { useStore } from "../store";
import { X, Headphones, Database, Code, Check, Info } from "lucide-react";

function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", marginLeft: "6px", cursor: "help" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Info size={14} color="var(--text-muted)" />
      {show && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "0",
          background: "#1e293b", color: "#fff", fontSize: "12px", fontWeight: 500, lineHeight: 1.5,
          padding: "8px 12px", borderRadius: "8px", whiteSpace: "nowrap", zIndex: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", pointerEvents: "none",
        }}>{text}</span>
      )}
    </span>
  );
}

const TASK_LABELS = {
  triage_ticket: "Triage Tickets",
  draft_response: "Draft Responses",
  analyze_sentiment: "Sentiment Analysis",
  bulk_classify: "Bulk Classify",
  respond_to_dm: "Reply to DMs",
  reply_to_comment: "Reply to Comments",
  handle_review: "Handle Reviews",
  social_monitor: "Social Monitoring",
  extract_fields: "Extract Fields",
  validate_records: "Validate Records",
  transform_data: "Transform Data",
  enrich_records: "Enrich Records",
  deduplicate: "Deduplicate",
  parse_document: "Parse Documents",
  generate_code: "Generate Code",
  generate_project: "Generate Project",
  review_pr: "Review PRs",
  write_tests: "Write Tests",
  detect_bugs: "Detect Bugs",
  generate_docs: "Generate Docs",
  refactor: "Refactor Code",
};

const AGENT_TYPES = [
  {
    id: "customer_support",
    label: "Customer Support",
    icon: Headphones,
    color: "#4f6ef7",
    colorBg: "#eef1fe",
    description: "Handles tickets, drafts replies, manages social media conversations & reviews",
    tasks: ["triage_ticket", "draft_response", "analyze_sentiment", "bulk_classify", "respond_to_dm", "reply_to_comment", "handle_review", "social_monitor"],
    defaultConfig: { categories: ["billing", "technical", "general"], auto_resolve_threshold: 0.85, escalation_enabled: true, social_platforms: ["twitter", "instagram", "facebook", "tiktok", "linkedin"], social_auto_reply: true, social_tone: "friendly" },
  },
  {
    id: "data_entry",
    label: "Data Entry",
    icon: Database,
    color: "#8b5cf6",
    colorBg: "#f3f0ff",
    description: "Extracts, validates, transforms, and enriches your structured data",
    tasks: ["extract_fields", "validate_records", "transform_data", "enrich_records", "deduplicate", "parse_document"],
    defaultConfig: { output_format: "json", error_threshold: 0.05 },
  },
  {
    id: "software_engineer",
    label: "Software Engineer",
    icon: Code,
    color: "#22c55e",
    colorBg: "#f0fdf4",
    description: "Generates code, reviews PRs, writes tests, and finds bugs for you",
    tasks: ["generate_code", "generate_project", "review_pr", "write_tests", "detect_bugs", "generate_docs", "refactor"],
    defaultConfig: { languages: ["python", "typescript"], test_coverage_target: 80 },
  },
];

export function DeployModal({ onClose }) {
  const { deployAgent, addNotification } = useStore();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const handleDeploy = async () => {
    if (!name.trim() || !description.trim()) return;
    setDeploying(true);
    try {
      const typeConfig = AGENT_TYPES.find(t => t.id === selectedType);
      await deployAgent({
        agent_type: selectedType,
        name: name.trim(),
        description: description || typeConfig?.description,
        config: typeConfig?.defaultConfig || {},
      });
      setDeployed(true);
      addNotification({ type: "success", message: `${name} has been hired and is ready to work!` });
      setTimeout(onClose, 1500);
    } catch (err) {
      addNotification({ type: "error", message: `Failed to hire: ${err.message}` });
      setDeploying(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} className="animate-fadeInUp">
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={styles.headerTitle}>
                {step === 1 ? "Choose a Worker" : "Set Up Your Worker"}
              </span>
              <Tooltip text={step === 1 ? "Pick the type of AI worker you need" : "Give your worker a name and describe what it should do"} />
            </div>
            <div style={styles.headerSub}>Step {step} of 2</div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {/* Progress bar */}
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: step === 1 ? "50%" : "100%" }} />
        </div>

        {/* Step 1 - Type selection */}
        {step === 1 && (
          <div style={styles.typeGrid}>
            {AGENT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  style={{
                    ...styles.typeCard,
                    borderColor: isSelected ? type.color : "var(--border)",
                    background: isSelected ? type.colorBg : "#ffffff",
                  }}
                  onClick={() => setSelectedType(type.id)}
                >
                  <div style={{ ...styles.typeIcon, color: type.color, background: type.colorBg }}>
                    <Icon size={22} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={styles.typeLabel}>{type.label}</span>
                    <Tooltip text={`Handles ${type.tasks.length} task types for your team`} />
                  </div>
                  <div style={styles.typeDesc}>{type.description}</div>
                  <div style={styles.typeTasks}>
                    {type.tasks.slice(0, 3).map(t => (
                      <span key={t} className="tag">{TASK_LABELS[t] || t}</span>
                    ))}
                    {type.tasks.length > 3 && (
                      <span className="tag">+{type.tasks.length - 3} more</span>
                    )}
                  </div>
                  {isSelected && (
                    <div style={styles.selectedCheck}>
                      <Check size={14} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2 - Configure */}
        {step === 2 && (
          <div style={styles.configForm}>
            {deployed ? (
              <div style={styles.successState}>
                <div style={styles.successIcon}><Check size={28} color="#22c55e" /></div>
                <div style={styles.successText}>Worker Hired!</div>
                <div style={styles.successSub}>{name} is now online and ready to work</div>
              </div>
            ) : (
              <>
                <div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <label className="label" style={{ margin: 0 }}>Worker Name *</label>
                    <Tooltip text="A friendly name to identify this worker on your dashboard" />
                  </div>
                  <input
                    className="input"
                    style={{ marginTop: "6px" }}
                    placeholder="e.g., Support Team Lead"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <label className="label" style={{ margin: 0 }}>Description *</label>
                    <Tooltip text="Describe what this worker should focus on so you can keep track" />
                  </div>
                  <input
                    className="input"
                    style={{ marginTop: "6px" }}
                    placeholder="e.g., Handles billing tickets and social media DMs"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        {!deployed && (
          <div style={styles.footer}>
            {step === 2 && (
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step === 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setStep(2)}
                disabled={!selectedType}
              >
                Continue
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleDeploy}
                disabled={deploying || !name.trim() || !description.trim()}
              >
                {deploying ? "Hiring..." : "Hire Worker"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(6px)",
    zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px",
  },
  modal: {
    width: "100%", maxWidth: "680px",
    background: "#ffffff",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
    overflow: "hidden",
  },
  header: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    padding: "28px 28px 0",
  },
  headerTitle: {
    fontSize: "20px", fontWeight: 700,
    color: "var(--text-primary)",
  },
  headerSub: { fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" },
  closeBtn: {
    background: "none", border: "none",
    color: "var(--text-muted)", cursor: "pointer",
    padding: "6px", borderRadius: "8px",
    transition: "color 0.15s",
  },
  progressBar: {
    height: "3px", background: "var(--border)",
    margin: "20px 28px 0",
    borderRadius: "2px",
  },
  progressFill: {
    height: "100%", background: "var(--accent)",
    transition: "width 0.3s ease",
    borderRadius: "2px",
  },
  typeGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px", padding: "24px 28px",
  },
  typeCard: {
    display: "flex", flexDirection: "column", gap: "10px",
    padding: "18px", border: "2px solid",
    borderRadius: "12px", cursor: "pointer",
    textAlign: "left", transition: "all 0.15s",
    position: "relative",
  },
  typeIcon: {
    width: "44px", height: "44px",
    borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  typeLabel: { fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" },
  typeDesc: { fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 },
  typeTasks: { display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" },
  selectedCheck: {
    position: "absolute", top: "12px", right: "12px",
    width: "24px", height: "24px",
    background: "#f0fdf4", border: "2px solid #22c55e",
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#22c55e",
  },
  configForm: { display: "flex", flexDirection: "column", gap: "18px", padding: "24px 28px" },
  footer: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "18px 28px",
    borderTop: "1px solid var(--border)",
    background: "#f9fafb",
  },
  successState: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "40px", textAlign: "center", gap: "14px",
  },
  successIcon: {
    width: "64px", height: "64px",
    background: "#f0fdf4", border: "2px solid #22c55e",
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  successText: { fontSize: "22px", fontWeight: 700, color: "#22c55e" },
  successSub: { fontSize: "14px", color: "var(--text-secondary)" },
};
