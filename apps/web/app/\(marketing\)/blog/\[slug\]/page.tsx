import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

// Mock blog post data - in a real app, this would come from a CMS or database
const blogPosts: Record<string, any> = {
  "ai-job-search": {
    title: "How AI is Transforming the Job Search",
    excerpt:
      "AI-powered tools are changing how job seekers approach applications. Learn how to leverage them to your advantage.",
    date: "May 15, 2026",
    category: "AI",
    author: "Sarah Chen",
    readTime: "5 min",
    content: `
      <h2>The AI Revolution in Job Search</h2>
      <p>Artificial intelligence has quietly revolutionized how we approach job searching. From automated application filling to intelligent resume tailoring, AI tools are changing the game for job seekers everywhere.</p>

      <h2>The Problem AI Solves</h2>
      <p>Traditional job search is incredibly time-consuming. The average job seeker spends 3-4 hours per day on applications, with most of that time spent on repetitive tasks:</p>
      <ul>
        <li>Copy-pasting resume information into forms</li>
        <li>Manually tailoring resumes for each job</li>
        <li>Tracking applications across multiple platforms</li>
        <li>Researching companies and roles</li>
      </ul>

      <h2>How AI Changes This</h2>
      <p>AI-powered job search tools handle these repetitive tasks, freeing you to focus on what matters: preparing for interviews and choosing the right opportunity.</p>

      <h2>The Tools You Need</h2>
      <p>The most effective AI job search toolkit includes:</p>
      <ul>
        <li><strong>Intelligent form filling</strong> - AI that understands your background and matches it to form fields</li>
        <li><strong>Resume optimization</strong> - AI that tailors your resume for each job description</li>
        <li><strong>Application tracking</strong> - Smart organization and analytics</li>
        <li><strong>Job matching</strong> - AI that finds roles that fit your profile</li>
      </ul>

      <h2>The Bottom Line</h2>
      <p>Job search shouldn't consume 3-4 hours of your day. With AI, you can apply to 5-10x more positions while spending less time on each one. The future of job search is here.</p>
    `,
  },
  "resume-tailoring-tips": {
    title: "7 Resume Tailoring Tips That Actually Work",
    excerpt:
      "Tailoring your resume for each job matters. Here are evidence-based strategies to increase your chances.",
    date: "May 10, 2026",
    category: "Resume",
    author: "James K.",
    readTime: "8 min",
    content: `
      <h2>Why Resume Tailoring Matters</h2>
      <p>Generic resumes rarely make it past the initial screening. Tailoring your resume for each position significantly increases your chances of getting an interview.</p>

      <h2>Tip 1: Match Keywords from the Job Description</h2>
      <p>Most companies use ATS (Applicant Tracking Systems) to screen resumes. These systems look for specific keywords from the job description. Mirror the language used in the posting.</p>

      <h2>Tip 2: Lead with Relevant Experience</h2>
      <p>Reorder your work experience to highlight what's most relevant to the role. Put your most applicable accomplishments first.</p>

      <h2>Tip 3: Customize Your Professional Summary</h2>
      <p>Instead of a generic summary, write one that speaks directly to the role you're applying for.</p>

      <h2>Tip 4: Highlight Matching Skills</h2>
      <p>Compare your skills against the job description and emphasize the overlapping ones.</p>

      <h2>Tip 5: Quantify Your Achievements</h2>
      <p>Instead of "improved sales," write "increased sales by 25%." Numbers stand out and show impact.</p>

      <h2>Tip 6: Adjust Your Language</h2>
      <p>If the job description uses specific terminology, incorporate it into your resume where it fits naturally.</p>

      <h2>Tip 7: Use AI to Speed It Up</h2>
      <p>Modern AI tools can help you tailor your resume in seconds, making it feasible to customize for every application.</p>
    `,
  },
};

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = blogPosts[params.slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-background px-4 md:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-6">
            The blog post you're looking for doesn't exist.
          </p>
          <Link href="/blog">
            <Button>Back to blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back button */}
      <div className="px-4 md:px-6 lg:px-8 pt-6">
        <Link href="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
      </div>

      {/* Header */}
      <article className="px-4 md:px-6 lg:px-8 py-12 md:py-16 max-w-2xl mx-auto">
        <header className="mb-8">
          <div className="flex gap-2 mb-3">
            <Badge>{post.category}</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center justify-between text-sm text-muted-foreground border-b border-border pb-4">
            <div>
              <span>{post.author}</span>
              <span className="mx-2">•</span>
              <span>{post.readTime}</span>
            </div>
            <span>{post.date}</span>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-4">
          <div
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="space-y-6 text-base text-muted-foreground leading-relaxed"
          />
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-2">About the author</p>
              <p className="text-sm text-muted-foreground">{post.author}</p>
            </div>
            <Link href="/blog">
              <Button variant="outline">Browse more articles</Button>
            </Link>
          </div>
        </footer>
      </article>

      {/* Related articles */}
      <section className="px-4 md:px-6 lg:px-8 py-12 md:py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">More articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/blog">
              <div className="p-6 bg-background rounded-lg border border-border hover:shadow-md transition-all cursor-pointer">
                <Badge className="mb-3">Resume</Badge>
                <h3 className="font-semibold mb-2">7 Resume Tailoring Tips</h3>
                <p className="text-sm text-muted-foreground">Tailoring your resume for each job matters...</p>
              </div>
            </Link>
            <Link href="/blog">
              <div className="p-6 bg-background rounded-lg border border-border hover:shadow-md transition-all cursor-pointer">
                <Badge className="mb-3">Interviews</Badge>
                <h3 className="font-semibold mb-2">Interview Prep Checklist</h3>
                <p className="text-sm text-muted-foreground">30 days to fully prepared and confident...</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
