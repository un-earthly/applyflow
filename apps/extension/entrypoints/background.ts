export default () => {
  interface MessageRequest {
    type: string;
    [key: string]: any;
  }

  const APP_URL = import.meta.env.WXT_APP_URL ?? "https://app.applyflow.io";

  // ── Cookie-based auth discovery ──────────────────────────────────────────────
  // Finds the af_id_token cookie across ALL domains (not just APP_URL) so that
  // dev users logged in on localhost are auto-synced without setting WXT_APP_URL.

  function apiBaseFromCookieDomain(domain: string): string {
    if (domain.includes("localhost")) return "http://localhost:3000";
    if (domain.includes("applyflow.io")) return "https://app.applyflow.io";
    return APP_URL;
  }

  async function syncAuthFromCookie(): Promise<boolean> {
    try {
      const items = await chrome.storage.local.get(["session:token"]);
      if (items["session:token"]) return true; // already have a token

      const cookies = await chrome.cookies.getAll({ name: "af_id_token" });
      if (!cookies.length) return false;

      const cookie = cookies[0]!;
      const baseUrl = apiBaseFromCookieDomain(cookie.domain ?? "");

      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${cookie.value}` },
      });
      if (!res.ok) return false;

      const userData = await res.json() as Record<string, unknown>;
      await chrome.storage.local.set({
        "session:token": cookie.value,
        "auth:user": userData,
      });
      console.log("[ApplyFlow BG] Cookie auto-sync succeeded for domain:", cookie.domain);
      return true;
    } catch (e) {
      console.warn("[ApplyFlow BG] Cookie auto-sync failed:", e);
      return false;
    }
  }

  // Run cookie sync on service-worker startup so the popup is already authed
  // when the user first opens it after logging in on the web app.
  void syncAuthFromCookie();

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
        case "GET_AUTH_STATUS": {
          let status = await getAuthStatus();
          // Never await syncAuthFromCookie() here — it calls fetch() which can
          // hang, causing sendResponse to never fire and the popup to stall.
          // Fire-and-forget; the startup call + next GET_AUTH_STATUS will pick it up.
          if (!status.isLoggedIn) {
            void syncAuthFromCookie();
          }
          sendResponse(status);
          break;
        }

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

        case "PAIR_CODE": {
          console.log("[ApplyFlow BG] PAIR_CODE received:", request.code);
          if (!request.code) {
            sendResponse({ success: false, error: "Missing code" });
            break;
          }
          const ok = await exchangePairingCode(request.code);
          sendResponse({ success: ok });
          break;
        }

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
    console.log("[ApplyFlow BG] getAuthStatus read:", {
      isLoggedIn: !!items["session:token"],
      tokenPreview: (items["session:token"] as string | undefined)?.slice(0, 20) + "...",
      hasUser: !!items["auth:user"],
    });
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

  // ── Extension auth pairing ─────────────────────────────────────────────────

  async function exchangePairingCode(code: string): Promise<boolean> {
    console.log("[ApplyFlow BG] Exchanging pairing code:", code);
    try {
      const res = await fetch(`${APP_URL}/api/auth/extension-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("[ApplyFlow BG] extension-token error:", res.status, body);
        return false;
      }

      const { idToken } = (await res.json()) as { idToken: string };
      if (!idToken) {
        console.error("[ApplyFlow BG] extension-token response missing idToken");
        return false;
      }

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

      console.log("[ApplyFlow BG] Extension auth pairing succeeded");
      return true;
    } catch (err) {
      console.error("[ApplyFlow BG] Extension auth pairing failed:", err);
      return false;
    }
  }

  // Fallback: monitor tabs for /auth/extension-success?code= (legacy / secondary)
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete" || !tab.url) return;
    const url = new URL(tab.url);
    if (!url.href.startsWith(APP_URL) || url.pathname !== "/auth/extension-success") return;

    const code = url.searchParams.get("code");
    if (!code) {
      console.warn("[ApplyFlow BG] Tab reached extension-success but no code in URL");
      return;
    }

    console.log("[ApplyFlow BG] Fallback tab capture for code:", code);
    await exchangePairingCode(code);
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
      if (res.status === 401) {
        // Token expired — clear session so popup shows sign-in
        await chrome.storage.local.remove(["session:token", "auth:user"]);
      }
    } catch {
      // Silently ignore; next alarm will retry
    }
  });
};
