const WEB_URL = import.meta.env.WXT_WEB_URL ?? "https://app.applyflow.app";

export default defineBackground(() => {
  // Auth token refresh every 50 minutes
  browser.alarms.create("refresh-token", { periodInMinutes: 50 });
  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== "refresh-token") return;
    await refreshAuthToken();
  });

  // Message bus
  browser.runtime.onMessage.addListener((message: { type: string; payload?: unknown }, _sender, sendResponse) => {
    if (message.type === "GET_SESSION") {
      browser.storage.local.get(["userProfile"]).then((data) => {
        sendResponse(data.userProfile ?? null);
      });
      return true;
    }

    if (message.type === "SIGN_OUT") {
      browser.storage.local.remove(["authToken", "userProfile"]).then(() => {
        sendResponse({ success: true });
      });
      return true;
    }

    if (message.type === "FILL_FORM") {
      // Forward fill request to the active tab's content script
      browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        if (tab?.id) {
          browser.tabs.sendMessage(tab.id, { type: "DO_FILL", payload: message.payload });
        }
      });
      sendResponse({ received: true });
      return true;
    }

    if (message.type === "LOG_ACTIVITY") {
      logActivity(message.payload as Record<string, unknown>);
      sendResponse({ received: true });
      return true;
    }

    if (message.type === "FIELD_MAP_REQUEST") {
      handleFieldMapRequest(message.payload as Record<string, unknown>).then(sendResponse);
      return true;
    }
  });

  // Listen for install event — open onboarding
  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      browser.tabs.create({ url: `${WEB_URL}/onboarding/install-extension?installed=1` });
    }
  });
});

async function refreshAuthToken() {
  const data = await browser.storage.local.get(["authToken"]);
  if (!data.authToken) return;

  try {
    const res = await fetch(`${WEB_URL}/api/auth/session`, {
      headers: { Authorization: `Bearer ${data.authToken}` },
    });
    if (!res.ok) {
      await browser.storage.local.remove(["authToken", "userProfile"]);
    }
  } catch {
    // Network error — keep existing token
  }
}

async function logActivity(payload: Record<string, unknown>) {
  const data = await browser.storage.local.get(["authToken"]);
  if (!data.authToken) return;

  try {
    await fetch(`${WEB_URL}/api/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.authToken}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Store locally and retry later
  }
}

async function handleFieldMapRequest(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const data = await browser.storage.local.get(["authToken"]);
  if (!data.authToken) return {};

  try {
    const res = await fetch(`${WEB_URL}/api/llm/field-map`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.authToken}`,
      },
      body: JSON.stringify(payload),
    });
    return await res.json() as Record<string, unknown>;
  } catch {
    return {};
  }
}
