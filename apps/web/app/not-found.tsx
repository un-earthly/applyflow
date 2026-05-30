import { EmptyState } from "@/components/shared";
import { Search } from "lucide-react";

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <EmptyState
        icon={<Search className="h-8 w-8 text-muted-foreground" />}
        title="Page not found"
        description="The page you are looking for does not exist or has been moved."
        action={{ label: "Go home", onClick: () => (window.location.href = "/") }}
      />
    </div>
  );
}
