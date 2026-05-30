import type { TemplateInfo } from "./types";
import { ClassicTemplate } from "./templates/classic";
import { ModernTemplate } from "./templates/modern";
import { MinimalTemplate } from "./templates/minimal";
import { ExecutiveTemplate } from "./templates/executive";
import { TechTemplate } from "./templates/tech";
import { ElegantTemplate } from "./templates/elegant";
import { BoldTemplate } from "./templates/bold";
import { CreativeTemplate } from "./templates/creative";
import { CompactTemplate } from "./templates/compact";
import { GradientTemplate } from "./templates/gradient";
import { SidebarDarkTemplate } from "./templates/sidebar-dark";

export const RESUME_TEMPLATES: TemplateInfo[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional black & white, serif fonts. Works everywhere.",
    accent: "#111827",
    textAccent: "#fff",
    component: ClassicTemplate,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Indigo sidebar with skills, clean sans-serif for the main content.",
    accent: "#4f46e5",
    textAccent: "#fff",
    component: ModernTemplate,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean with generous whitespace. Let the content breathe.",
    accent: "#e5e7eb",
    textAccent: "#111",
    component: MinimalTemplate,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Dark navy header with gold accent. Authoritative and senior.",
    accent: "#0f172a",
    textAccent: "#fff",
    component: ExecutiveTemplate,
  },
  {
    id: "tech",
    name: "Tech",
    description: "Terminal-inspired dark theme. Perfect for engineers.",
    accent: "#22c55e",
    textAccent: "#0f172a",
    component: TechTemplate,
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Centered serif layout with warm gold accents. Refined.",
    accent: "#d4b896",
    textAccent: "#4a3728",
    component: ElegantTemplate,
  },
  {
    id: "bold",
    name: "Bold",
    description: "Strong typography with purple accents. Makes an impression.",
    accent: "#7c3aed",
    textAccent: "#fff",
    component: BoldTemplate,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Gradient header with accent color system. Modern and vibrant.",
    accent: "#0ea5e9",
    textAccent: "#fff",
    component: CreativeTemplate,
  },
  {
    id: "compact",
    name: "Compact",
    description: "Dense two-column layout. Fits more content, great for long CVs.",
    accent: "#374151",
    textAccent: "#fff",
    component: CompactTemplate,
  },
  {
    id: "gradient",
    name: "Gradient",
    description: "Purple-to-pink gradient header with card-based sections.",
    accent: "#7c3aed",
    textAccent: "#fff",
    component: GradientTemplate,
  },
  {
    id: "sidebar-dark",
    name: "Navy",
    description: "Navy + teal sidebar. Clean, corporate, and confident.",
    accent: "#0d1b2a",
    textAccent: "#38bdf8",
    component: SidebarDarkTemplate,
  },
];

export function getTemplate(id: string | undefined): TemplateInfo {
  return RESUME_TEMPLATES.find((t) => t.id === id) ?? RESUME_TEMPLATES[0]!;
}

export type { TemplateInfo, ResumeData } from "./types";
