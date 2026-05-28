import Link from "next/link";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
}

const sizeMap = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

export function AppLogo({ size = "md", className, href = "/" }: AppLogoProps): React.ReactElement {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 font-semibold tracking-tight", sizeMap[size], className)}
    >
      <svg
        width={size === "sm" ? 20 : size === "md" ? 24 : 28}
        height={size === "sm" ? 20 : size === "md" ? 24 : 28}
        viewBox="0 0 24 24"
        fill="none"
        className="text-primary"
      >
        <path
          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>ApplyFlow</span>
    </Link>
  );
}
