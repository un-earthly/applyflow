import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Target, Zap } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "User-Focused",
    description: "We build for job seekers, not recruiters. Every feature saves you time.",
  },
  {
    icon: Zap,
    title: "Speed & Efficiency",
    description: "Every second counts in job search. We obsess over removing friction.",
  },
  {
    icon: Heart,
    title: "Transparency",
    description: "We're honest about what AI can and cannot do. Your data is private.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="px-4 md:px-6 lg:px-8 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            About ApplyFlow
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            ApplyFlow was built by people who spent hundreds of hours applying to jobs. We decided to build the tool we wished existed.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 md:px-6 lg:px-8 py-12 md:py-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our mission
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              Job search is broken. It takes too long, requires too much work, and the odds feel stacked against you.
            </p>
            <p className="text-lg text-muted-foreground">
              We built ApplyFlow to level the playing field. By automating the tedious parts and adding AI smarts to resume optimization, we help job seekers spend less time applying and more time interviewing.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8 md:p-12 h-64 md:h-80 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>Hero image placeholder</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 md:px-6 lg:px-8 py-12 md:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Our values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title}>
                  <CardHeader>
                    <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="px-4 md:px-6 lg:px-8 py-12 md:py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Our story</h2>
        <div className="space-y-6 text-lg text-muted-foreground">
          <p>
            In late 2023, our founder was deep in a frustrating job search. Armed with a strong resume and relevant experience, they still found themselves spending 3-4 hours daily on applications. Most of that time was copy-pasting the same information over and over.
          </p>
          <p>
            They had a realization: this is solvable. With modern AI models and browser automation, we could build a tool that would save job seekers hours every week.
          </p>
          <p>
            After beta testing with 500+ job seekers and iterating based on feedback, ApplyFlow was born. The response was overwhelming—users reported applying to 5-10x more jobs while spending less time on each application.
          </p>
          <p>
            Today, ApplyFlow helps thousands of people land their dream roles. We're just getting started.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-6 lg:px-8 py-12 md:py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Join us in transforming job search
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Start applying smarter today.
        </p>
        <Link href="/signup">
          <Button size="lg">Get started free</Button>
        </Link>
      </section>

      {/* Footer links */}
      <section className="px-4 md:px-6 lg:px-8 py-8 border-t">
        <div className="max-w-7xl mx-auto flex gap-4 text-sm">
          <Link href="mailto:hello@applyflow.app" className="text-muted-foreground hover:text-foreground">
            Contact us
          </Link>
          <Link href="/blog" className="text-muted-foreground hover:text-foreground">
            Blog
          </Link>
          <Link href="https://twitter.com/applyflow" className="text-muted-foreground hover:text-foreground">
            Twitter
          </Link>
        </div>
      </section>
    </div>
  );
}
