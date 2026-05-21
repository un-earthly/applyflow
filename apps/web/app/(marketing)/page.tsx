import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BrainCircuit,
  Zap,
  BarChart3,
  FileText,
  CheckCircle2,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const deepDiveFeatures = [
  {
    title: "AI-Powered Autofill",
    body: "Our GPT-4o model understands context and maps your resume to any form with industry-leading accuracy. No more copy-paste.",
    image: "🤖",
  },
  {
    title: "Resume AI Tailoring",
    body: "Automatically tailor your resume to each job description. Highlight relevant skills, reorder experience, and boost match scores.",
    image: "📄",
  },
  {
    title: "Smart Tracking",
    body: "Never lose track of where you applied. Kanban board, analytics, and reminders keep you organized.",
    image: "📊",
  },
  {
    title: "One-Click Apply",
    body: "Fill and submit in seconds. Review high-confidence fields, skip low ones, and move on to the next opportunity.",
    image: "⚡",
  },
];

const testimonials = [
  {
    quote: "I went from 2-3 applications a day to 15+. ApplyFlow saves me at least 2 hours daily.",
    author: "Sarah M.",
    role: "Product Designer",
  },
  {
    quote: "The resume tailoring feature alone got me more interviews in 2 weeks than I had in 2 months before.",
    author: "James K.",
    role: "Software Engineer",
  },
  {
    quote: "Finally, a tool that actually understands what I'm applying to. The match scoring is incredibly accurate.",
    author: "Emily P.",
    role: "Data Scientist",
  },
];

const faqs = [
  {
    question: "Which job boards does ApplyFlow support?",
    answer:
      "We currently support LinkedIn Easy Apply, Indeed, Greenhouse, Lever, Workday, and Ashby. We're constantly adding more based on user demand.",
  },
  {
    question: "Is my resume data safe?",
    answer:
      "Yes. We never store your resume on our servers unnecessarily. All data is encrypted, and we follow industry security best practices. We're SOC 2 compliant.",
  },
  {
    question: "Can I use ApplyFlow without the extension?",
    answer:
      "The extension is required for autofill. However, you can use the dashboard to manage resumes, track applications, and view analytics.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Free forever with 10 autofills/month. Pro is $12/month with unlimited autofills and advanced features. Check our pricing page for details.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. Cancel your subscription anytime with no questions asked. Your data remains yours.",
  },
  {
    question: "Do you offer a free trial for Pro?",
    answer:
      "We offer unlimited Pro features for 7 days when you sign up. No credit card required.",
  },
  {
    question: "How accurate is the AI autofill?",
    answer:
      "Our model achieves 95%+ accuracy on standard fields (name, email, location). Complex fields like cover letters are marked for review.",
  },
  {
    question: "What if a job board isn't supported?",
    answer:
      "You can manually report unsupported sites. We prioritize support based on user demand. In the meantime, fill manually and track the application.",
  },
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

      {/* Logo strip */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <p className="text-muted-foreground mb-8 text-center text-xs uppercase tracking-widest">
          Works on
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
          {["LinkedIn", "Indeed", "Greenhouse", "Lever", "Workday", "Ashby"].map(
            (board) => (
              <div key={board} className="text-muted-foreground text-sm font-medium">
                {board}
              </div>
            )
          )}
        </div>
      </section>

      <Separator />

      {/* Feature deep-dive */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <h2 className="mb-2 text-center text-3xl font-bold">Built for serious job seekers</h2>
        <p className="text-muted-foreground mb-16 text-center text-sm">
          Everything you need to land your next role faster.
        </p>
        <div className="space-y-16">
          {deepDiveFeatures.map((feature, idx) => (
            <div
              key={feature.title}
              className={`grid gap-8 items-center md:grid-cols-2 ${
                idx % 2 === 1 ? "md:auto-cols-reverse" : ""
              }`}
            >
              <div className={idx % 2 === 1 ? "md:order-last" : ""}>
                <h3 className="mb-4 text-2xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground text-lg">{feature.body}</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-6xl">{feature.image}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Pricing preview */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="mb-2 text-center text-3xl font-bold">Simple pricing</h2>
          <p className="text-muted-foreground mb-12 text-center text-sm">
            Start free, upgrade when you need more.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Free",
                price: "$0",
                desc: "Get started",
                features: ["10 autofills/mo", "1 resume", "Basic tracking"],
              },
              {
                name: "Pro",
                price: "$12",
                desc: "Most popular",
                features: [
                  "Unlimited autofills",
                  "5 resumes",
                  "AI tailoring",
                  "Analytics",
                ],
              },
              {
                name: "Teams",
                price: "$29",
                desc: "Per user",
                features: [
                  "Everything Pro",
                  "Unlimited resumes",
                  "Team workspace",
                  "Priority support",
                ],
              },
            ].map((plan) => (
              <Card key={plan.name}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-muted-foreground text-xs">{plan.desc}</p>
                  <p className="mt-2 text-3xl font-bold">{plan.price}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="text-primary h-4 w-4" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" render={<Link href="/pricing" />}>
              See full pricing →
            </Button>
          </div>
        </div>
      </section>

      <Separator />

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <h2 className="mb-2 text-center text-3xl font-bold">Loved by job seekers</h2>
        <p className="text-muted-foreground mb-12 text-center text-sm">
          Real results from real users.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.author}>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4 italic">"{t.quote}"</p>
                <p className="font-medium">{t.author}</p>
                <p className="text-muted-foreground text-sm">{t.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20 md:px-6">
        <h2 className="mb-2 text-center text-3xl font-bold">Frequently asked</h2>
        <p className="text-muted-foreground mb-12 text-center text-sm">
          Can't find the answer? Reach out to our support team.
        </p>
        <Accordion>
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
