import { Skeleton } from "@/components/ui/skeleton";

export default function ResumeDetailLoading(): React.ReactElement {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] gap-0">
      <div className="w-48 shrink-0 border-r p-3 space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-8 rounded-md" />)}
      </div>
      <div className="flex-1 p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <div className="hidden w-80 shrink-0 border-l p-4 lg:block">
        <Skeleton className="h-full rounded-xl" />
      </div>
    </div>
  );
}
