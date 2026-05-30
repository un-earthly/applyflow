import type { ResumeData } from "../types";
import { dateRange, keywords, highlights } from "../types";

export function MinimalTemplate({ data }: { data: ResumeData }) {
  const b = data.basics;
  const works = (data.work ?? []).filter(w => w.name || w.position);
  const edus = (data.education ?? []).filter(e => e.institution);
  const skills = (data.skills ?? []).filter(s => s.name);
  const projects = (data.projects ?? []).filter(p => p.name);

  return (
    <div style={{ width: 794, minHeight: 1123, fontFamily: "'Inter', 'Helvetica Neue', sans-serif", fontSize: 10, color: "#1a1a1a", backgroundColor: "#fff", padding: "60px 72px" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        {b.name && <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: -1, marginBottom: 4, color: "#000" }}>{b.name}</div>}
        {b.label && <div style={{ fontSize: 12, color: "#888", fontWeight: 400, marginBottom: 12 }}>{b.label}</div>}
        <div style={{ display: "flex", gap: 20, fontSize: 9, color: "#666" }}>
          {[b.email, b.phone, b.location, b.url].filter(Boolean).map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>
      </div>

      {b.summary && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", marginBottom: 10 }}>About</div>
          <div style={{ fontSize: 10.5, color: "#444", lineHeight: 1.7 }}>{b.summary}</div>
        </div>
      )}

      {works.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", marginBottom: 12 }}>Experience</div>
          {works.map((w, i) => (
            <div key={i} style={{ display: "flex", gap: 24, marginBottom: 16 }}>
              <div style={{ width: 100, flexShrink: 0, fontSize: 9, color: "#999", paddingTop: 1, lineHeight: 1.5 }}>{dateRange(w.startDate, w.endDate)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 10.5, marginBottom: 1 }}>{w.position}</div>
                <div style={{ fontSize: 9.5, color: "#666", marginBottom: 4 }}>{w.name}</div>
                {w.summary && <div style={{ fontSize: 9.5, color: "#555", lineHeight: 1.6 }}>{w.summary}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {edus.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", marginBottom: 12 }}>Education</div>
          {edus.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 24, marginBottom: 12 }}>
              <div style={{ width: 100, flexShrink: 0, fontSize: 9, color: "#999", paddingTop: 1 }}>{dateRange(e.startDate, e.endDate)}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 10.5, marginBottom: 1 }}>{e.institution}</div>
                <div style={{ fontSize: 9.5, color: "#666" }}>{[e.studyType, e.area].filter(Boolean).join(", ")}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", marginBottom: 12 }}>Skills</div>
          {skills.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 24, marginBottom: 6 }}>
              <div style={{ width: 100, flexShrink: 0, fontSize: 9.5, color: "#444", fontWeight: 500 }}>{s.name}</div>
              <div style={{ fontSize: 9.5, color: "#777" }}>{s.keywords}</div>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", marginBottom: 12 }}>Projects</div>
          {projects.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 24, marginBottom: 14 }}>
              <div style={{ width: 100, flexShrink: 0, fontSize: 9, color: "#999", paddingTop: 1 }}>{p.url ?? ""}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 10.5, marginBottom: 2 }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 9.5, color: "#555", lineHeight: 1.6 }}>{p.description}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
