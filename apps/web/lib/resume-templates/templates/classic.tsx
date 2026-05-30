import type { ResumeData } from "../types";
import { dateRange, keywords, highlights } from "../types";

const c = {
  page: { width: 794, minHeight: 1123, fontFamily: "'Times New Roman', Times, serif", fontSize: 10, color: "#111", backgroundColor: "#fff", padding: "48px 56px" } as React.CSSProperties,
  name: { fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginBottom: 2 } as React.CSSProperties,
  label: { fontSize: 12, color: "#444", marginBottom: 6 } as React.CSSProperties,
  contact: { display: "flex", flexWrap: "wrap" as const, gap: "0 16px", fontSize: 9, color: "#555", marginBottom: 16 },
  divider: { borderTop: "1.5px solid #111", marginBottom: 14 } as React.CSSProperties,
  sectionHead: { fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, borderBottom: "0.5px solid #aaa", paddingBottom: 2, marginBottom: 8, color: "#111" } as React.CSSProperties,
  section: { marginBottom: 16 } as React.CSSProperties,
  entryHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 1 } as React.CSSProperties,
  entryTitle: { fontWeight: 700, fontSize: 10.5 } as React.CSSProperties,
  entryMeta: { fontSize: 9, color: "#555", flexShrink: 0 } as React.CSSProperties,
  entrySubtitle: { fontStyle: "italic", fontSize: 9.5, color: "#444", marginBottom: 3 } as React.CSSProperties,
  entryBody: { fontSize: 9.5, color: "#333", lineHeight: 1.5 } as React.CSSProperties,
  bullet: { display: "flex", gap: 5, marginBottom: 1 } as React.CSSProperties,
  summary: { fontSize: 10, color: "#333", lineHeight: 1.6, marginBottom: 16 } as React.CSSProperties,
  skillRow: { display: "flex", gap: 6, marginBottom: 4, flexWrap: "wrap" as const } as React.CSSProperties,
  skillLabel: { fontWeight: 700, fontSize: 9.5, minWidth: 80, flexShrink: 0 } as React.CSSProperties,
  skillKw: { fontSize: 9.5, color: "#444" } as React.CSSProperties,
};

export function ClassicTemplate({ data }: { data: ResumeData }) {
  const b = data.basics;
  const works = (data.work ?? []).filter(w => w.name || w.position);
  const edus = (data.education ?? []).filter(e => e.institution);
  const skills = (data.skills ?? []).filter(s => s.name);
  const projects = (data.projects ?? []).filter(p => p.name);

  return (
    <div style={c.page}>
      {b.name && <div style={c.name}>{b.name}</div>}
      {b.label && <div style={c.label}>{b.label}</div>}
      <div style={c.contact}>
        {b.email && <span>{b.email}</span>}
        {b.phone && <span>{b.phone}</span>}
        {b.location && <span>{b.location}</span>}
        {b.url && <span>{b.url}</span>}
      </div>
      <div style={c.divider} />

      {b.summary && <div style={c.summary}>{b.summary}</div>}

      {works.length > 0 && (
        <div style={c.section}>
          <div style={c.sectionHead}>Experience</div>
          {works.map((w, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={c.entryHeader}>
                <span style={c.entryTitle}>{w.position}</span>
                <span style={c.entryMeta}>{dateRange(w.startDate, w.endDate)}</span>
              </div>
              <div style={c.entrySubtitle}>{w.name}{w.url ? ` · ${w.url}` : ""}</div>
              {w.summary && <div style={c.entryBody}>{w.summary}</div>}
            </div>
          ))}
        </div>
      )}

      {edus.length > 0 && (
        <div style={c.section}>
          <div style={c.sectionHead}>Education</div>
          {edus.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={c.entryHeader}>
                <span style={c.entryTitle}>{e.institution}</span>
                <span style={c.entryMeta}>{dateRange(e.startDate, e.endDate)}</span>
              </div>
              <div style={c.entrySubtitle}>{[e.studyType, e.area].filter(Boolean).join(", ")}{e.score ? ` · GPA ${e.score}` : ""}</div>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div style={c.section}>
          <div style={c.sectionHead}>Skills</div>
          {skills.map((s, i) => (
            <div key={i} style={c.skillRow}>
              <span style={c.skillLabel}>{s.name}</span>
              <span style={c.skillKw}>{s.keywords}</span>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div style={c.section}>
          <div style={c.sectionHead}>Projects</div>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={c.entryHeader}>
                <span style={c.entryTitle}>{p.name}</span>
                {p.url && <span style={c.entryMeta}>{p.url}</span>}
              </div>
              {p.description && <div style={c.entryBody}>{p.description}</div>}
              {highlights(p.highlights).map((h, j) => (
                <div key={j} style={c.bullet}><span>•</span><span style={c.entryBody}>{h}</span></div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
