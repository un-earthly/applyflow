<<<<<<< HEAD
import { Zap, FileText, BarChart3, Briefcase, Brain, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const FEATURES = [
=======
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BrainCircuit,
  Zap,
  BarChart3,
  FileText,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const categories = [
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
  {
    id: "autofill",
    icon: Zap,
    title: "Autofill",
<<<<<<< HEAD
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
=======
    description: "AI-powered form detection and filling",
  },
  {
    id: "resume-ai",
    icon: FileText,
    title: "Resume AI",
    description: "Smart tailoring and optimization",
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
  },
  {
    id: "tracking",
    icon: BarChart3,
<<<<<<< HEAD
    title: "Application tracking",
    badge: "Core",
    description: "A Kanban board and table view of every application you've sent. Track status changes, notes, and reminders — all in one place.",
    bullets: [
      "Kanban + table view",
      "Status change reminders",
      "Autosave notes per application",
      "Timeline of events",
=======
    title: "Tracking",
    description: "Complete application management",
  },
  {
    id: "job-match",
    icon: BrainCircuit,
    title: "Job Match",
    description: "AI job recommendations",
  },
];

const featureDetails = [
  {
    id: "autofill",
    title: "Intelligent Autofill",
    description: "Fill job application forms in seconds with AI-powered accuracy.",
    features: [
      "Automatic form detection on 50+ job boards",
      "Resume-to-form field mapping with GPT-4o",
      "Confidence scoring for every field",
      "One-click review and submit",
      "Auto-submit for high-confidence fills",
      "CAPTCHA detection and alerts",
    ],
  },
  {
    id: "resume-ai",
    title: "Resume AI",
    description:
      "Create tailored resumes that land interviews.",
    features: [
      "JSON Resume editor with 10+ templates",
      "AI-powered resume tailoring per job",
      "Skills extraction from job descriptions",
      "PDF export and sharing",
      "Version history and rollback",
      "LinkedIn import (coming soon)",
    ],
  },
  {
    id: "tracking",
    title: "Application Tracking",
    description: "Stay organized across all your applications.",
    features: [
      "Kanban board and table views",
      "Status pipeline: Applied → Interview → Offer",
      "Application analytics dashboard",
      "Interview reminders and scheduling",
      "Form snapshot storage",
      "Bulk status updates",
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
    ],
  },
  {
    id: "job-match",
<<<<<<< HEAD
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
=======
    title: "AI Job Recommendations",
    description: "Discover roles that match your profile.",
    features: [
      "Resume-to-job matching algorithm",
      "Match score breakdown (0-100)",
      "Salary range estimates",
      "Company research summaries",
      "Saved jobs and searches",
      "Notification preferences",
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
    ],
  },
];

<<<<<<< HEAD
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
            <Button size="lg" render={<Link href="/signup" />}>Start free</Button>
            <Button variant="outline" size="lg" render={<Link href="/pricing" />}>See pricing</Button>
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
          <Button className="mt-8 bg-white text-primary hover:bg-white/90" size="lg" render={<Link href="/signup" />}>Get started — it&apos;s free</Button>
        </div>
      </div>
=======
export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="px-4 md:px-6 lg:px-8 py-12 md:py-16 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Powerful features for smarter job search
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to apply faster, interview more, and land your dream role.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.id} href={`#${cat.id}`}>
                <Card className="cursor-pointer transition-all hover:shadow-lg h-full">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{cat.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Feature Details */}
      {featureDetails.map((detail, idx) => {
        const isEven = idx % 2 === 0;
        return (
          <section
            key={detail.id}
            id={detail.id}
            className={`px-4 md:px-6 lg:px-8 py-12 md:py-16 ${
              isEven ? "bg-muted/30" : ""
            }`}
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className={isEven ? "" : "md:order-2"}>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {detail.title}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    {detail.description}
                  </p>
                  <ul className="space-y-3">
                    {detail.features.map((feature) => (
                      <li key={feature} className="flex gap-3 items-start">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm md:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8 md:p-12 h-64 md:h-96 flex items-center justify-center ${
                  isEven ? "" : "md:order-1"
                }`}>
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      Screenshot coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section className="px-4 md:px-6 lg:px-8 py-12 md:py-16 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to apply smarter?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Start using ApplyFlow today and transform your job search.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto">
              Start free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              View pricing
            </Button>
          </Link>
        </div>
      </section>
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
    </div>
  );
}
