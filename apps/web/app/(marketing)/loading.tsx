import { Skeleton } from "@/components/ui/skeleton";

export default function MarketingLoading(): React.ReactElement {
  return (
    <div className="space-y-8 px-4 py-12 md:px-6">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}
