import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
  showOnline?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function UserAvatar({
  name,
  email,
  imageUrl,
  size = "md",
  showOnline = false,
  className,
}: UserAvatarProps): React.ReactElement {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={cn(sizeMap[size])}>
        <AvatarImage src={imageUrl ?? undefined} alt={name ?? email ?? "User"} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      {showOnline && (
        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
      )}
    </div>
  );
}
