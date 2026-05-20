import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="font-semibold">ApplyFlow</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Apply to more jobs,<br />in less time
        </h1>
        <p className="text-muted-foreground max-w-md text-lg">
          ApplyFlow detects job application forms and autofills them using your AI-powered resume. One click, done.
        </p>
        <div className="flex gap-3">
          <Button size="lg">
            <Link href="/signup">Start for free</Link>
          </Button>
          <Button variant="outline" size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
