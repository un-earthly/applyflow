import type { ResumeData } from "../types";
import { dateRange, keywords } from "../types";

// "Navy" — dark sidebar with teal accent, clean professional
export function SidebarDarkTemplate({ data }: { data: ResumeData }) {
  const b = data.basics;
  const works = (data.work ?? []).filter(w => w.name || w.position);
  const edus = (data.education ?? []).filter(e => e.institution);
  const skills = (data.skills ?? []).filter(s => s.name);
  const projects = (data.projects ?? []).filter(p => p.name);

  return (
    <div style={{ width: 794, minHeight: 1123, fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 10, display: "flex" }}>
      {/* Left sidebar */}
      <div style={{ width: 248, backgroundColor: "#0d1b2a", color: "#e8f4f8", padding: "48px 24px", flexShrink: 0 }}>
        {b.name && <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 2, lineHeight: 1.2 }}>{b.name}</div>}
        {b.label && <div style={{ fontSize: 9.5, color: "#38bdf8", marginBottom: 24, fontWeight: 500 }}>{b.label}</div>}

        <SideSection label="Contact">
          {[{ label: "Email", val: b.email }, { label: "Phone", val: b.phone }, { label: "Location", val: b.location }, { label: "Web", val: b.url }]
            .filter(x => x.val)
            .map(({ label, val }, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 7.5, color: "#38bdf8", textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
                <div style={{ fontSize: 9, color: "#cbd5e1", wordBreak: "break-all" }}>{val}</div>
              </div>
            ))}
        </SideSection>

        {skills.length > 0 && (
          <SideSection label="Skills">
            {skills.map((s, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                {s.name && <div style={{ fontSize: 9.5, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{s.name}</div>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {keywords(s.keywords).map((kw, j) => (
                    <span key={j} style={{ fontSize: 7.5, backgroundColor: "rgba(56,189,248,0.15)", color: "#7dd3fc", padding: "1px 6px", borderRadius: 3 }}>{kw}</span>
                  ))}
                </div>
              </div>
            ))}
          </SideSection>
        )}

        {edus.length > 0 && (
          <SideSection label="Education">
            {edus.map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: "#e2e8f0" }}>{e.institution}</div>
                <div style={{ fontSize: 8.5, color: "#94a3b8" }}>{[e.studyType, e.area].filter(Boolean).join(", ")}</div>
                <div style={{ fontSize: 8, color: "#64748b" }}>{dateRange(e.startDate, e.endDate)}</div>
              </div>
            ))}
          </SideSection>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, backgroundColor: "#fff", padding: "48px 40px" }}>
        {b.summary && (
          <div style={{ marginBottom: 24 }}>
            <MHead label="Profile" />
            <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.7, borderLeft: "3px solid #38bdf8", paddingLeft: 12 }}>{b.summary}</div>
          </div>
        )}

        {works.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <MHead label="Experience" />
            {works.map((w, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: 11, color: "#0d1b2a" }}>{w.position}</span>
                  <span style={{ fontSize: 8.5, color: "#94a3b8" }}>{dateRange(w.startDate, w.endDate)}</span>
                </div>
                <div style={{ fontSize: 9.5, color: "#38bdf8", fontWeight: 600, marginBottom: 4 }}>{w.name}</div>
                {w.summary && <div style={{ fontSize: 9.5, color: "#475569", lineHeight: 1.6 }}>{w.summary}</div>}
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div>
            <MHead label="Projects" />
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 10.5, color: "#0d1b2a" }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 9.5, color: "#475569", lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SideSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 8.5, fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, borderBottom: "1px solid rgba(56,189,248,0.3)", paddingBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

function MHead({ label }: { label: string }) {
  return <div style={{ fontSize: 12, fontWeight: 700, color: "#0d1b2a", textTransform: "uppercase", letterSpacing: 1, borderBottom: "2px solid #38bdf8", paddingBottom: 4, marginBottom: 12 }}>{label}</div>;
}
