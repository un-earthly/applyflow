import { LoadingSpinner } from "@/components/shared";

export default function AuthLoading(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="md" />
    </div>
  );
}
