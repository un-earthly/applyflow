export default () => {
  interface MessageRequest {
    type: string;
    [key: string]: any;
  }

  const APP_URL = process.env.PLASMO_PUBLIC_APP_URL ?? "https://app.applyflow.io";

  // ── Message bus ─────────────────────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((request: MessageRequest, sender, sendResponse) => {
    void handleMessage(request, sender, sendResponse);
    return true;
  });

  async function handleMessage(
    request: MessageRequest,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ) {
    try {
      switch (request.type) {
        case "GET_AUTH_STATUS":
          sendResponse(await getAuthStatus());
          break;

        case "GET_SESSION":
          sendResponse(await getSession());
          break;

        case "GET_SETTINGS":
          sendResponse({ settings: await getSettings() });
          break;

        case "UPDATE_SETTINGS": {
          const current = await getSettings();
          const updated = { ...current, ...request.settings };
          await chrome.storage.local.set({ "settings:preferences": updated });
          sendResponse({ settings: updated });
          break;
        }

        case "GET_RESUMES":
          sendResponse({ resumes: await getCachedResumes() });
          break;

        case "SET_DEFAULT_RESUME": {
          const resumes = await getCachedResumes();
          const updated = resumes.map((r: any) => ({
            ...r,
            isDefault: r.id === request.resumeId,
          }));
          await chrome.storage.local.set({ "cache:resumes": updated });
          sendResponse({ success: true });
          break;
        }

        case "GET_ACTIVITY_LOG": {
          const items = await chrome.storage.local.get(["activity:log"]);
          const log = (items["activity:log"] ?? []) as unknown[];
          sendResponse({ activities: log.slice(0, request.limit ?? 50) });
          break;
        }

        case "LOG_ACTIVITY":
          await handleLogActivity(request.payload, sender.tab?.id);
          sendResponse({ success: true });
          break;

        case "FIELD_MAP_REQUEST":
          await handleFieldMapRequest(request.payload, sender.tab?.id);
          sendResponse({ success: true });
          break;

        case "LOGOUT":
          await chrome.storage.local.remove(["session:token", "auth:user", "cache:resumes"]);
          sendResponse({ success: true });
          break;

        case "OPEN_POPUP_TAB":
          // Handled by popup itself via storage flag
          await chrome.storage.local.set({ "popup:activeTab": request.payload });
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ error: "Unknown message type" });
      }
    } catch (err) {
      console.error("[ApplyFlow] Message handler error:", err);
      sendResponse({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  // ── Auth helpers ─────────────────────────────────────────────────────────────

  async function getAuthStatus() {
    const items = await chrome.storage.local.get(["session:token", "auth:user", "quota:usage"]);
    return {
      isLoggedIn: !!items["session:token"],
      user: items["auth:user"],
      quota: items["quota:usage"] ?? { used: 0, total: 50 },
    };
  }

  async function getSession(): Promise<{
    fullName?: string;
    email?: string;
    phone?: string;
  } | null> {
    const items = await chrome.storage.local.get(["auth:user"]);
    return (items["auth:user"] as any) ?? null;
  }

  async function getAuthToken(): Promise<string | null> {
    const items = await chrome.storage.local.get(["session:token"]);
    return (items["session:token"] as string) ?? null;
  }

  // ── Settings ────────────────────────────────────────────────────────────────

  async function getSettings() {
    const items = await chrome.storage.local.get(["settings:preferences"]);
    return (
      (items["settings:preferences"] as object) ?? {
        autoFill: false,
        autoSubmit: false,
        showOverlay: true,
        soundEnabled: true,
      }
    );
  }

  // ── Resume cache ─────────────────────────────────────────────────────────────

  async function getCachedResumes(): Promise<unknown[]> {
    const items = await chrome.storage.local.get(["cache:resumes"]);
    return (items["cache:resumes"] as unknown[]) ?? [];
  }

  // ── Activity logging ─────────────────────────────────────────────────────────

  async function handleLogActivity(
    payload: {
      type: string;
      url: string;
      boardName?: string;
      fieldsCount?: number;
      timestamp: string;
    },
    tabId: number | undefined,
  ) {
    // 1. Append to local activity log (last 200 entries)
    const items = await chrome.storage.local.get(["activity:log"]);
    const log = ((items["activity:log"] as unknown[]) ?? []) as unknown[];
    const entry = { ...payload, id: crypto.randomUUID(), tabId };
    const updated = [entry, ...log].slice(0, 200);
    await chrome.storage.local.set({ "activity:log": updated });

    // 2. POST to web API to create/update the application record
    const token = await getAuthToken();
    if (!token) return;

    try {
      await fetch(`${APP_URL}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          source: payload.boardName?.toLowerCase().replace(/\s+/g, "") ?? "direct",
          url: payload.url,
          status: "applied",
          appliedAt: payload.timestamp,
          autofillFieldsCount: payload.fieldsCount ?? 0,
        }),
      });
    } catch (err) {
      console.warn("[ApplyFlow] Failed to sync activity to API:", err);
    }
  }

  // ── LLM field-map proxy ───────────────────────────────────────────────────────

  async function handleFieldMapRequest(
    payload: { fields: { name: string; label: string }[] },
    tabId: number | undefined,
  ) {
    if (!tabId) return;
    const token = await getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`${APP_URL}/api/llm/field-map`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) return;
      const mappings = (await res.json()) as Record<string, string>;

      chrome.tabs.sendMessage(tabId, {
        type: "FIELD_MAP_RESPONSE",
        payload: mappings,
      });
    } catch (err) {
      console.warn("[ApplyFlow] Field-map request failed:", err);
    }
  }

  // ── Extension auth pairing — monitors tabs for /auth/extension-success?code= ─

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete" || !tab.url) return;
    const url = new URL(tab.url);
    if (!url.href.startsWith(APP_URL) || url.pathname !== "/auth/extension-success") return;

    const code = url.searchParams.get("code");
    if (!code) return;

    try {
      const res = await fetch(`${APP_URL}/api/auth/extension-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) return;
      const { idToken } = (await res.json()) as { idToken: string };
      if (!idToken) return;

      // Fetch user profile to store alongside token
      let userData: Record<string, unknown> = {};
      try {
        const profileRes = await fetch(`${APP_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (profileRes.ok) {
          userData = await profileRes.json() as Record<string, unknown>;
        }
      } catch {
        // Non-fatal — auth still works without profile
      }

      await chrome.storage.local.set({
        "session:token": idToken,
        "auth:user": userData,
      });
    } catch (err) {
      console.warn("[ApplyFlow] Extension auth pairing failed:", err);
    }
  });

  // ── Token refresh alarm (every 50 min) ──────────────────────────────────────

  chrome.alarms.create("token-refresh", { periodInMinutes: 50 });
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== "token-refresh") return;
    const token = await getAuthToken();
    if (!token) return;
    try {
      const res = await fetch(`${APP_URL}/api/auth/session`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { token: newToken } = (await res.json()) as { token?: string };
        if (newToken) {
          await chrome.storage.local.set({ "session:token": newToken });
        }
      }
    } catch {
      // Silently ignore; next alarm will retry
    }
  });
};
