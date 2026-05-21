import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ENTRIES = [
  {
    version: "1.2.0",
    date: "May 2026",
    tags: ["Feature"],
    title: "Resume tailor + AI match scoring",
    items: [
      "Paste a job description to get a keyword match score against your resume.",
      "Side-by-side diff view to accept or reject AI-suggested edits.",
      "Tailored versions are saved separately so you never lose your original.",
    ],
  },
  {
    version: "1.1.0",
    date: "April 2026",
    tags: ["Feature", "Extension"],
    title: "Cover letter generation",
    items: [
      "Generate a tailored cover letter from any saved job with one click.",
      "Rich-text editor with tone selector (professional, enthusiastic, concise).",
      "Export as PDF or copy to clipboard.",
    ],
  },
  {
    version: "1.0.3",
    date: "March 2026",
    tags: ["Fix"],
    title: "Greenhouse + Lever selector fixes",
    items: [
      "Fixed phone number field mapping on Greenhouse v2 forms.",
      "Fixed LinkedIn URL field detection on Lever applications.",
      "Improved confidence scoring for multi-select fields.",
    ],
  },
  {
    version: "1.0.0",
    date: "February 2026",
    tags: ["Launch"],
    title: "ApplyFlow launches",
    items: [
      "Browser extension with form autofill on LinkedIn, Indeed, and 10 other boards.",
      "Application tracking with Kanban and table views.",
      "Resume editor with live PDF preview.",
      "Free and Pro tiers.",
    ],
  },
];

const TAG_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Feature: "default",
  Extension: "secondary",
  Fix: "outline",
  Launch: "default",
};

export default function ChangelogPage(): React.ReactElement {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-4 md:px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
          <p className="mt-3 text-muted-foreground">
            New updates and improvements to ApplyFlow.
          </p>
        </div>

        <div className="space-y-12">
          {ENTRIES.map((entry, i) => (
            <div key={entry.version}>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-sm text-muted-foreground">{entry.version}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{entry.date}</span>
                <div className="flex gap-1.5">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant={TAG_VARIANT[tag] ?? "secondary"} className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-3">{entry.title}</h2>
              <ul className="space-y-2">
                {entry.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              {i < ENTRIES.length - 1 && <Separator className="mt-12" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
