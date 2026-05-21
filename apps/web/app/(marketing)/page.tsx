import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BrainCircuit, Zap, BarChart3, FileText, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "AI Form Detection",
    body: "Content script detects job application forms on LinkedIn, Indeed, Greenhouse, Lever, and Workday automatically.",
  },
  {
    icon: BrainCircuit,
    title: "Smart Field Mapping",
    body: "GPT-4o maps your resume data to form fields with confidence scoring. High-confidence fills happen instantly.",
  },
  {
    icon: FileText,
    title: "Resume Manager",
    body: "Block-based JSON Resume editor with AI tailoring per job description. Export to PDF in one click.",
  },
  {
    icon: BarChart3,
    title: "Application Tracker",
    body: "Kanban + table views across all your applications. Track status, interviews, and response rates.",
  },
];

const steps = [
  { step: "1", title: "Install the extension", body: "Add ApplyFlow to Chrome in 30 seconds." },
  { step: "2", title: "Open a job listing", body: "We detect supported application forms automatically." },
  { step: "3", title: "Click Fill", body: "Your resume data fills the form. Review and submit." },
];

export default function LandingPage(): React.ReactElement {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center md:px-6 md:py-32">
        <Badge variant="secondary" className="mb-4">Now in beta</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Apply to more jobs,<br className="hidden sm:block" /> in less time
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg">
          ApplyFlow detects job application forms and autofills them using your AI-powered resume.
          One click — done.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" render={<Link href="/signup" />}>
            Start for free
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/pricing" />}>
            See pricing
          </Button>
        </div>
        <p className="text-muted-foreground mt-4 text-xs">No credit card required · Free plan available</p>
      </section>

      <Separator />

      {/* How it works */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <h2 className="mb-2 text-center text-3xl font-bold">How it works</h2>
        <p className="text-muted-foreground mb-12 text-center text-sm">Three steps to your next interview.</p>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <Card key={s.step} className="text-center">
              <CardHeader>
                <div className="bg-primary text-primary-foreground mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold">
                  {s.step}
                </div>
                <CardTitle className="text-lg">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{s.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Features */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="mb-2 text-center text-3xl font-bold">Everything you need</h2>
          <p className="text-muted-foreground mb-12 text-center text-sm">Built for serious job seekers.</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <f.icon className="text-primary mb-2 h-8 w-8" />
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{f.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA band */}
      <section className="bg-primary text-primary-foreground py-20 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="mb-4 text-3xl font-bold">Start applying in minutes</h2>
          <p className="mb-8 text-lg opacity-90">Join job seekers who are spending less time on forms and more time on interviews.</p>
          <Button size="lg" variant="secondary" render={<Link href="/signup" />}>
            Create free account
          </Button>
        </div>
      </section>
    </>
  );
}
