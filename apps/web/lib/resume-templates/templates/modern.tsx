import type { ResumeData } from "../types";
import { dateRange, keywords, highlights } from "../types";

const SIDEBAR = 220;
const ACCENT = "#4f46e5";

export function ModernTemplate({ data }: { data: ResumeData }) {
  const b = data.basics;
  const works = (data.work ?? []).filter(w => w.name || w.position);
  const edus = (data.education ?? []).filter(e => e.institution);
  const skills = (data.skills ?? []).filter(s => s.name);
  const projects = (data.projects ?? []).filter(p => p.name);

  return (
    <div style={{ width: 794, minHeight: 1123, display: "flex", fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 10, color: "#1e293b", backgroundColor: "#fff" }}>
      {/* Sidebar */}
      <div style={{ width: SIDEBAR, minHeight: "100%", backgroundColor: "#1e293b", color: "#e2e8f0", padding: "40px 24px", flexShrink: 0 }}>
        {b.name && <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4, lineHeight: 1.2 }}>{b.name}</div>}
        {b.label && <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 20 }}>{b.label}</div>}

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Contact</div>
          {[b.email, b.phone, b.location, b.url].filter(Boolean).map((v, i) => (
            <div key={i} style={{ fontSize: 9, color: "#cbd5e1", marginBottom: 4, wordBreak: "break-all" }}>{v}</div>
          ))}
        </div>

        {skills.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Skills</div>
            {skills.map((s, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                {s.name && <div style={{ fontSize: 9.5, fontWeight: 600, color: "#e2e8f0", marginBottom: 3 }}>{s.name}</div>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {keywords(s.keywords).map((kw, j) => (
                    <span key={j} style={{ fontSize: 8, backgroundColor: "rgba(79,70,229,0.25)", color: "#a5b4fc", padding: "2px 6px", borderRadius: 3 }}>{kw}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {edus.length > 0 && (
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Education</div>
            {edus.map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: "#e2e8f0" }}>{e.institution}</div>
                <div style={{ fontSize: 8.5, color: "#94a3b8" }}>{[e.studyType, e.area].filter(Boolean).join(", ")}</div>
                <div style={{ fontSize: 8, color: "#64748b" }}>{dateRange(e.startDate, e.endDate)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "40px 32px" }}>
        {b.summary && (
          <div style={{ marginBottom: 24 }}>
            <SectionHead label="Profile" />
            <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.6 }}>{b.summary}</div>
          </div>
        )}

        {works.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHead label="Experience" />
            {works.map((w, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: 11, color: "#0f172a" }}>{w.position}</span>
                  <span style={{ fontSize: 9, color: "#64748b" }}>{dateRange(w.startDate, w.endDate)}</span>
                </div>
                <div style={{ fontSize: 9.5, color: ACCENT, fontWeight: 600, marginBottom: 4 }}>{w.name}</div>
                {w.summary && <div style={{ fontSize: 9.5, color: "#475569", lineHeight: 1.5 }}>{w.summary}</div>}
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div>
            <SectionHead label="Projects" />
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: 10.5, color: "#0f172a" }}>{p.name}</span>
                  {p.url && <span style={{ fontSize: 8.5, color: "#64748b" }}>{p.url}</span>}
                </div>
                {p.description && <div style={{ fontSize: 9.5, color: "#475569", lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}
                {highlights(p.highlights).map((h, j) => (
                  <div key={j} style={{ display: "flex", gap: 5, marginTop: 2 }}>
                    <span style={{ color: ACCENT, fontWeight: 700 }}>›</span>
                    <span style={{ fontSize: 9.5, color: "#475569" }}>{h}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHead({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: 1, borderBottom: `2px solid ${ACCENT}`, paddingBottom: 4, marginBottom: 10 }}>{label}</div>
  );
}
