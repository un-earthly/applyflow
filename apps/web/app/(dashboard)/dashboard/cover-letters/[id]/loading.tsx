import { Skeleton } from "@/components/ui/skeleton";

export default function CoverLetterDetailLoading(): React.ReactElement {
  return (
    <div className="space-y-4 max-w-3xl">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-[600px] rounded-xl" />
    </div>
  );
}
