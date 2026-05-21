import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

const POSTS: Record<string, { title: string; date: string; tag: string; body: string }> = {
  "how-to-tailor-resume-each-job": {
    title: "How to tailor your resume for each job without spending hours on it",
    date: "May 15, 2026",
    tag: "Career advice",
    body: `Tailoring your resume to each job description can double your interview rate — but most people don't do it because it's time-consuming.

Here's the good news: with the right approach, you can tailor a resume in under 10 minutes.

## Step 1: Read the job description twice

The first time, read for the big picture — what does this company need? The second time, highlight specific keywords: required skills, tools, and phrases that appear more than once.

## Step 2: Match your language

Recruiters (and ATS systems) are looking for the exact words from the job description. If they say "cross-functional collaboration" and you wrote "worked across teams," update your bullet points.

## Step 3: Lead with the most relevant experience

Reorder your bullet points so the most relevant achievements appear first under each job. A hiring manager will read the first two bullets and may skim the rest.

## Step 4: Trim the irrelevant

Remove or minimize experience that doesn't relate to this specific role. A 1-page focused resume outperforms a 2-page generic one.

## Using AI to speed this up

ApplyFlow's resume tailor feature does steps 1-3 automatically. Paste the job description, review the suggested changes, and accept or reject each one. What used to take 30 minutes takes 5.`,
  },
  "ats-resume-tips": {
    title: "7 things applicant tracking systems actually look for",
    date: "May 8, 2026",
    tag: "Guides",
    body: `Most resumes are rejected by ATS before a human reads them. Here's what the systems actually care about.

## 1. Keyword match

ATS systems score resumes against the job description. Use the exact language from the posting.

## 2. Simple formatting

Avoid tables, text boxes, and columns. ATS parsers often skip content inside these.

## 3. Standard section headers

"Work Experience" and "Education" are safe. "My Journey" is not.

## 4. No headers/footers for contact info

Many ATS systems skip header and footer content entirely.

## 5. File format

PDF is usually safe. DOCX is sometimes preferred. Never submit an image-based PDF.

## 6. Dates in MM/YYYY format

Inconsistent date formats confuse parsers and create gaps where none exist.

## 7. Skills section

Include an explicit skills section. Many ATS systems specifically scan for it.`,
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props): Promise<React.ReactElement> {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) notFound();

  const paragraphs = post.body.split("\n\n");

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-4 md:px-6">
        <Button variant="ghost" size="sm" className="mb-8 -ml-2" render={<Link href="/blog" />}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to blog
        </Button>

        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-3">{post.tag} · {post.date}</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          {paragraphs.map((para, i) => {
            if (para.startsWith("## ")) {
              return <h2 key={i} className="text-xl font-semibold mt-8 mb-3">{para.slice(3)}</h2>;
            }
            return <p key={i} className="text-muted-foreground leading-7 mb-4">{para}</p>;
          })}
        </div>
      </div>
    </div>
  );
}
