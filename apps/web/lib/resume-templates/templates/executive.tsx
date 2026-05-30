import type { ResumeData } from "../types";
import { dateRange, highlights } from "../types";

export function ExecutiveTemplate({ data }: { data: ResumeData }) {
  const b = data.basics;
  const works = (data.work ?? []).filter(w => w.name || w.position);
  const edus = (data.education ?? []).filter(e => e.institution);
  const skills = (data.skills ?? []).filter(s => s.name);
  const projects = (data.projects ?? []).filter(p => p.name);

  return (
    <div style={{ width: 794, minHeight: 1123, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 10, color: "#1a1a2e", backgroundColor: "#fff" }}>
      {/* Dark header */}
      <div style={{ backgroundColor: "#0f172a", color: "#fff", padding: "36px 56px 28px" }}>
        {b.name && <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, marginBottom: 4 }}>{b.name}</div>}
        {b.label && <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16, fontStyle: "italic" }}>{b.label}</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0 24px", fontSize: 9, color: "#cbd5e1" }}>
          {[b.email, b.phone, b.location, b.url].filter(Boolean).map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>
      </div>

      {/* Gold rule */}
      <div style={{ height: 4, backgroundColor: "#b45309" }} />

      <div style={{ padding: "32px 56px" }}>
        {b.summary && (
          <div style={{ marginBottom: 24, padding: "16px 20px", backgroundColor: "#f8fafc", borderLeft: "3px solid #b45309" }}>
            <div style={{ fontSize: 10, color: "#334155", lineHeight: 1.7 }}>{b.summary}</div>
          </div>
        )}

        {works.length > 0 && (
          <Section label="Professional Experience">
            {works.map((w, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>{w.position}</span>
                  <span style={{ fontSize: 9, color: "#64748b", fontStyle: "italic" }}>{dateRange(w.startDate, w.endDate)}</span>
                </div>
                <div style={{ fontSize: 10, color: "#b45309", fontStyle: "italic", marginBottom: 4 }}>{w.name}</div>
                {w.summary && (
                  <div style={{ fontSize: 9.5, color: "#475569", lineHeight: 1.6 }}>{w.summary}</div>
                )}
              </div>
            ))}
          </Section>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          {edus.length > 0 && (
            <Section label="Education">
              {edus.map((e, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 10.5 }}>{e.institution}</div>
                  <div style={{ fontSize: 9.5, color: "#475569", fontStyle: "italic" }}>{[e.studyType, e.area].filter(Boolean).join(", ")}</div>
                  <div style={{ fontSize: 9, color: "#64748b" }}>{dateRange(e.startDate, e.endDate)}</div>
                </div>
              ))}
            </Section>
          )}

          {skills.length > 0 && (
            <Section label="Core Competencies">
              {skills.map((s, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 9.5 }}>{s.name}</div>
                  {s.keywords && <div style={{ fontSize: 9, color: "#475569" }}>{s.keywords}</div>}
                </div>
              ))}
            </Section>
          )}
        </div>

        {projects.length > 0 && (
          <Section label="Notable Projects">
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 10.5 }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 9.5, color: "#475569", lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "#0f172a", borderBottom: "1.5px solid #0f172a", paddingBottom: 3, marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  );
}
