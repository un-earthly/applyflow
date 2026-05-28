"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SETTINGS_NAV = [
  { href: "/dashboard/settings/profile", label: "Profile" },
  { href: "/dashboard/settings/account", label: "Account" },
  { href: "/dashboard/settings/billing", label: "Billing" },
  { href: "/dashboard/settings/notifications", label: "Notifications" },
  { href: "/dashboard/settings/integrations", label: "Integrations" },
  { href: "/dashboard/settings/job-preferences", label: "Job preferences" },
  { href: "/dashboard/settings/privacy", label: "Privacy" },
  { href: "/dashboard/settings/api-keys", label: "API keys" },
  { href: "/dashboard/settings/team", label: "Team" },
  { href: "/dashboard/settings/danger-zone", label: "Danger zone" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences.</p>
      </div>
      <div className="flex gap-8">
        <aside className="w-44 shrink-0">
          <nav className="space-y-0.5">
            {SETTINGS_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === item.href || (item.href === "/dashboard/settings/billing" && pathname.startsWith("/dashboard/settings/billing")) || (item.href === "/dashboard/settings/team" && pathname.startsWith("/dashboard/settings/team"))
                    ? "bg-muted font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
