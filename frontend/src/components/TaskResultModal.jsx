import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Check, Code, FileText, Bug, GitPullRequest, TestTube, Database, RefreshCw, Clock, Cpu, FolderOpen, Download, ChevronRight, Layers } from "lucide-react";
import JSZip from "jszip";

/* ── helpers ────────────────────────────────────────────────────────── */

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} style={styles.copyBtn} title="Copy to clipboard">
      {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CodeBlock({ code, language }) {
  return (
    <div style={styles.codeWrapper}>
      <div style={styles.codeHeader}>
        <span style={styles.codeLang}>{language || "code"}</span>
        <CopyButton text={code} />
      </div>
      <pre style={styles.codeBlock}><code>{code}</code></pre>
    </div>
  );
}

function Badge({ children, color = "#4f6ef7" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
      background: `${color}14`, color,
    }}>
      {children}
    </span>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div style={styles.stat}>
      {Icon && <Icon size={14} color="var(--text-muted)" />}
      <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>{label}</span>
      <span style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

/* ── per-type renderers ─────────────────────────────────────────────── */

function downloadFiles(files, projectName = "code") {
  const zip = new JSZip();
  const root = projectName;
  (files || []).forEach((f) => {
    zip.file(`${root}/${f.path}`, f.content);
  });
  zip.generateAsync({ type: "blob" }).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${root}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function GenerateCodeResult({ result }) {
  return (
    <>
      <div style={styles.statsRow}>
        <Stat label="Language" value={result.language || "—"} icon={Code} />
        <Stat label="Lines" value={result.lines_generated || "—"} icon={FileText} />
        <Stat label="Model" value={result.model || "—"} icon={Cpu} />
      </div>
      <CodeBlock code={result.code} language={result.language} />
      {result.files?.length > 0 && (
        <button
          onClick={() => downloadFiles(result.files, result.type || "code")}
          style={projectStyles.downloadBtn}
        >
          <Download size={14} />
          Download as .zip
        </button>
      )}
    </>
  );
}

function ReviewPrResult({ result }) {
  const verdictColors = {
    approved: "#22c55e",
    approved_with_comments: "#f59e0b",
    changes_requested: "#ef4444",
  };
  const verdictLabels = {
    approved: "Approved",
    approved_with_comments: "Approved with Comments",
    changes_requested: "Changes Requested",
  };
  return (
    <>
      <div style={styles.statsRow}>
        <Stat label="Verdict" value={
          <Badge color={verdictColors[result.verdict] || "#4f6ef7"}>
            {verdictLabels[result.verdict] || result.verdict}
          </Badge>
        } />
        <Stat label="Score" value={`${result.score ?? "—"}/100`} icon={FileText} />
        <Stat label="Security Issues" value={result.security_issues ?? 0} icon={Bug} />
        <Stat label="Perf Flags" value={result.performance_flags ?? 0} icon={RefreshCw} />
      </div>
      {result.summary && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Summary</h4>
          <p style={styles.prose}>{result.summary}</p>
        </div>
      )}
      {result.comments?.length > 0 && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Comments ({result.comments.length})</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {result.comments.map((c, i) => (
              <div key={i} style={styles.commentCard}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                  {c.file && <Badge color="#6366f1">{c.file}</Badge>}
                  {c.line && <Badge color="#8b5cf6">Line {c.line}</Badge>}
                  {c.type && <Badge color={c.type === "error" ? "#ef4444" : c.type === "warning" ? "#f59e0b" : "#6b7280"}>{c.type}</Badge>}
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-primary)" }}>{c.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function WriteTestsResult({ result }) {
  const ext = (result.framework === "jest") ? "js" : "py";
  const filename = `test_suite.${ext}`;
  return (
    <>
      <div style={styles.statsRow}>
        <Stat label="Tests" value={result.test_count || "—"} icon={TestTube} />
        <Stat label="Coverage" value={result.coverage_estimate || "—"} icon={FileText} />
        <Stat label="Framework" value={result.framework || "—"} icon={Code} />
        <Stat label="Model" value={result.model || "—"} icon={Cpu} />
      </div>
      <CodeBlock code={result.test_code} language={result.framework === "jest" ? "javascript" : "python"} />
      <button
        onClick={() => downloadFiles([{ path: filename, content: result.test_code }], "tests")}
        style={projectStyles.downloadBtn}
      >
        <Download size={14} />
        Download as .zip
      </button>
    </>
  );
}

function DetectBugsResult({ result }) {
  const severityColors = { critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#6b7280" };
  return (
    <>
      <div style={styles.statsRow}>
        <Stat label="Quality Score" value={`${result.code_quality_score ?? "—"}/100`} icon={FileText} />
        <Stat label="Bugs Found" value={result.bugs?.length ?? 0} icon={Bug} />
        <Stat label="Lines Scanned" value={result.lines_scanned ?? "—"} icon={Code} />
        <Stat label="Model" value={result.model || "—"} icon={Cpu} />
      </div>
      {result.summary && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Summary</h4>
          <p style={styles.prose}>{result.summary}</p>
        </div>
      )}
      {result.bugs?.length > 0 && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Bugs</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {result.bugs.map((b, i) => (
              <div key={i} style={styles.commentCard}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                  <Badge color={severityColors[b.severity] || "#6b7280"}>{b.severity || "info"}</Badge>
                  {b.type && <Badge color="#6366f1">{b.type}</Badge>}
                  {b.line && <Badge color="#8b5cf6">Line {b.line}</Badge>}
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-primary)" }}>{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function GenerateDocsResult({ result }) {
  return (
    <>
      <div style={styles.statsRow}>
        <Stat label="Type" value={result.doc_type || "docs"} icon={FileText} />
        <Stat label="Words" value={result.word_count || "—"} icon={FileText} />
        <Stat label="Model" value={result.model || "—"} icon={Cpu} />
      </div>
      <div style={styles.docBlock}>
        <CopyButton text={result.documentation} />
        <pre style={styles.docPre}>{result.documentation}</pre>
      </div>
      <button
        onClick={() => downloadFiles([{ path: "DOCUMENTATION.md", content: result.documentation || "" }], "docs")}
        style={projectStyles.downloadBtn}
      >
        <Download size={14} />
        Download as .zip
      </button>
    </>
  );
}

function RefactorResult({ result }) {
  return (
    <>
      <div style={styles.statsRow}>
        <Stat label="Breaking Changes" value={result.breaking_changes ? "Yes" : "No"} icon={Bug} />
        <Stat label="Complexity Δ" value={result.complexity_reduction || "—"} icon={RefreshCw} />
        <Stat label="Model" value={result.model || "—"} icon={Cpu} />
      </div>
      {result.improvements_made?.length > 0 && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Improvements Made</h4>
          <ul style={styles.list}>
            {result.improvements_made.map((imp, i) => (
              <li key={i} style={styles.listItem}>{imp}</li>
            ))}
          </ul>
        </div>
      )}
      <CodeBlock code={result.refactored_code} language="python" />
      <button
        onClick={() => downloadFiles([{ path: "refactored.py", content: result.refactored_code || "" }], "refactored")}
        style={projectStyles.downloadBtn}
      >
        <Download size={14} />
        Download as .zip
      </button>
    </>
  );
}

function MigrationResult({ result }) {
  return (
    <>
      <div style={styles.statsRow}>
        <Stat label="Table" value={result.table || "—"} icon={Database} />
        <Stat label="Columns" value={result.column_count || "—"} icon={FileText} />
        <Stat label="Model" value={result.model || "—"} icon={Cpu} />
      </div>
      <CodeBlock code={result.sql || result.migration_sql} language="sql" />
      <button
        onClick={() => downloadFiles([{ path: `migrate_${result.table || "table"}.sql`, content: result.sql || result.migration_sql || "" }], "migration")}
        style={projectStyles.downloadBtn}
      >
        <Download size={14} />
        Download as .zip
      </button>
    </>
  );
}

function GenericResult({ result }) {
  const text = typeof result === "string" ? result : JSON.stringify(result, null, 2);
  return (
    <div style={styles.codeWrapper}>
      <div style={styles.codeHeader}>
        <span style={styles.codeLang}>result</span>
        <CopyButton text={text} />
      </div>
      <pre style={styles.codeBlock}><code>{text}</code></pre>
    </div>
  );
}

/* ── project file explorer ───────────────────────────────────────────── */

function getFileIcon(path) {
  if (path.endsWith(".md")) return "📖";
  if (path.endsWith(".json")) return "📦";
  if (path.endsWith(".py")) return "🐍";
  if (path.endsWith(".js") || path.endsWith(".jsx") || path.endsWith(".ts") || path.endsWith(".tsx")) return "🟨";
  if (path.endsWith(".css") || path.endsWith(".scss")) return "🎨";
  if (path.endsWith(".html")) return "🌐";
  if (path.endsWith(".sql")) return "🗃️";
  if (path.endsWith(".env") || path.endsWith(".gitignore") || path.endsWith(".yml") || path.endsWith(".yaml")) return "⚙️";
  if (path.endsWith(".txt") || path.endsWith(".toml") || path.endsWith(".cfg")) return "📄";
  return "💾";
}

function getLangFromPath(path) {
  const ext = path.split(".").pop();
  const map = { py: "python", js: "javascript", jsx: "jsx", ts: "typescript", tsx: "tsx", sql: "sql", json: "json", md: "markdown", html: "html", css: "css", yml: "yaml", yaml: "yaml", sh: "bash", toml: "toml" };
  return map[ext] || ext;
}

function downloadProject(result) {
  const root = result.project_name || "project";
  const files = [...(result.files || [])];

  // Add README if not already in the file list
  if (result.setup_instructions) {
    const readme = files.find((f) => f.path.toLowerCase() === "readme.md");
    if (!readme) {
      files.push({ path: "README.md", content: `# ${root}\n\n${result.summary || ""}\n\n## Setup\n\n${result.setup_instructions}\n` });
    }
  }

  downloadFiles(files, root);
}

function GenerateProjectResult({ result }) {
  const files = result.files || [];
  const [activeIdx, setActiveIdx] = useState(0);
  const activeFile = files[activeIdx] || null;

  return (
    <div>
      {/* Summary stats */}
      <div style={styles.statsRow}>
        <Stat label="Project" value={result.project_name || "—"} icon={Layers} />
        <Stat label="Files" value={result.file_count || files.length} icon={FolderOpen} />
        <Stat label="Total Lines" value={result.total_lines || "—"} icon={FileText} />
        <Stat label="Model" value={result.model || "—"} icon={Cpu} />
      </div>

      {result.summary && (
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 16px" }}>
          {result.summary}
        </p>
      )}

      {/* File explorer */}
      <div style={projectStyles.container}>
        {/* Sidebar */}
        <div style={projectStyles.sidebar}>
          <div style={projectStyles.sidebarHeader}>
            <FolderOpen size={14} color="var(--text-muted)" />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Files</span>
          </div>
          {files.map((f, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              style={{
                ...projectStyles.fileItem,
                background: i === activeIdx ? "#4f6ef70d" : "transparent",
                borderLeft: i === activeIdx ? "2px solid #4f6ef7" : "2px solid transparent",
                color: i === activeIdx ? "#4f6ef7" : "var(--text-primary)",
              }}
            >
              <span style={{ fontSize: "14px", lineHeight: 1 }}>{getFileIcon(f.path)}</span>
              <span style={{ fontSize: "12px", fontWeight: i === activeIdx ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {f.path}
              </span>
            </button>
          ))}
        </div>

        {/* Code viewer */}
        <div style={projectStyles.viewer}>
          {activeFile ? (
            <>
              <div style={projectStyles.viewerHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px" }}>{getFileIcon(activeFile.path)}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{activeFile.path}</span>
                  <Badge color="#6b7280">{getLangFromPath(activeFile.path)}</Badge>
                  <Badge color="#6b7280">{activeFile.content.split("\n").length} lines</Badge>
                </div>
                <CopyButton text={activeFile.content} />
              </div>
              <pre style={projectStyles.code}><code>{activeFile.content}</code></pre>
            </>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Select a file</div>
          )}
        </div>
      </div>

      {/* Setup instructions */}
      {result.setup_instructions && (
        <div style={{ ...styles.section, marginTop: "16px" }}>
          <h4 style={styles.sectionTitle}>🚀 Setup Instructions</h4>
          <pre style={{ ...styles.codeBlock, background: "#f9fafb", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px" }}>
            {result.setup_instructions}
          </pre>
        </div>
      )}

      {/* Download button */}
      <button
        onClick={() => downloadProject(result)}
        style={projectStyles.downloadBtn}
      >
        <Download size={14} />
        Download All Files
      </button>
    </div>
  );
}

/* ── type → renderer mapping ────────────────────────────────────────── */

const RENDERERS = {
  generate_code: GenerateCodeResult,
  generate_project: GenerateProjectResult,
  review_pr: ReviewPrResult,
  write_tests: WriteTestsResult,
  detect_bugs: DetectBugsResult,
  generate_docs: GenerateDocsResult,
  refactor: RefactorResult,
  generate_migration: MigrationResult,
};

const TYPE_ICONS = {
  generate_code: Code,
  generate_project: Layers,
  review_pr: GitPullRequest,
  write_tests: TestTube,
  detect_bugs: Bug,
  generate_docs: FileText,
  refactor: RefreshCw,
  generate_migration: Database,
};

const TYPE_LABELS = {
  generate_code: "Generated Code",
  generate_project: "Generated Project",
  review_pr: "PR Review",
  write_tests: "Test Suite",
  detect_bugs: "Bug Report",
  generate_docs: "Documentation",
  refactor: "Refactored Code",
  generate_migration: "SQL Migration",
};

/* ── main modal ─────────────────────────────────────────────────────── */

export function TaskResultModal({ task, agentName, onClose }) {
  if (!task) return null;

  const Renderer = RENDERERS[task.type] || GenericResult;
  const TypeIcon = TYPE_ICONS[task.type] || FileText;
  const typeLabel = TYPE_LABELS[task.type] || task.type;
  const isWide = task.type === "generate_project";
  const duration = task.finished_at && task.started_at
    ? `${((new Date(task.finished_at) - new Date(task.started_at)) / 1000).toFixed(1)}s`
    : null;

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modal, ...(isWide ? { width: "min(1100px, 95vw)" } : {}) }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={styles.iconWrap}>
              <TypeIcon size={20} color="#4f6ef7" />
            </div>
            <div>
              <h2 style={styles.modalTitle}>{typeLabel}</h2>
              <p style={styles.modalSubtitle}>
                Task #{task.id} · {agentName || task.agent_id}
                {duration && <> · <Clock size={12} style={{ marginBottom: "-2px" }} /> {duration}</>}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={styles.modalBody}>
          {task.error ? (
            <div style={styles.errorBlock}>
              <Bug size={16} color="#ef4444" />
              <span>{task.error}</span>
            </div>
          ) : task.result ? (
            <Renderer result={task.result} />
          ) : (
            <div style={styles.pending}>
              <div className="animate-spin" style={{ width: 24, height: 24, border: "3px solid var(--border)", borderTopColor: "#4f6ef7", borderRadius: "50%" }} />
              <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>Task is still running…</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── styles ─────────────────────────────────────────────────────────── */

const styles = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#fff", borderRadius: "16px",
    width: "min(780px, 92vw)", maxHeight: "min(82vh, 800px)",
    display: "flex", flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 24px", borderBottom: "1px solid var(--border)",
  },
  iconWrap: {
    width: "40px", height: "40px", borderRadius: "10px",
    background: "#4f6ef714", display: "flex", alignItems: "center", justifyContent: "center",
  },
  modalTitle: { fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", margin: 0 },
  modalSubtitle: { fontSize: "13px", color: "var(--text-muted)", margin: "2px 0 0" },
  closeBtn: {
    background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
    padding: "6px", borderRadius: "8px",
  },
  modalBody: {
    padding: "24px", overflowY: "auto", flex: 1,
  },

  /* Stats row */
  statsRow: {
    display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "20px",
  },
  stat: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "8px 14px", background: "#f9fafb", borderRadius: "8px",
    border: "1px solid var(--border)",
  },

  /* Sections */
  section: { marginBottom: "20px" },
  sectionTitle: {
    fontSize: "14px", fontWeight: 600, color: "var(--text-primary)",
    margin: "0 0 10px",
  },
  prose: { fontSize: "14px", lineHeight: 1.65, color: "var(--text-secondary)", margin: 0 },

  /* Code */
  codeWrapper: {
    border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden",
    marginBottom: "16px",
  },
  codeHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 14px", background: "#f6f8fa", borderBottom: "1px solid var(--border)",
  },
  codeLang: { fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" },
  codeBlock: {
    margin: 0, padding: "16px", fontSize: "13px", lineHeight: 1.6,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    background: "#fafbfc", overflowX: "auto", color: "#1e293b",
    whiteSpace: "pre-wrap", wordBreak: "break-word",
  },
  copyBtn: {
    display: "flex", alignItems: "center", gap: "4px",
    background: "none", border: "1px solid var(--border)", borderRadius: "6px",
    padding: "4px 10px", fontSize: "12px", color: "var(--text-muted)",
    cursor: "pointer",
  },

  /* Docs */
  docBlock: {
    position: "relative", border: "1px solid var(--border)", borderRadius: "10px",
    overflow: "hidden",
  },
  docPre: {
    margin: 0, padding: "20px", fontSize: "14px", lineHeight: 1.7,
    fontFamily: "'Inter', sans-serif", background: "#fafbfc",
    whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#1e293b",
  },

  /* Comments / bugs */
  commentCard: {
    padding: "12px 14px", background: "#f9fafb", borderRadius: "8px",
    border: "1px solid var(--border)",
  },

  /* Lists */
  list: { margin: 0, paddingLeft: "20px" },
  listItem: { fontSize: "13px", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: "4px" },

  /* Error */
  errorBlock: {
    display: "flex", alignItems: "flex-start", gap: "10px",
    padding: "16px", background: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: "10px", color: "#b91c1c", fontSize: "14px",
  },

  /* Pending */
  pending: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "48px", textAlign: "center",
  },
};

/* ── project explorer styles ────────────────────────────────────────── */

const projectStyles = {
  container: {
    display: "flex", border: "1px solid var(--border)", borderRadius: "10px",
    overflow: "hidden", height: "420px",
  },
  sidebar: {
    width: "220px", minWidth: "220px", borderRight: "1px solid var(--border)",
    background: "#f9fafb", overflowY: "auto", display: "flex", flexDirection: "column",
  },
  sidebarHeader: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "12px 14px", borderBottom: "1px solid var(--border)",
  },
  fileItem: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "8px 12px", border: "none", cursor: "pointer",
    textAlign: "left", transition: "all 0.1s", width: "100%",
    background: "transparent",
  },
  viewer: {
    flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
    background: "#fafbfc",
  },
  viewerHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 16px", borderBottom: "1px solid var(--border)",
    background: "#f6f8fa", flexShrink: 0,
  },
  code: {
    margin: 0, padding: "16px", fontSize: "13px", lineHeight: 1.6,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    overflowY: "auto", overflowX: "auto", flex: 1,
    color: "#1e293b", whiteSpace: "pre", tabSize: 2,
  },
  downloadBtn: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "10px 20px", marginTop: "16px",
    background: "#4f6ef7", color: "#fff", border: "none",
    borderRadius: "8px", fontSize: "13px", fontWeight: 600,
    cursor: "pointer", transition: "background 0.15s",
  },
};
