import type { ResumeData } from "../types";
import { dateRange, keywords } from "../types";

export function CompactTemplate({ data }: { data: ResumeData }) {
  const b = data.basics;
  const works = (data.work ?? []).filter(w => w.name || w.position);
  const edus = (data.education ?? []).filter(e => e.institution);
  const skills = (data.skills ?? []).filter(s => s.name);
  const projects = (data.projects ?? []).filter(p => p.name);

  return (
    <div style={{ width: 794, minHeight: 1123, fontFamily: "'Arial', 'Helvetica Neue', sans-serif", fontSize: 9, color: "#1f2937", backgroundColor: "#fff", padding: "36px 48px" }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}>
          {b.name && <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: -0.5 }}>{b.name}</div>}
          {b.label && <div style={{ fontSize: 10, color: "#6b7280" }}>{b.label}</div>}
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 8.5, color: "#6b7280", flexWrap: "wrap" }}>
          {[b.email, b.phone, b.location, b.url].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>
      <div style={{ borderTop: "1.5px solid #111827", marginBottom: 12 }} />

      {b.summary && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#374151", marginBottom: 4 }}>Summary</div>
          <div style={{ fontSize: 9, color: "#4b5563", lineHeight: 1.5 }}>{b.summary}</div>
        </div>
      )}

      {/* Two columns for skills + edu */}
      {(skills.length > 0 || edus.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 14 }}>
          {skills.length > 0 && (
            <div>
              <CHead label="Skills" />
              {skills.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                  {s.name && <span style={{ fontWeight: 600, color: "#111827", fontSize: 8.5 }}>{s.name}:</span>}
                  <span style={{ color: "#6b7280", fontSize: 8.5 }}>{s.keywords}</span>
                </div>
              ))}
            </div>
          )}
          {edus.length > 0 && (
            <div>
              <CHead label="Education" />
              {edus.map((e, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 9 }}>{e.institution}</div>
                  <div style={{ fontSize: 8.5, color: "#6b7280" }}>{[e.studyType, e.area].filter(Boolean).join(", ")} · {dateRange(e.startDate, e.endDate)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {works.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <CHead label="Experience" />
          {works.map((w, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 10 }}>{w.position}</span>
                  <span style={{ color: "#6b7280", fontSize: 9 }}> · {w.name}</span>
                </div>
                <span style={{ fontSize: 8.5, color: "#9ca3af" }}>{dateRange(w.startDate, w.endDate)}</span>
              </div>
              {w.summary && <div style={{ fontSize: 8.5, color: "#4b5563", lineHeight: 1.5, marginTop: 2 }}>{w.summary}</div>}
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div>
          <CHead label="Projects" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {projects.map((p, i) => (
              <div key={i} style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 9.5, marginBottom: 2 }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 8.5, color: "#6b7280", lineHeight: 1.4 }}>{p.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CHead({ label }: { label: string }) {
  return <div style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#374151", marginBottom: 6, borderBottom: "0.5px solid #d1d5db", paddingBottom: 2 }}>{label}</div>;
}
