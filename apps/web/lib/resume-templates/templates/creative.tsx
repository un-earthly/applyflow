import type { ResumeData } from "../types";
import { dateRange, keywords } from "../types";

export function CreativeTemplate({ data }: { data: ResumeData }) {
  const b = data.basics;
  const works = (data.work ?? []).filter(w => w.name || w.position);
  const edus = (data.education ?? []).filter(e => e.institution);
  const skills = (data.skills ?? []).filter(s => s.name);
  const projects = (data.projects ?? []).filter(p => p.name);

  return (
    <div style={{ width: 794, minHeight: 1123, fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 10, color: "#1a1a2e", backgroundColor: "#fff", display: "flex" }}>
      {/* Left accent bar */}
      <div style={{ width: 8, background: "linear-gradient(to bottom, #0ea5e9, #8b5cf6, #ec4899)", flexShrink: 0 }} />

      <div style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", color: "#fff", padding: "40px 48px 32px" }}>
          {b.name && <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, letterSpacing: -0.5 }}>{b.name}</div>}
          {b.label && <div style={{ fontSize: 12, color: "#a5b4fc", marginBottom: 16, fontWeight: 500 }}>{b.label}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px", fontSize: 9 }}>
            {b.email && <Chip label="✉" value={b.email} />}
            {b.phone && <Chip label="📞" value={b.phone} />}
            {b.location && <Chip label="📍" value={b.location} />}
            {b.url && <Chip label="🌐" value={b.url} />}
          </div>
        </div>

        <div style={{ padding: "32px 48px" }}>
          {b.summary && (
            <div style={{ marginBottom: 24, padding: "16px 20px", background: "linear-gradient(135deg, #eff6ff, #faf5ff)", borderRadius: 8, border: "1px solid #e0e7ff" }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>About</div>
              <div style={{ fontSize: 10, color: "#374151", lineHeight: 1.7 }}>{b.summary}</div>
            </div>
          )}

          {works.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <CHead label="Experience" color="#0ea5e9" />
              {works.map((w, i) => (
                <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 4, background: i === 0 ? "#0ea5e9" : "#e2e8f0", borderRadius: 2, flexShrink: 0, alignSelf: "stretch" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontWeight: 700, fontSize: 11 }}>{w.position}</span>
                      <span style={{ fontSize: 9, color: "#94a3b8" }}>{dateRange(w.startDate, w.endDate)}</span>
                    </div>
                    <div style={{ fontSize: 9.5, color: "#6366f1", fontWeight: 600, marginBottom: 4 }}>{w.name}</div>
                    {w.summary && <div style={{ fontSize: 9.5, color: "#475569", lineHeight: 1.6 }}>{w.summary}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            {edus.length > 0 && (
              <div>
                <CHead label="Education" color="#8b5cf6" />
                {edus.map((e, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 10.5 }}>{e.institution}</div>
                    <div style={{ fontSize: 9.5, color: "#6b7280" }}>{[e.studyType, e.area].filter(Boolean).join(", ")}</div>
                    <div style={{ fontSize: 9, color: "#9ca3af" }}>{dateRange(e.startDate, e.endDate)}</div>
                  </div>
                ))}
              </div>
            )}

            {skills.length > 0 && (
              <div>
                <CHead label="Skills" color="#ec4899" />
                {skills.map((s, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#374151", marginBottom: 4 }}>{s.name}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                      {keywords(s.keywords).map((kw, j) => (
                        <span key={j} style={{ fontSize: 7.5, backgroundColor: "#fdf2f8", color: "#be185d", padding: "2px 6px", borderRadius: 10, border: "1px solid #fbcfe8" }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {projects.length > 0 && (
            <div>
              <CHead label="Projects" color="#0ea5e9" />
              {projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 10, padding: "10px 14px", backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 700, fontSize: 10.5, marginBottom: 2 }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: 9.5, color: "#475569", lineHeight: 1.5 }}>{p.description}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return <span style={{ color: "#cbd5e1", fontSize: 9 }}>{label} {value}</span>;
}

function CHead({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ display: "inline-block", width: 20, height: 2, backgroundColor: color, borderRadius: 1 }} />
      {label}
    </div>
  );
}
