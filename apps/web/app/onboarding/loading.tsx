import { Skeleton } from "@/components/ui/skeleton";

export default function OnboardingLoading(): React.ReactElement {
  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
