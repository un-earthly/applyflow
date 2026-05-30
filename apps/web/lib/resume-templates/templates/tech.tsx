import type { ResumeData } from "../types";
import { dateRange, keywords, highlights } from "../types";

const GREEN = "#22c55e";
const DIM = "#94a3b8";

export function TechTemplate({ data }: { data: ResumeData }) {
  const b = data.basics;
  const works = (data.work ?? []).filter(w => w.name || w.position);
  const edus = (data.education ?? []).filter(e => e.institution);
  const skills = (data.skills ?? []).filter(s => s.name);
  const projects = (data.projects ?? []).filter(p => p.name);

  return (
    <div style={{ width: 794, minHeight: 1123, fontFamily: "'Courier New', Courier, monospace", fontSize: 10, backgroundColor: "#0f172a", color: "#e2e8f0", padding: "48px 56px" }}>
      {/* Prompt header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ color: GREEN, fontSize: 11, marginBottom: 6 }}>$ whoami</div>
        {b.name && <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{b.name}</div>}
        {b.label && <div style={{ fontSize: 11, color: DIM, marginBottom: 12 }}>// {b.label}</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0 20px", fontSize: 9, color: DIM }}>
          {b.email && <span>email: {b.email}</span>}
          {b.phone && <span>tel: {b.phone}</span>}
          {b.location && <span>loc: {b.location}</span>}
          {b.url && <span>web: {b.url}</span>}
        </div>
      </div>

      {b.summary && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: GREEN, marginBottom: 6, fontSize: 10 }}>$ cat about.txt</div>
          <div style={{ color: "#cbd5e1", fontSize: 10, lineHeight: 1.7, padding: "10px 16px", backgroundColor: "#1e293b", borderRadius: 4, borderLeft: `3px solid ${GREEN}` }}>{b.summary}</div>
        </div>
      )}

      {skills.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: GREEN, marginBottom: 8, fontSize: 10 }}>$ ls skills/</div>
          {skills.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 6, alignItems: "flex-start" }}>
              <span style={{ color: "#64748b", flexShrink: 0, fontSize: 9 }}>[{String(i + 1).padStart(2, "0")}]</span>
              <span style={{ color: "#a78bfa", fontWeight: 700, minWidth: 80, flexShrink: 0, fontSize: 9.5 }}>{s.name}:</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {keywords(s.keywords).map((kw, j) => (
                  <span key={j} style={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: 8, padding: "1px 6px", borderRadius: 3 }}>{kw}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {works.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: GREEN, marginBottom: 8, fontSize: 10 }}>$ git log --experience</div>
          {works.map((w, i) => (
            <div key={i} style={{ marginBottom: 14, padding: "12px 16px", backgroundColor: "#1e293b", borderRadius: 4, borderLeft: `3px solid #334155` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 10.5 }}>{w.position}</span>
                <span style={{ color: "#64748b", fontSize: 9 }}>{dateRange(w.startDate, w.endDate)}</span>
              </div>
              <div style={{ color: "#a78bfa", fontSize: 9.5, marginBottom: 6 }}>@ {w.name}</div>
              {w.summary && <div style={{ color: "#94a3b8", fontSize: 9.5, lineHeight: 1.6 }}>{w.summary}</div>}
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: GREEN, marginBottom: 8, fontSize: 10 }}>$ ls projects/</div>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                <span style={{ color: GREEN, fontSize: 9.5 }}>▶</span>
                <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 10.5 }}>{p.name}</span>
                {p.url && <span style={{ color: "#64748b", fontSize: 8.5 }}>{p.url}</span>}
              </div>
              {p.description && <div style={{ color: "#94a3b8", fontSize: 9.5, lineHeight: 1.5, marginLeft: 18, marginTop: 2 }}>{p.description}</div>}
            </div>
          ))}
        </div>
      )}

      {edus.length > 0 && (
        <div>
          <div style={{ color: GREEN, marginBottom: 8, fontSize: 10 }}>$ cat education.json</div>
          {edus.map((e, i) => (
            <div key={i} style={{ marginBottom: 8, color: "#94a3b8", fontSize: 9.5 }}>
              <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{e.institution}</span>
              {" · "}{[e.studyType, e.area].filter(Boolean).join(", ")}
              {" · "}<span style={{ color: "#64748b" }}>{dateRange(e.startDate, e.endDate)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
