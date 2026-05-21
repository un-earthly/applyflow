<<<<<<< HEAD
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
=======
export default () => {
  console.log('ApplyFlow background service worker loaded');

  interface MessageRequest {
    type: string;
    [key: string]: any;
  }

  // Message listener for popup and content scripts
  chrome.runtime.onMessage.addListener((request: MessageRequest, sender, sendResponse) => {
    handleMessage(request, sender, sendResponse);
    return true; // Allow async response
  });

  async function handleMessage(
    request: MessageRequest,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    try {
      switch (request.type) {
        case 'GET_AUTH_STATUS':
          handleGetAuthStatus(sendResponse);
          break;

        case 'GET_SETTINGS':
          handleGetSettings(sendResponse);
          break;

        case 'UPDATE_SETTINGS':
          handleUpdateSettings(request, sendResponse);
          break;

        case 'GET_RESUMES':
          handleGetResumes(sendResponse);
          break;

        case 'SET_DEFAULT_RESUME':
          handleSetDefaultResume(request, sendResponse);
          break;

        case 'GET_ACTIVITY_LOG':
          handleGetActivityLog(request, sendResponse);
          break;

        case 'LOGOUT':
          handleLogout(sendResponse);
          break;

        case 'DETECT_FORM':
          handleDetectForm(sender, sendResponse);
          break;

        default:
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Message handler error:', error);
      sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  function handleGetAuthStatus(sendResponse: (response?: any) => void) {
    chrome.storage.local.get(['session:token', 'auth:user', 'quota:usage'], (items: any) => {
      sendResponse({
        isLoggedIn: !!items['session:token'],
        user: items['auth:user'],
        quota: items['quota:usage'] ?? { used: 0, total: 50 },
      });
    });
  }

  function handleGetSettings(sendResponse: (response?: any) => void) {
    chrome.storage.local.get(['settings:preferences'], (items: any) => {
      sendResponse({
        settings: items['settings:preferences'] ?? {
          autoFill: false,
          autoSubmit: false,
          showOverlay: true,
          soundEnabled: true,
        },
      });
    });
  }

  function handleUpdateSettings(request: MessageRequest, sendResponse: (response?: any) => void) {
    chrome.storage.local.get(['settings:preferences'], (items: any) => {
      const updated = { ...items['settings:preferences'], ...request.settings };
      chrome.storage.local.set({ 'settings:preferences': updated }, () => {
        sendResponse({ settings: updated });
      });
    });
  }

  function handleGetResumes(sendResponse: (response?: any) => void) {
    chrome.storage.local.get(['cache:resumes'], (items: any) => {
      sendResponse({ resumes: items['cache:resumes'] ?? [] });
    });
  }

  function handleSetDefaultResume(request: MessageRequest, sendResponse: (response?: any) => void) {
    chrome.storage.local.get(['cache:resumes'], (items: any) => {
      const resumes = items['cache:resumes'] ?? [];
      const updated = resumes.map((r: any) => ({
        ...r,
        isDefault: r.id === request.resumeId,
      }));
      chrome.storage.local.set({ 'cache:resumes': updated }, () => {
        sendResponse({ success: true });
      });
    });
  }

  function handleGetActivityLog(request: MessageRequest, sendResponse: (response?: any) => void) {
    chrome.storage.local.get(['activity:log'], (items: any) => {
      const log = items['activity:log'] ?? [];
      const limit = request.limit ?? 50;
      sendResponse({ activities: log.slice(0, limit) });
    });
  }

  function handleLogout(sendResponse: (response?: any) => void) {
    chrome.storage.local.remove(['session:token', 'auth:user'], () => {
      sendResponse({ success: true });
    });
  }

  function handleDetectForm(sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    if (!sender.tab?.id) {
      sendResponse({ status: 'empty' });
      return;
    }

    // This would be implemented by the content script
    sendResponse({ status: 'empty' });
  }
};
>>>>>>> d735f1f7beede5531714c97ec3dd3b837c3ac3ef
