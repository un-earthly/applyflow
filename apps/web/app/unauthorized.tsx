import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function Unauthorized(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Lock className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="mt-6 text-7xl font-bold text-muted-foreground/20">401</p>
      <h1 className="mt-4 text-2xl font-semibold">Sign in required</h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        You need to be signed in to access this page.
      </p>
      <div className="mt-8 flex gap-3">
        <Button render={<Link href="/login" />}>Sign in</Button>
        <Button variant="outline" render={<Link href="/" />}>Go home</Button>
      </div>
    </div>
  );
}
