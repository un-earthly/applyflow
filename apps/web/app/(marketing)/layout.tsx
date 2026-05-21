import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function MarketingNav(): React.ReactElement {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-lg font-semibold">
          ApplyFlow
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" render={<Link href="/login" />}>
            Sign in
          </Button>
          <Button size="sm" render={<Link href="/signup" />}>
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}

function MarketingFooter(): React.ReactElement {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-semibold">ApplyFlow</Link>
            <p className="text-muted-foreground mt-2 text-sm">AI-powered job application automation.</p>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">Product</p>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">Resources</p>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link></li>
              <li><Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">Legal</p>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li><Link href="/legal/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
              <li><Link href="/legal/cookies" className="hover:text-foreground transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <p className="text-muted-foreground text-center text-sm">© {new Date().getFullYear()} ApplyFlow. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
