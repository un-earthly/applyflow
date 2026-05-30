import type { ResumeData } from "../types";
import { dateRange, keywords } from "../types";

export function ElegantTemplate({ data }: { data: ResumeData }) {
  const b = data.basics;
  const works = (data.work ?? []).filter(w => w.name || w.position);
  const edus = (data.education ?? []).filter(e => e.institution);
  const skills = (data.skills ?? []).filter(s => s.name);
  const projects = (data.projects ?? []).filter(p => p.name);

  return (
    <div style={{ width: 794, minHeight: 1123, fontFamily: "Georgia, 'Palatino Linotype', serif", fontSize: 10, color: "#2d2d2d", backgroundColor: "#fafaf9", padding: "56px 64px" }}>
      {/* Centered header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        {b.name && <div style={{ fontSize: 30, fontWeight: 400, letterSpacing: 4, textTransform: "uppercase", marginBottom: 6, color: "#1a1a1a" }}>{b.name}</div>}
        {b.label && <div style={{ fontSize: 11, color: "#888", fontStyle: "italic", marginBottom: 14 }}>{b.label}</div>}
        <div style={{ height: 1, backgroundColor: "#d4b896", marginBottom: 10 }} />
        <div style={{ display: "flex", justifyContent: "center", gap: 20, fontSize: 9, color: "#666", flexWrap: "wrap" }}>
          {[b.email, b.phone, b.location, b.url].filter(Boolean).map((v, i, arr) => (
            <span key={i}>{v}{i < arr.length - 1 ? "" : ""}</span>
          ))}
        </div>
        <div style={{ height: 1, backgroundColor: "#d4b896", marginTop: 10 }} />
      </div>

      {b.summary && (
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#555", lineHeight: 1.8, fontStyle: "italic", maxWidth: 560, margin: "0 auto" }}>{b.summary}</div>
        </div>
      )}

      {works.length > 0 && (
        <Section label="Experience">
          {works.map((w, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                <span style={{ fontSize: 11, fontStyle: "italic", color: "#1a1a1a" }}>{w.position}</span>
                <span style={{ fontSize: 9, color: "#888" }}>{dateRange(w.startDate, w.endDate)}</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#4a3728", marginBottom: 4 }}>{w.name}</div>
              {w.summary && <div style={{ fontSize: 9.5, color: "#555", lineHeight: 1.7 }}>{w.summary}</div>}
            </div>
          ))}
        </Section>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 32 }}>
        {edus.length > 0 && (
          <Section label="Education">
            {edus.map((e, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#1a1a1a" }}>{e.institution}</div>
                <div style={{ fontSize: 9.5, fontStyle: "italic", color: "#555" }}>{[e.studyType, e.area].filter(Boolean).join(", ")}</div>
                <div style={{ fontSize: 9, color: "#888" }}>{dateRange(e.startDate, e.endDate)}</div>
              </div>
            ))}
          </Section>
        )}

        {skills.length > 0 && (
          <Section label="Skills">
            {skills.map((s, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#4a3728", marginBottom: 3 }}>{s.name}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {keywords(s.keywords).map((kw, j) => (
                    <span key={j} style={{ fontSize: 8.5, color: "#666" }}>{kw}{j < keywords(s.keywords).length - 1 ? " ·" : ""}</span>
                  ))}
                </div>
              </div>
            ))}
          </Section>
        )}
      </div>

      {projects.length > 0 && (
        <Section label="Projects">
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 10.5, fontStyle: "italic", color: "#1a1a1a" }}>{p.name}</span>
              {p.description && <span style={{ fontSize: 9.5, color: "#555" }}> — {p.description}</span>}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, color: "#4a3728", textAlign: "center", marginBottom: 10 }}>{label}</div>
      <div style={{ height: "0.5px", backgroundColor: "#d4b896", marginBottom: 14 }} />
      {children}
    </div>
  );
}
