import type { ResumeData } from "../types";
import { dateRange, keywords } from "../types";

export function GradientTemplate({ data }: { data: ResumeData }) {
  const b = data.basics;
  const works = (data.work ?? []).filter(w => w.name || w.position);
  const edus = (data.education ?? []).filter(e => e.institution);
  const skills = (data.skills ?? []).filter(s => s.name);
  const projects = (data.projects ?? []).filter(p => p.name);

  return (
    <div style={{ width: 794, minHeight: 1123, fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif", fontSize: 10, backgroundColor: "#f8fafc" }}>
      {/* Gradient hero */}
      <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a21caf 100%)", padding: "52px 56px 40px", color: "#fff" }}>
        {b.name && <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1, marginBottom: 6 }}>{b.name}</div>}
        {b.label && <div style={{ fontSize: 13, color: "#c4b5fd", marginBottom: 20, fontWeight: 500 }}>{b.label}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {b.email && <ContactCard icon="✉" value={b.email} />}
          {b.phone && <ContactCard icon="☎" value={b.phone} />}
          {b.location && <ContactCard icon="◎" value={b.location} />}
          {b.url && <ContactCard icon="⬡" value={b.url} />}
        </div>
      </div>

      {/* Wave decoration */}
      <div style={{ height: 16, background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a21caf 100%)", clipPath: "ellipse(100% 100% at 50% 0%)" }} />

      <div style={{ padding: "24px 56px 40px" }}>
        {b.summary && (
          <div style={{ marginBottom: 24, padding: "20px 24px", backgroundColor: "#fff", borderRadius: 10, boxShadow: "0 1px 8px rgba(0,0,0,0.08)", borderLeft: "4px solid #7c3aed" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>Profile</div>
            <div style={{ fontSize: 10, color: "#334155", lineHeight: 1.7 }}>{b.summary}</div>
          </div>
        )}

        {works.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <GHead label="Experience" />
            {works.map((w, i) => (
              <div key={i} style={{ backgroundColor: "#fff", borderRadius: 8, padding: "14px 18px", marginBottom: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 11, color: "#0f172a" }}>{w.position}</div>
                    <div style={{ fontSize: 9.5, color: "#7c3aed", fontWeight: 600, marginTop: 1 }}>{w.name}</div>
                  </div>
                  <span style={{ fontSize: 8.5, color: "#94a3b8", backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: 10 }}>{dateRange(w.startDate, w.endDate)}</span>
                </div>
                {w.summary && <div style={{ fontSize: 9.5, color: "#475569", lineHeight: 1.6, marginTop: 8 }}>{w.summary}</div>}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          {edus.length > 0 && (
            <div>
              <GHead label="Education" />
              {edus.map((e, i) => (
                <div key={i} style={{ backgroundColor: "#fff", borderRadius: 8, padding: "12px 16px", marginBottom: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontWeight: 700, fontSize: 10.5, color: "#0f172a" }}>{e.institution}</div>
                  <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>{[e.studyType, e.area].filter(Boolean).join(", ")}</div>
                  <div style={{ fontSize: 8.5, color: "#94a3b8", marginTop: 1 }}>{dateRange(e.startDate, e.endDate)}</div>
                </div>
              ))}
            </div>
          )}

          {skills.length > 0 && (
            <div>
              <GHead label="Skills" />
              <div style={{ backgroundColor: "#fff", borderRadius: 8, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                {skills.map((s, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#374151", marginBottom: 4 }}>{s.name}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {keywords(s.keywords).map((kw, j) => (
                        <span key={j} style={{ fontSize: 8, backgroundColor: "#f3f0ff", color: "#6d28d9", padding: "2px 7px", borderRadius: 10, fontWeight: 500 }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {projects.length > 0 && (
          <div>
            <GHead label="Projects" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {projects.map((p, i) => (
                <div key={i} style={{ backgroundColor: "#fff", borderRadius: 8, padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: "3px solid #7c3aed" }}>
                  <div style={{ fontWeight: 700, fontSize: 10.5, marginBottom: 4 }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: 9, color: "#64748b", lineHeight: 1.5 }}>{p.description}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactCard({ icon, value }: { icon: string; value: string }) {
  return (
    <div style={{ backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 6, padding: "6px 10px" }}>
      <div style={{ fontSize: 10, marginBottom: 1 }}>{icon}</div>
      <div style={{ fontSize: 8, color: "#ddd6fe", wordBreak: "break-all" }}>{value}</div>
    </div>
  );
}

function GHead({ label }: { label: string }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>{label}</div>;
}
