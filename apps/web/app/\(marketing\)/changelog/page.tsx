import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const releases = [
  {
    version: "1.0.0",
    date: "May 2026",
    tag: "Launch",
    updates: [
      "Initial public launch of ApplyFlow",
      "AI-powered autofill for LinkedIn Easy Apply",
      "Resume editor with JSON Resume format",
      "Application tracker with Kanban view",
      "Basic analytics dashboard",
      "Email verification and password reset flows",
    ],
  },
  {
    version: "0.9.0",
    date: "April 2026",
    tag: "Beta",
    updates: [
      "Beta access program launched",
      "Support for Indeed applications",
      "Resume PDF export",
      "Bulk application status updates",
      "Activity log and search",
      "Settings panel for extension",
    ],
  },
  {
    version: "0.8.0",
    date: "March 2026",
    tag: "Alpha",
    updates: [
      "Chrome extension MVP",
      "Form detection for LinkedIn",
      "Resume data import flow",
      "First AI-powered field mapping",
      "Basic application logging",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="px-4 md:px-6 lg:px-8 py-12 md:py-16 max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Changelog
          </h1>
          <p className="text-lg text-muted-foreground">
            Latest updates and improvements to ApplyFlow
          </p>
        </div>
      </section>

      {/* Releases */}
      <section className="px-4 md:px-6 lg:px-8 pb-12 md:pb-16 max-w-4xl mx-auto">
        <div className="space-y-6">
          {releases.map((release) => (
            <Card key={release.version}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">
                        v{release.version}
                      </CardTitle>
                      <Badge variant="secondary">{release.tag}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {release.date}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {release.updates.map((update) => (
                    <li key={update} className="flex gap-3 items-start text-sm">
                      <span className="text-primary mt-1.5 font-bold">•</span>
                      <span>{update}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Subscribe */}
      <section className="px-4 md:px-6 lg:px-8 py-12 md:py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Stay updated
          </h2>
          <p className="text-muted-foreground mb-6">
            Subscribe to our newsletter for release announcements and feature updates.
          </p>
          <form className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 rounded-md border border-border bg-background"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
