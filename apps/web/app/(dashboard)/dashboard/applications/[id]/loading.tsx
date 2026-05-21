import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationDetailLoading(): React.ReactElement {
  return (
    <div className="space-y-6 max-w-3xl">
      <Skeleton className="h-8 w-64" />
      <div className="flex gap-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}
