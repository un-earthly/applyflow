import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const POSTS = [
  {
    slug: "how-to-tailor-resume-each-job",
    title: "How to tailor your resume for each job without spending hours on it",
    excerpt: "Tailoring your resume to each job description can double your interview rate. Here's how to do it in 10 minutes using AI.",
    tag: "Career advice",
    date: "May 15, 2026",
  },
  {
    slug: "ats-resume-tips",
    title: "7 things applicant tracking systems actually look for",
    excerpt: "Most resumes are rejected by ATS before a human reads them. Learn what really matters.",
    tag: "Guides",
    date: "May 8, 2026",
  },
  {
    slug: "job-search-burnout",
    title: "Job search burnout is real — here's how to avoid it",
    excerpt: "The modern job search is exhausting. Practical strategies to stay motivated and organized.",
    tag: "Mindset",
    date: "April 30, 2026",
  },
  {
    slug: "cover-letter-mistakes",
    title: "5 cover letter mistakes that are costing you interviews",
    excerpt: "Most cover letters are generic. Here's what hiring managers actually want to read.",
    tag: "Career advice",
    date: "April 22, 2026",
  },
];

export default function BlogPage(): React.ReactElement {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
          <p className="mt-3 text-muted-foreground">
            Career advice, product updates, and guides for modern job seekers.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit text-xs">{post.tag}</Badge>
                  <h2 className="text-base font-semibold group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                  <p className="text-xs text-muted-foreground">{post.date}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
