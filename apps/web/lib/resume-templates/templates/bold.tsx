import type { ResumeData } from "../types";
import { dateRange, keywords } from "../types";

const ACC = "#7c3aed";

export function BoldTemplate({ data }: { data: ResumeData }) {
  const b = data.basics;
  const works = (data.work ?? []).filter(w => w.name || w.position);
  const edus = (data.education ?? []).filter(e => e.institution);
  const skills = (data.skills ?? []).filter(s => s.name);
  const projects = (data.projects ?? []).filter(p => p.name);
  const allKws = skills.flatMap(s => keywords(s.keywords));

  return (
    <div style={{ width: 794, minHeight: 1123, fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif", fontSize: 10, color: "#18181b", backgroundColor: "#fff" }}>
      {/* Header band */}
      <div style={{ padding: "44px 56px 32px", borderBottom: `5px solid ${ACC}` }}>
        {b.name && <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1, marginBottom: 6, color: "#09090b" }}>{b.name}</div>}
        {b.label && <div style={{ fontSize: 13, color: ACC, fontWeight: 600, marginBottom: 14 }}>{b.label}</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0 20px", fontSize: 9.5, color: "#71717a" }}>
          {[b.email, b.phone, b.location, b.url].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>

      <div style={{ padding: "32px 56px" }}>
        {b.summary && (
          <div style={{ marginBottom: 28 }}>
            <BoldHead label="Summary" />
            <div style={{ fontSize: 10.5, color: "#3f3f46", lineHeight: 1.7 }}>{b.summary}</div>
          </div>
        )}

        {/* Skills chips */}
        {allKws.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <BoldHead label="Skills" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {allKws.map((kw, i) => (
                <span key={i} style={{ backgroundColor: "#f3f0ff", color: ACC, fontSize: 9, padding: "3px 10px", borderRadius: 20, fontWeight: 600, border: `1px solid #ddd6fe` }}>{kw}</span>
              ))}
            </div>
          </div>
        )}

        {works.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <BoldHead label="Experience" />
            {works.map((w, i) => (
              <div key={i} style={{ marginBottom: 16, paddingLeft: 12, borderLeft: `3px solid ${i === 0 ? ACC : "#e4e4e7"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 12, color: "#09090b" }}>{w.position}</div>
                    <div style={{ fontSize: 10, color: ACC, fontWeight: 600 }}>{w.name}</div>
                  </div>
                  <div style={{ fontSize: 9, color: "#a1a1aa", textAlign: "right", flexShrink: 0 }}>{dateRange(w.startDate, w.endDate)}</div>
                </div>
                {w.summary && <div style={{ fontSize: 9.5, color: "#52525b", lineHeight: 1.6, marginTop: 6 }}>{w.summary}</div>}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          {edus.length > 0 && (
            <div>
              <BoldHead label="Education" />
              {edus.map((e, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 10.5 }}>{e.institution}</div>
                  <div style={{ fontSize: 9.5, color: "#71717a" }}>{[e.studyType, e.area].filter(Boolean).join(", ")}</div>
                  <div style={{ fontSize: 9, color: "#a1a1aa" }}>{dateRange(e.startDate, e.endDate)}</div>
                </div>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <div>
              <BoldHead label="Projects" />
              {projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 10.5 }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: 9.5, color: "#71717a", lineHeight: 1.5 }}>{p.description}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BoldHead({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, color: "#09090b", marginBottom: 12 }}>
      <span style={{ borderBottom: "3px solid #7c3aed", paddingBottom: 2 }}>{label}</span>
    </div>
  );
}
