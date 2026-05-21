import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading(): React.ReactElement {
  return (
    <div className="space-y-6 max-w-2xl">
      <Skeleton className="h-8 w-48" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-9 w-28" />)}
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}
