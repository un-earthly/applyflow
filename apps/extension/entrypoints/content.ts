const SUPPORTED_BOARDS: Record<string, string[]> = {
  "linkedin.com": [
    'input[name="name"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[name="phoneNumber"]',
  ],
  "greenhouse.io": [
    '#first_name', '#last_name', '#email', '#phone',
  ],
  "lever.co": [
    'input[name="name"]', 'input[name="email"]', 'input[name="phone"]',
  ],
  "indeed.com": [
    'input[name="applicant.name"]', 'input[name="applicant.emailAddress"]',
  ],
  "myworkdayjobs.com": [
    'input[data-automation-id="legalNameSection_firstName"]',
    'input[data-automation-id="legalNameSection_lastName"]',
  ],
  "ashbyhq.com": [
    'input[name="name"]', 'input[name="email"]',
  ],
};

interface DetectionState {
  status: "detected" | "no-form" | "unsupported";
  boardName?: string;
  fields?: { name: string; label: string; confidence: number }[];
}

let detectionState: DetectionState = { status: "no-form" };

function detectBoard(): string | null {
  const host = window.location.hostname;
  for (const board of Object.keys(SUPPORTED_BOARDS)) {
    if (host.includes(board)) return board;
  }
  return null;
}

function detectForm(board: string): DetectionState {
  const selectors = SUPPORTED_BOARDS[board] ?? [];
  const foundFields: DetectionState["fields"] = [];

  for (const selector of selectors) {
    const el = document.querySelector<HTMLInputElement>(selector);
    if (el) {
      const label = el.labels?.[0]?.textContent?.trim() ?? el.placeholder ?? el.name ?? "Unknown field";
      foundFields.push({ name: el.name ?? el.id, label, confidence: 0.9 });
    }
  }

  if (foundFields.length > 0) {
    return { status: "detected", boardName: board, fields: foundFields };
  }

  // Generic form detection fallback
  const emailInput = document.querySelector<HTMLInputElement>('input[type="email"]');
  const nameInput = document.querySelector<HTMLInputElement>('input[name*="name"], input[id*="name"]');

  if (emailInput || nameInput) {
    const genericFields: DetectionState["fields"] = [];
    if (nameInput) genericFields.push({ name: "name", label: "Full name", confidence: 0.7 });
    if (emailInput) genericFields.push({ name: "email", label: "Email", confidence: 0.95 });
    return { status: "detected", boardName: board, fields: genericFields };
  }

  return { status: "no-form" };
}

async function runDetection() {
  const board = detectBoard();
  if (!board) {
    detectionState = { status: "no-form" };
    return;
  }

  const result = detectForm(board);
  detectionState = result;

  if (result.status === "detected") {
    // Request field mappings from background
    const fieldMapRequest = {
      fields: result.fields?.map((f) => ({ name: f.name, label: f.label })) ?? [],
    };
    browser.runtime.sendMessage({ type: "FIELD_MAP_REQUEST", payload: fieldMapRequest });

    // Show overlay
    showDetectorToast();
  }
}

function showDetectorToast() {
  if (document.getElementById("applyflow-toast")) return;

  const toast = document.createElement("div");
  toast.id = "applyflow-toast";
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 320px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    padding: 16px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    animation: slideIn 0.3s ease;
  `;

  toast.innerHTML = `
    <style>@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }</style>
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:20px">⚡</span>
        <div>
          <div style="font-size:13px;font-weight:600;color:#111">We can fill this for you</div>
          <div style="font-size:12px;color:#6b7280;margin-top:2px">ApplyFlow detected a job form</div>
        </div>
      </div>
      <button id="applyflow-toast-close" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:16px;padding:0;line-height:1">×</button>
    </div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button id="applyflow-review" style="flex:1;background:none;border:1px solid #e5e7eb;border-radius:8px;padding:8px;font-size:13px;cursor:pointer;color:#374151">Review</button>
      <button id="applyflow-fill" style="flex:1;background:#2563eb;color:white;border:none;border-radius:8px;padding:8px;font-size:13px;cursor:pointer;font-weight:500">Fill form</button>
    </div>
  `;

  document.body.appendChild(toast);

  const dismiss = () => toast.remove();
  document.getElementById("applyflow-toast-close")?.addEventListener("click", dismiss);
  document.getElementById("applyflow-fill")?.addEventListener("click", () => { dismiss(); fillForm(); });
  document.getElementById("applyflow-review")?.addEventListener("click", () => { dismiss(); showReviewPanel(); });

  // Auto-hide after 12 seconds
  setTimeout(dismiss, 12000);
}

function fillForm() {
  if (detectionState.status !== "detected" || !detectionState.fields) return;

  browser.runtime.sendMessage({ type: "GET_SESSION" }).then((profile: { fullName?: string; email?: string; phone?: string } | null) => {
    if (!profile) return;

    const board = detectionState.boardName ?? "";
    const selectors = SUPPORTED_BOARDS[board] ?? [];

    for (const selector of selectors) {
      const el = document.querySelector<HTMLInputElement>(selector);
      if (!el) continue;

      const key = (el.name + el.id + el.placeholder).toLowerCase();
      let value = "";

      if (key.includes("first")) value = profile.fullName?.split(" ")[0] ?? "";
      else if (key.includes("last")) value = profile.fullName?.split(" ").slice(1).join(" ") ?? "";
      else if (key.includes("name")) value = profile.fullName ?? "";
      else if (key.includes("email")) value = profile.email ?? "";
      else if (key.includes("phone")) value = profile.phone ?? "";

      if (value) {
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    browser.runtime.sendMessage({
      type: "LOG_ACTIVITY",
      payload: {
        type: "fill",
        url: window.location.href,
        boardName: detectionState.boardName,
        fieldsCount: detectionState.fields?.length ?? 0,
        timestamp: new Date().toISOString(),
      },
    });
  });
}

function showReviewPanel() {
  // Opens the popup to the current-job tab
  browser.runtime.sendMessage({ type: "OPEN_POPUP_TAB", payload: "current-job" });
}

export default defineContentScript({
  matches: [
    "*://*.linkedin.com/*",
    "*://*.indeed.com/*",
    "*://*.greenhouse.io/*",
    "*://jobs.lever.co/*",
    "*://*.myworkdayjobs.com/*",
    "*://*.ashbyhq.com/*",
    "*://*.recruitee.com/*",
    "*://*.bamboohr.com/*",
    "*://*.smartrecruiters.com/*",
  ],

  main() {
    // Run detection on load
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => void runDetection());
    } else {
      void runDetection();
    }

    // Re-run on navigation (SPA support)
    const observer = new MutationObserver(() => {
      void runDetection();
    });
    observer.observe(document.body, { childList: true, subtree: false });

    // Message handler for popup queries
    browser.runtime.onMessage.addListener((message: { type: string }, _sender, sendResponse) => {
      if (message.type === "GET_DETECTION_STATUS") {
        sendResponse(detectionState);
        return true;
      }
      if (message.type === "DO_FILL") {
        fillForm();
        sendResponse({ success: true });
        return true;
      }
    });
  },
});
