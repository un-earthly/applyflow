import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-bold text-muted-foreground/20">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Button render={<Link href="/" />}>Go home</Button>
        <Button variant="outline" render={<Link href="/dashboard" />}>Dashboard</Button>
      </div>
    </div>
  );
}
