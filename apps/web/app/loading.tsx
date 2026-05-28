import { LoadingSpinner } from "@/components/shared";

export default function RootLoading(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" label="Loading..." />
    </div>
  );
}
