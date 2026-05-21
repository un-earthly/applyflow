import { Zap, LayoutDashboard, BookmarkCheck, Play } from "lucide-react";

interface Props {
  profile: { displayName?: string; email?: string; autofillsUsed?: number; autofillsLimit?: number } | null;
}

export function HomeTab({ profile }: Props): React.ReactElement {
  const firstName = profile?.displayName?.split(" ")[0] ?? "there";
  const used = profile?.autofillsUsed ?? 0;
  const limit = profile?.autofillsLimit ?? 10;
  const pct = Math.min(100, Math.round((used / limit) * 100));

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 py-12 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg">ApplyFlow</p>
          <p className="text-muted-foreground text-sm mt-1">Sign in to start filling forms automatically.</p>
        </div>
        <button
          onClick={() => browser.tabs.create({ url: `${import.meta.env.VITE_WEB_URL ?? "https://app.applyflow.io"}/login?return=extension` })}
          className="bg-primary text-primary-foreground rounded-md px-6 py-2 text-sm font-medium hover:bg-primary/90 transition-colors w-full"
        >
          Sign in
        </button>
      </div>
    );
  }

  const QUICK_ACTIONS = [
    { label: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
    { label: "Applications", icon: BookmarkCheck, url: "/dashboard/applications" },
    { label: "Tutorial", icon: Play, url: "/onboarding/welcome" },
  ];

  return (
    <div className="p-4 space-y-5">
      <p className="text-base font-semibold">Hey, {firstName} 👋</p>

      {/* Quota */}
      <div className="rounded-lg border bg-card p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{used} / {limit} autofills this month</span>
          <span className="font-medium">{pct}%</span>
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="space-y-1.5">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => browser.tabs.create({ url: `${import.meta.env.VITE_WEB_URL ?? "https://app.applyflow.io"}${action.url}` })}
            className="flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-sm text-left hover:bg-muted transition-colors"
          >
            <action.icon className="h-4 w-4 text-muted-foreground shrink-0" />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
