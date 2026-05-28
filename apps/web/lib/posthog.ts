"use client";

import posthog from "posthog-js";

let initialized = false;

export function initPostHog(): void {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
    capture_pageview: false,
    persistence: "localStorage",
  });
  initialized = true;
}

export function track(event: string, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}

export function identifyUser(uid: string, traits?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  posthog.identify(uid, traits);
}

export function resetUser(): void {
  if (typeof window === "undefined") return;
  posthog.reset();
}

export { posthog };
