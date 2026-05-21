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
