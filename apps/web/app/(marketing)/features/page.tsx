import { Zap, FileText, BarChart3, Briefcase, Brain, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const FEATURES = [
  {
    id: "autofill",
    icon: Zap,
    title: "Autofill",
    badge: "Core",
    description: "Our browser extension detects job application forms and fills them instantly using your saved profile and resume. Works on LinkedIn, Indeed, Greenhouse, Lever, Workday, and Ashby.",
    bullets: [
      "One-click form completion",
      "Works across 50+ job boards",
      "Confidence scoring per field",
      "Review queue for low-confidence fills",
    ],
  },
  {
    id: "resume-ai",
    icon: Brain,
    title: "Resume AI",
    badge: "Pro",
    description: "Let AI tailor your resume to each job description. Get a match score, see which skills are missing, and accept or reject AI-suggested edits side by side.",
    bullets: [
      "Keyword match scoring",
      "Section-by-section rewrite",
      "Accept / reject diff view",
      "Version history",
    ],
  },
  {
    id: "tracking",
    icon: BarChart3,
    title: "Application tracking",
    badge: "Core",
    description: "A Kanban board and table view of every application you've sent. Track status changes, notes, and reminders — all in one place.",
    bullets: [
      "Kanban + table view",
      "Status change reminders",
      "Autosave notes per application",
      "Timeline of events",
    ],
  },
  {
    id: "job-match",
    icon: Briefcase,
    title: "Job matching",
    badge: "Pro",
    description: "See AI-calculated match scores for saved jobs against your current resume. Recommended jobs surface what you're likely to get an interview for.",
    bullets: [
      "0-100 match score",
      "Missing skills breakdown",
      "Recommended job feed",
      "Save and compare jobs",
    ],
  },
  {
    id: "cover-letters",
    icon: FileText,
    title: "Cover letters",
    badge: "Core",
    description: "Generate tailored cover letters in seconds. Edit with a rich-text editor and export as PDF or copy to clipboard.",
    bullets: [
      "AI generation from resume + JD",
      "Rich-text editor",
      "Multiple tone options",
      "PDF export",
    ],
  },
  {
    id: "privacy",
    icon: Shield,
    title: "Privacy-first",
    badge: "Always",
    description: "Your resume and job data are yours. We never sell data or use it to train AI models without explicit opt-in. Delete everything with one click.",
    bullets: [
      "No data selling",
      "AI training opt-out",
      "One-click data export",
      "Delete account instantly",
    ],
  },
];

export default function FeaturesPage(): React.ReactElement {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Everything you need to land the job
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            ApplyFlow combines a browser extension, AI resume tools, and application tracking
            in one seamless workflow.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Start free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" id="features">
          {FEATURES.map((feature) => (
            <Card key={feature.id} id={feature.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary">{feature.badge}</Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-muted-foreground text-sm">{feature.description}</p>
                <ul className="space-y-1.5">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-24 rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold">Ready to apply smarter?</h2>
          <p className="mt-3 text-primary-foreground/80">
            Join thousands of job seekers using ApplyFlow to cut application time in half.
          </p>
          <Button className="mt-8 bg-white text-primary hover:bg-white/90" size="lg" asChild>
            <Link href="/signup">Get started — it&apos;s free</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
