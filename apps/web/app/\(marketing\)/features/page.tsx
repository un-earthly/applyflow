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
  {
    id: "autofill",
    icon: Zap,
    title: "Autofill",
    description: "AI-powered form detection and filling",
  },
  {
    id: "resume-ai",
    icon: FileText,
    title: "Resume AI",
    description: "Smart tailoring and optimization",
  },
  {
    id: "tracking",
    icon: BarChart3,
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
    ],
  },
  {
    id: "job-match",
    title: "AI Job Recommendations",
    description: "Discover roles that match your profile.",
    features: [
      "Resume-to-job matching algorithm",
      "Match score breakdown (0-100)",
      "Salary range estimates",
      "Company research summaries",
      "Saved jobs and searches",
      "Notification preferences",
    ],
  },
];

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
    </div>
  );
}
