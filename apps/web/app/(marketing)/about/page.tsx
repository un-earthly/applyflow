import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage(): React.ReactElement {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About ApplyFlow</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We&apos;re building the tools that make job searching less painful.
          </p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-base leading-7">
          <section>
            <h2 className="text-2xl font-semibold">Our story</h2>
            <p className="mt-3 text-muted-foreground">
              ApplyFlow started when our founders spent weeks applying to jobs and realized they
              were copy-pasting the same information into hundreds of forms. Each job board had its
              own field names, its own quirks — and none of them talked to each other.
            </p>
            <p className="mt-3 text-muted-foreground">
              We built the extension we wished existed: one that could read your resume, understand
              what each form field was asking for, and fill it in — accurately, every time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">What we believe</h2>
            <ul className="mt-3 space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-semibold text-foreground shrink-0">Transparency.</span>
                You should always see exactly what we filled and why. Nothing hidden.
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground shrink-0">Privacy.</span>
                Your career data is sensitive. We never sell it. Period.
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground shrink-0">Quality over quantity.</span>
                We&apos;d rather help you send 10 great applications than 100 mediocre ones.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">The team</h2>
            <p className="mt-3 text-muted-foreground">
              We&apos;re a small, remote-first team of engineers and designers who have all been through
              grueling job searches. We build ApplyFlow as a product we use ourselves.
            </p>
          </section>
        </div>

        <div className="mt-16 flex gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Try ApplyFlow free</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
