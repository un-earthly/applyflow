import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const posts = [
  {
    slug: "ai-job-search",
    title: "How AI is Transforming the Job Search",
    excerpt:
      "AI-powered tools are changing how job seekers approach applications. Learn how to leverage them to your advantage.",
    date: "May 15, 2026",
    category: "AI",
    author: "Sarah Chen",
    readTime: "5 min",
  },
  {
    slug: "resume-tailoring-tips",
    title: "7 Resume Tailoring Tips That Actually Work",
    excerpt:
      "Tailoring your resume for each job matters. Here are evidence-based strategies to increase your chances.",
    date: "May 10, 2026",
    category: "Resume",
    author: "James K.",
    readTime: "8 min",
  },
  {
    slug: "application-tracking-guide",
    title: "The Complete Guide to Application Tracking",
    excerpt:
      "Staying organized across 50+ applications is hard. Here's our system for tracking everything that matters.",
    date: "May 5, 2026",
    category: "Productivity",
    author: "Maria Rodriguez",
    readTime: "6 min",
  },
  {
    slug: "interview-prep-checklist",
    title: "Interview Prep Checklist: 30 Days to Ready",
    excerpt:
      "Got an interview? This 30-day checklist will get you fully prepared and confident.",
    date: "April 28, 2026",
    category: "Interviews",
    author: "Alex Wong",
    readTime: "10 min",
  },
  {
    slug: "salary-negotiation",
    title: "Salary Negotiation: Getting What You're Worth",
    excerpt:
      "Most people leave money on the table. Learn proven negotiation tactics that actually work.",
    date: "April 20, 2026",
    category: "Career",
    author: "Sarah Chen",
    readTime: "7 min",
  },
  {
    slug: "linkedin-profile-optimization",
    title: "LinkedIn Profile Optimization for Recruiters",
    excerpt:
      "Your LinkedIn profile is your first impression. Here's how to optimize it for maximum visibility.",
    date: "April 15, 2026",
    category: "LinkedIn",
    author: "James K.",
    readTime: "5 min",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="px-4 md:px-6 lg:px-8 py-12 md:py-16 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            ApplyFlow Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tips, strategies, and insights to help you land your dream job.
          </p>
        </div>

        {/* Featured Post */}
        <Link href={`/blog/${posts[0].slug}`}>
          <Card className="mb-12 cursor-pointer transition-all hover:shadow-lg">
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2">
                  <div className="flex gap-2 mb-3">
                    <Badge>{posts[0].category}</Badge>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {posts[0].title}
                  </h2>
                  <p className="text-muted-foreground text-lg mb-4">
                    {posts[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                      <span>{posts[0].author}</span>
                      <span className="mx-2">•</span>
                      <span>{posts[0].readTime}</span>
                    </div>
                    <span>{posts[0].date}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg h-32 md:h-48 flex items-center justify-center">
                  <ArrowRight className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* All Posts */}
      <section className="px-4 md:px-6 lg:px-8 pb-12 md:pb-16 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Latest articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(1).map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {post.readTime}
                    </span>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span className="mx-1">•</span>
                    <span>{post.date}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-4 md:px-6 lg:px-8 py-12 md:py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Get job search tips in your inbox
          </h2>
          <p className="text-muted-foreground mb-6">
            Weekly insights, strategies, and updates. No spam, unsubscribe anytime.
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
