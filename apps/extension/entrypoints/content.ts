export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    const SUPPORTED_BOARDS: Record<string, { name: string; selectors: string[] }> = {
      "linkedin.com": {
        name: "LinkedIn",
        selectors: [
          'input[name="name"]',
          'input[type="email"]',
          'input[type="tel"]',
          'input[name="phoneNumber"]',
        ],
      },
      "greenhouse.io": {
        name: "Greenhouse",
        selectors: ["#first_name", "#last_name", "#email", "#phone"],
      },
      "lever.co": {
        name: "Lever",
        selectors: ['input[name="name"]', 'input[name="email"]', 'input[name="phone"]'],
      },
      "indeed.com": {
        name: "Indeed",
        selectors: [
          'input[name="applicant.name"]',
          'input[name="applicant.emailAddress"]',
        ],
      },
      "myworkdayjobs.com": {
        name: "Workday",
        selectors: [
          'input[data-automation-id="legalNameSection_firstName"]',
          'input[data-automation-id="legalNameSection_lastName"]',
        ],
      },
      "ashbyhq.com": {
        name: "Ashby",
        selectors: ['input[name="name"]', 'input[name="email"]'],
      },
    };

    interface DetectionState {
      status: "detected" | "no-form" | "unsupported";
      boardName?: string;
      fields?: { name: string; label: string; confidence: number }[];
    }

    let detectionState: DetectionState = { status: "no-form" };

    function detectBoard(): string | null {
      const host = window.location.hostname;
      for (const domain of Object.keys(SUPPORTED_BOARDS)) {
        if (host.includes(domain)) return domain;
      }
      return null;
    }

    function detectForm(domain: string): DetectionState {
      const board = SUPPORTED_BOARDS[domain]!;
      const foundFields: NonNullable<DetectionState["fields"]> = [];

      for (const selector of board.selectors) {
        const el = document.querySelector<HTMLInputElement>(selector);
        if (el) {
          const label =
            el.labels?.[0]?.textContent?.trim() ??
            el.getAttribute("aria-label") ??
            el.placeholder ??
            el.name ??
            "Unknown field";
          foundFields.push({ name: el.name || el.id, label, confidence: 0.9 });
        }
      }

      if (foundFields.length > 0) {
        return { status: "detected", boardName: board.name, fields: foundFields };
      }

      // Generic fallback
      const emailEl = document.querySelector<HTMLInputElement>('input[type="email"]');
      const nameEl = document.querySelector<HTMLInputElement>(
        'input[name*="name"], input[id*="name"]',
      );
      const genericFields: NonNullable<DetectionState["fields"]> = [];
      if (nameEl) genericFields.push({ name: "name", label: "Full name", confidence: 0.7 });
      if (emailEl) genericFields.push({ name: "email", label: "Email", confidence: 0.95 });

      if (genericFields.length > 0) {
        return { status: "detected", boardName: board.name, fields: genericFields };
      }

      return { status: "no-form" };
    }

    async function runDetection() {
      const domain = detectBoard();
      if (!domain) {
        detectionState = { status: "no-form" };
        return;
      }

      const result = detectForm(domain);
      detectionState = result;

      if (result.status === "detected") {
        browser.runtime.sendMessage({
          type: "FIELD_MAP_REQUEST",
          payload: {
            fields: result.fields?.map((f) => ({ name: f.name, label: f.label })) ?? [],
          },
        });
        showDetectorToast();
      }
    }

    function showDetectorToast() {
      if (document.getElementById("applyflow-toast")) return;

      const toast = document.createElement("div");
      toast.id = "applyflow-toast";
      toast.style.cssText = [
        "position:fixed",
        "bottom:24px",
        "right:24px",
        "width:320px",
        "background:white",
        "border:1px solid #e5e7eb",
        "border-radius:12px",
        "box-shadow:0 20px 60px rgba(0,0,0,.15)",
        "padding:16px",
        "z-index:2147483647",
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        "animation:applyflow-slide-in .3s ease",
      ].join(";");

      toast.innerHTML = `
        <style>
          @keyframes applyflow-slide-in{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        </style>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:20px">⚡</span>
            <div>
              <div style="font-size:13px;font-weight:600;color:#111">We can fill this for you</div>
              <div style="font-size:12px;color:#6b7280;margin-top:2px">ApplyFlow detected a job form</div>
            </div>
          </div>
          <button id="applyflow-toast-close" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:18px;line-height:1;padding:0" aria-label="Dismiss">×</button>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button id="applyflow-review" style="flex:1;background:none;border:1px solid #e5e7eb;border-radius:8px;padding:8px;font-size:13px;cursor:pointer;color:#374151">Review</button>
          <button id="applyflow-fill" style="flex:1;background:#2563eb;color:#fff;border:none;border-radius:8px;padding:8px;font-size:13px;cursor:pointer;font-weight:500">Fill form</button>
        </div>
      `;

      document.body.appendChild(toast);

      const dismiss = () => toast.remove();
      document.getElementById("applyflow-toast-close")?.addEventListener("click", dismiss);
      document.getElementById("applyflow-review")?.addEventListener("click", () => {
        dismiss();
        browser.runtime.sendMessage({ type: "OPEN_POPUP_TAB", payload: "current-job" });
      });
      document.getElementById("applyflow-fill")?.addEventListener("click", () => {
        dismiss();
        void fillForm();
      });

      setTimeout(dismiss, 12000);
    }

    async function fillForm() {
      if (detectionState.status !== "detected" || !detectionState.fields) return;

      const profile = await browser.runtime.sendMessage({ type: "GET_SESSION" }) as
        | { fullName?: string; email?: string; phone?: string }
        | null;

      if (!profile) return;

      const domain = detectBoard();
      if (!domain) return;
      const selectors = SUPPORTED_BOARDS[domain]?.selectors ?? [];

      for (const selector of selectors) {
        const el = document.querySelector<HTMLInputElement>(selector);
        if (!el) continue;

        const key = (el.name + el.id + el.placeholder).toLowerCase();
        let value = "";

        if (key.includes("first")) value = profile.fullName?.split(" ")[0] ?? "";
        else if (key.includes("last")) value = profile.fullName?.split(" ").slice(1).join(" ") ?? "";
        else if (key.includes("name")) value = profile.fullName ?? "";
        else if (key.includes("email")) value = profile.email ?? "";
        else if (key.includes("phone") || key.includes("tel")) value = profile.phone ?? "";

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
          fieldsCount: detectionState.fields.length,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Listen for messages from background / popup
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if (request.type === "DETECT_FORM") {
        sendResponse({
          status: detectionState.status,
          boardName: detectionState.boardName,
          fields: detectionState.fields ?? [],
        });
      } else if (request.type === "FILL_FORM") {
        void fillForm();
        sendResponse({ success: true });
      }
      return true;
    });

    // Run detection on load and on DOM mutations (for SPAs)
    const run = () => {
      setTimeout(() => { void runDetection(); }, 1000);
    };

    run();

    const observer = new MutationObserver(() => {
      if (!document.getElementById("applyflow-toast")) {
        void runDetection();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },
});
