"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { initPostHog, track, identifyUser, resetUser } from "@/lib/posthog";

export function AnalyticsProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => { initPostHog(); }, []);

  useEffect(() => {
    track("page_view", { path: pathname });
  }, [pathname]);

  useEffect(() => {
    if (user) {
      identifyUser(user.uid, { email: user.email, name: user.displayName });
    } else {
      resetUser();
    }
  }, [user]);

  return <>{children}</>;
}
