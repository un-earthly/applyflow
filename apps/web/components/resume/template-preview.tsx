"use client";

import { A4_WIDTH, A4_HEIGHT, type ResumeData } from "@/lib/resume-templates/types";
import type { TemplateInfo } from "@/lib/resume-templates";

interface TemplatePreviewProps {
  template: TemplateInfo;
  data?: ResumeData;
  scale?: number;
  className?: string;
}

const SAMPLE: ResumeData = {
  basics: {
    name: "Alex Johnson",
    label: "Senior Software Engineer",
    email: "alex@example.com",
    phone: "+1 555 0100",
    location: "San Francisco, CA",
    url: "alexjohnson.dev",
    summary: "Experienced engineer with 8+ years building scalable web applications and distributed systems.",
  },
  work: [
    { name: "Acme Corp", position: "Senior Engineer", startDate: "2021-03", endDate: "Present", summary: "Led migration of monolith to microservices, reducing latency by 40%." },
    { name: "Startup Inc", position: "Full Stack Developer", startDate: "2018-06", endDate: "2021-02", summary: "Built core product from zero to 50k users." },
  ],
  education: [
    { institution: "MIT", studyType: "B.S.", area: "Computer Science", startDate: "2014", endDate: "2018", score: "3.9" },
  ],
  skills: [
    { name: "Languages", level: "Expert", keywords: "TypeScript, Python, Go, Rust" },
    { name: "Frontend", level: "Expert", keywords: "React, Next.js, Tailwind CSS" },
    { name: "Backend", level: "Advanced", keywords: "Node.js, PostgreSQL, Redis" },
  ],
  projects: [
    { name: "OpenFlow", description: "Open-source workflow automation platform with 2k GitHub stars.", url: "github.com/alex/openflow" },
    { name: "DataViz SDK", description: "Charting library used by 500+ teams.", url: "dataviz.dev" },
  ],
};

export function TemplatePreview({ template, data, scale = 0.35, className = "" }: TemplatePreviewProps) {
  const Component = template.component;
  const resumeData = data ?? SAMPLE;

  const outerW = Math.round(A4_WIDTH * scale);
  const outerH = Math.round(A4_HEIGHT * scale);

  return (
    <div
      className={className}
      style={{ width: outerW, height: outerH, overflow: "hidden", position: "relative", borderRadius: 6 }}
    >
      <div
        style={{
          width: A4_WIDTH,
          height: A4_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <Component data={resumeData} />
      </div>
    </div>
  );
}
