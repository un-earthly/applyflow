import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

export default function Forbidden(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <ShieldOff className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="mt-6 text-7xl font-bold text-muted-foreground/20">403</p>
      <h1 className="mt-4 text-2xl font-semibold">Access denied</h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        You don&apos;t have permission to view this page. Contact your admin if this is a mistake.
      </p>
      <div className="mt-8 flex gap-3">
        <Button render={<Link href="/dashboard" />}>Go to dashboard</Button>
        <Button variant="outline" render={<Link href="/contact" />}>Contact admin</Button>
      </div>
    </div>
  );
}
