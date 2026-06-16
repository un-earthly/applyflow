export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    // ── Extension auth bridge ────────────────────────────────────────────────
    if (location.pathname === "/auth/extension-success") {
      const sendPairCode = async () => {
        const el = document.getElementById("af-extension-bridge");
        const code = el?.dataset.code ?? new URLSearchParams(location.search).get("code");
        if (code) {
          try {
            const res = await browser.runtime.sendMessage({ type: "PAIR_CODE", code });
            console.log("[ApplyFlow Content] PAIR_CODE acknowledged:", res);
          } catch (err) {
            console.warn("[ApplyFlow Content] PAIR_CODE send failed:", err);
          }
        }
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => { void sendPairCode(); });
      } else {
        void sendPairCode();
      }
    }

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

    interface DetectedField {
      name: string;
      label: string;
      confidence: number;
      mappedValue?: string;
    }

    interface DetectionState {
      status: "detected" | "no-form" | "unsupported";
      boardName?: string;
      fields?: DetectedField[];
    }

    let detectionState: DetectionState = { status: "no-form" };

    // ── Helpers ──────────────────────────────────────────────────────────────

    const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    function waitForElement(selector: string, timeout = 3000): Promise<Element | null> {
      return new Promise(resolve => {
        const el = document.querySelector(selector);
        if (el) { resolve(el); return; }
        const obs = new MutationObserver(() => {
          const found = document.querySelector(selector);
          if (found) { obs.disconnect(); resolve(found); }
        });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => { obs.disconnect(); resolve(null); }, timeout);
      });
    }

    // Native value setter — required for React-controlled inputs (LinkedIn uses React)
    const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    const nativeTextareaSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;

    // ── Shadow DOM host setup ────────────────────────────────────────────────

    function createShadowHost(id: string): ShadowRoot {
      let host = document.getElementById(id);
      if (host) host.remove();
      host = document.createElement("div");
      host.id = id;
      host.style.cssText = "position:fixed;top:0;left:0;z-index:2147483647;pointer-events:none";
      document.body.appendChild(host);
      return host.attachShadow({ mode: "open" });
    }

    const OVERLAY_STYLES = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      :host { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; }
      button { cursor: pointer; font-family: inherit; font-size: 14px; }
      input { font-family: inherit; font-size: 14px; }

      @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
      @keyframes slide-in-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

      .toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 320px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0,0,0,.15);
        padding: 16px;
        pointer-events: all;
        animation: slide-in-up .3s ease;
      }
      .toast-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
      .toast-icon { font-size: 20px; }
      .toast-title { font-size: 13px; font-weight: 600; color: #111; }
      .toast-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
      .toast-close { background: none; border: none; color: #9ca3af; font-size: 18px; line-height: 1; padding: 0; }
      .toast-actions { display: flex; gap: 8px; margin-top: 12px; }
      .btn-ghost { flex: 1; background: none; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; color: #374151; }
      .btn-ghost:hover { background: #f9fafb; }
      .btn-primary { flex: 1; background: #2563eb; color: #fff; border: none; border-radius: 8px; padding: 8px; font-weight: 500; }
      .btn-primary:hover { background: #1d4ed8; }

      .panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 400px;
        height: 100vh;
        background: #fff;
        border-left: 1px solid #e5e7eb;
        box-shadow: -20px 0 60px rgba(0,0,0,.12);
        display: flex;
        flex-direction: column;
        pointer-events: all;
        animation: slide-in-right .25s ease;
      }
      .panel-header { padding: 16px; border-bottom: 1px solid #f3f4f6; }
      .panel-header-row { display: flex; align-items: center; justify-content: space-between; }
      .panel-title { font-size: 15px; font-weight: 600; color: #111; }
      .panel-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
      .panel-close { background: none; border: none; color: #9ca3af; font-size: 22px; line-height: 1; padding: 4px; }
      .panel-close:hover { color: #374151; }
      .panel-fields { flex: 1; overflow-y: auto; padding: 12px 16px; display: flex; flex-direction: column; gap: 12px; }
      .field-row { display: flex; flex-direction: column; gap: 4px; }
      .field-label-row { display: flex; align-items: center; gap: 6px; }
      .field-label { font-size: 12px; font-weight: 500; color: #374151; }
      .confidence-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
      .conf-high { background: #10b981; }
      .conf-mid { background: #f59e0b; }
      .conf-low { background: #ef4444; }
      .field-input {
        width: 100%;
        padding: 6px 10px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        font-size: 13px;
        color: #111;
        background: #fff;
        outline: none;
      }
      .field-input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,.15); }
      .panel-footer { padding: 12px 16px; border-top: 1px solid #f3f4f6; display: flex; gap: 8px; }
      .btn-cancel { flex: 1; background: none; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; color: #374151; }
      .btn-fill { flex: 2; background: #2563eb; color: #fff; border: none; border-radius: 8px; padding: 10px; font-weight: 500; }
      .btn-fill:hover { background: #1d4ed8; }
    `;

    // ── Toast overlay ────────────────────────────────────────────────────────

    let toastRoot: ShadowRoot | null = null;

    function showDetectorToast() {
      if (document.getElementById("applyflow-toast-host")) return;
      toastRoot = createShadowHost("applyflow-toast-host");

      const style = document.createElement("style");
      style.textContent = OVERLAY_STYLES;
      toastRoot.appendChild(style);

      const toast = document.createElement("div");
      toast.className = "toast";
      toast.innerHTML = `
        <div class="toast-header">
          <div>
            <div class="toast-icon">⚡</div>
            <div class="toast-title">We can fill this for you</div>
            <div class="toast-sub">ApplyFlow detected a job form</div>
          </div>
          <button class="toast-close" aria-label="Dismiss">×</button>
        </div>
        <div class="toast-actions">
          <button class="btn-ghost" id="af-review">Review</button>
          <button class="btn-primary" id="af-fill">Fill form</button>
        </div>
      `;
      toastRoot.appendChild(toast);

      const dismiss = () => document.getElementById("applyflow-toast-host")?.remove();
      toast.querySelector(".toast-close")!.addEventListener("click", dismiss);
      toast.querySelector("#af-fill")!.addEventListener("click", () => { dismiss(); void fillForm(null); });
      toast.querySelector("#af-review")!.addEventListener("click", () => { dismiss(); showReviewPanel(); });
      setTimeout(dismiss, 12000);
    }

    // ── Review panel ─────────────────────────────────────────────────────────

    function showReviewPanel() {
      document.getElementById("applyflow-panel-host")?.remove();
      const root = createShadowHost("applyflow-panel-host");
      (root.host as HTMLElement).style.pointerEvents = "all";

      const style = document.createElement("style");
      style.textContent = OVERLAY_STYLES;
      root.appendChild(style);

      const fields = detectionState.fields ?? [];
      const pageTitle = document.title;
      const boardName = detectionState.boardName ?? "Job application";

      const fieldValues: Record<string, string> = {};

      const panel = document.createElement("div");
      panel.className = "panel";

      const confClass = (c: number) =>
        c >= 0.85 ? "conf-high" : c >= 0.6 ? "conf-mid" : "conf-low";

      panel.innerHTML = `
        <div class="panel-header">
          <div class="panel-header-row">
            <div>
              <div class="panel-title">${boardName}</div>
              <div class="panel-sub">${pageTitle.slice(0, 60)}</div>
            </div>
            <button class="panel-close" id="af-panel-close" aria-label="Close">×</button>
          </div>
        </div>
        <div class="panel-fields" id="af-panel-fields"></div>
        <div class="panel-footer">
          <button class="btn-cancel" id="af-panel-cancel">Cancel</button>
          <button class="btn-fill" id="af-panel-fill">Fill all</button>
        </div>
      `;
      root.appendChild(panel);

      const fieldsContainer = panel.querySelector("#af-panel-fields")!;
      for (const field of fields) {
        fieldValues[field.name] = field.mappedValue ?? "";
        const row = document.createElement("div");
        row.className = "field-row";
        row.innerHTML = `
          <div class="field-label-row">
            <span class="confidence-dot ${confClass(field.confidence)}"></span>
            <span class="field-label">${field.label}</span>
          </div>
          <input
            class="field-input"
            data-field="${field.name}"
            value="${field.mappedValue ?? ""}"
            placeholder="No value mapped"
          />
        `;
        fieldsContainer.appendChild(row);
      }

      fieldsContainer.querySelectorAll<HTMLInputElement>(".field-input").forEach((input) => {
        input.addEventListener("input", () => {
          fieldValues[input.dataset.field!] = input.value;
        });
      });

      const close = () => document.getElementById("applyflow-panel-host")?.remove();
      panel.querySelector("#af-panel-close")!.addEventListener("click", close);
      panel.querySelector("#af-panel-cancel")!.addEventListener("click", close);
      panel.querySelector("#af-panel-fill")!.addEventListener("click", () => {
        close();
        void fillForm(fieldValues);
      });
    }

    // ── Detection ────────────────────────────────────────────────────────────

    function detectBoard(): string | null {
      const host = window.location.hostname;
      for (const domain of Object.keys(SUPPORTED_BOARDS)) {
        if (host.includes(domain)) return domain;
      }
      return null;
    }

    function detectLinkedInEasyApply(): { btn: HTMLButtonElement; jobTitle: string; company: string } | null {
      const btn = document.querySelector<HTMLButtonElement>(
        'button.jobs-apply-button, button[aria-label*="Easy Apply"], .jobs-apply-button--top-card button',
      );
      if (!btn) return null;
      const jobTitle =
        document.querySelector(".job-details-jobs-unified-top-card__job-title, .t-24")
          ?.textContent?.trim() ?? "";
      const company =
        document.querySelector(
          ".jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__company-name",
        )?.textContent?.trim() ?? "";
      return { btn, jobTitle, company };
    }

    function detectForm(domain: string): DetectionState {
      const board = SUPPORTED_BOARDS[domain]!;
      const foundFields: DetectedField[] = [];

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

      const emailEl = document.querySelector<HTMLInputElement>('input[type="email"]');
      const nameEl = document.querySelector<HTMLInputElement>(
        'input[name*="name"], input[id*="name"]',
      );
      const genericFields: DetectedField[] = [];
      if (nameEl) genericFields.push({ name: "name", label: "Full name", confidence: 0.7 });
      if (emailEl) genericFields.push({ name: "email", label: "Email", confidence: 0.95 });

      if (genericFields.length > 0) {
        return { status: "detected", boardName: board.name, fields: genericFields };
      }

      return { status: "no-form" };
    }

    async function getDefaultResumeId(): Promise<string | undefined> {
      const items = await chrome.storage.local.get(["cache:resumes"]);
      const resumes = (items["cache:resumes"] as Array<{ id: string; isDefault: boolean }>) ?? [];
      return (resumes.find(r => r.isDefault) ?? resumes[0])?.id;
    }

    async function runDetection() {
      const domain = detectBoard();
      if (!domain) {
        detectionState = { status: "no-form" };
        return;
      }

      // LinkedIn: check for Easy Apply button first
      if (domain === "linkedin.com") {
        const easyApply = detectLinkedInEasyApply();
        if (easyApply) {
          await chrome.storage.local.set({
            "detected:job": {
              jobTitle: easyApply.jobTitle,
              company: easyApply.company,
              url: location.href,
              boardName: "LinkedIn",
              detectedAt: new Date().toISOString(),
            },
          });
          browser.runtime.sendMessage({ type: "JOB_DETECTED" }).catch(() => {});
          // Don't show toast yet — popup handles the Easy Apply UI
          return;
        } else {
          // Button gone (navigated away) — clear stale job detection
          await chrome.storage.local.remove(["detected:job"]);
        }
      }

      const result = detectForm(domain);
      detectionState = result;

      if (result.status === "detected") {
        const resumeId = await getDefaultResumeId();
        browser.runtime.sendMessage({
          type: "FIELD_MAP_REQUEST",
          payload: {
            fields: result.fields?.map((f) => ({ name: f.name, label: f.label })) ?? [],
            resumeId,
          },
        });
        showDetectorToast();
      }
    }

    // ── Apply field value (all types) ────────────────────────────────────────

    async function applyFieldValue(el: Element, value: string): Promise<void> {
      if (!value) return;

      const tag = el.tagName.toLowerCase();
      const type = (el as HTMLInputElement).type?.toLowerCase() ?? "text";

      if (tag === "select") {
        const sel = el as HTMLSelectElement;
        const opt = Array.from(sel.options).find(
          o => o.value.toLowerCase() === value.toLowerCase() ||
               o.text.toLowerCase().includes(value.toLowerCase()),
        );
        if (opt) {
          sel.value = opt.value;
          sel.dispatchEvent(new Event("change", { bubbles: true }));
        }
        return;
      }

      if (tag === "textarea") {
        const ta = el as HTMLTextAreaElement;
        if (nativeTextareaSetter) nativeTextareaSetter.call(ta, value);
        else ta.value = value;
        ta.dispatchEvent(new Event("input", { bubbles: true }));
        ta.dispatchEvent(new Event("change", { bubbles: true }));
        return;
      }

      if (type === "radio") {
        const group = el.closest("fieldset, [role=radiogroup], .fb-dash-form-element");
        const radios = (group ?? document).querySelectorAll<HTMLInputElement>(`input[type=radio][name="${(el as HTMLInputElement).name}"]`);
        const match = Array.from(radios).find(
          r => r.value.toLowerCase().includes(value.toLowerCase()) ||
               (r.labels?.[0]?.textContent?.toLowerCase() ?? "").includes(value.toLowerCase()),
        );
        if (match) {
          match.click();
          match.dispatchEvent(new Event("change", { bubbles: true }));
        }
        return;
      }

      if (type === "checkbox") {
        const cb = el as HTMLInputElement;
        const affirmative = ["yes", "true", "1", "agree", "accept"].includes(value.toLowerCase());
        if (affirmative !== cb.checked) cb.click();
        return;
      }

      if (type === "file") {
        try {
          const items = await chrome.storage.local.get(["cache:resumes"]);
          const resumes = (items["cache:resumes"] as Array<{ id: string; isDefault: boolean; pdfUrl: string }>) ?? [];
          const resume = resumes.find(r => r.isDefault) ?? resumes[0];
          if (resume?.pdfUrl) {
            const pdfRes = await fetch(resume.pdfUrl);
            const blob = await pdfRes.blob();
            const file = new File([blob], "resume.pdf", { type: "application/pdf" });
            const dt = new DataTransfer();
            dt.items.add(file);
            (el as HTMLInputElement).files = dt.files;
            el.dispatchEvent(new Event("change", { bubbles: true }));
          }
        } catch {
          // File injection failed silently — user can upload manually
        }
        return;
      }

      // text / email / tel / url / number / date
      const input = el as HTMLInputElement;
      if (nativeInputSetter) nativeInputSetter.call(input, value);
      else input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // ── Fill container (replaces old fillForm for all contexts) ──────────────

    async function fillContainer(
      container: Element,
      overrides: Record<string, string> | null = null,
    ): Promise<void> {
      const profile = (await browser.runtime.sendMessage({ type: "GET_SESSION" })) as
        | { fullName?: string; email?: string; phone?: string }
        | null;

      const inputs = Array.from(
        container.querySelectorAll<Element>("input, textarea, select"),
      ).filter(el => {
        const type = (el as HTMLInputElement).type?.toLowerCase();
        return type !== "hidden" && type !== "submit" && type !== "button" && type !== "reset";
      });

      for (const el of inputs) {
        const input = el as HTMLInputElement;
        const key = input.name || input.id || "";
        const labelEl =
          input.labels?.[0] ??
          container.querySelector(`label[for="${input.id}"]`);
        const labelText =
          labelEl?.textContent?.trim() ??
          input.getAttribute("aria-label") ??
          input.placeholder ??
          key;

        let value = "";

        if (overrides?.[key] !== undefined) {
          value = overrides[key];
        } else if (detectionState.fields) {
          const mapped = detectionState.fields.find(f => f.name === key)?.mappedValue;
          if (mapped) value = mapped;
        }

        // Heuristic fallback from profile
        if (!value && profile) {
          const hint = (key + " " + labelText).toLowerCase();
          if (hint.includes("first") && hint.includes("name"))
            value = profile.fullName?.split(" ")[0] ?? "";
          else if (hint.includes("last") && hint.includes("name"))
            value = profile.fullName?.split(" ").slice(1).join(" ") ?? "";
          else if (hint.includes("name")) value = profile.fullName ?? "";
          else if (hint.includes("email")) value = profile.email ?? "";
          else if (hint.includes("phone") || hint.includes("tel")) value = profile.phone ?? "";
        }

        if (value) await applyFieldValue(el, value);
      }
    }

    // ── Legacy fillForm (used by review panel + FILL_FORM message) ───────────

    async function fillForm(overrides: Record<string, string> | null) {
      if (detectionState.status !== "detected" || !detectionState.fields) return;
      await fillContainer(document.body, overrides);
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

    // ── LinkedIn multi-step Easy Apply handler ───────────────────────────────

    async function clickEasyApplyAndFill(): Promise<void> {
      const result = detectLinkedInEasyApply();
      if (!result) return;

      result.btn.click();

      const modal = await waitForElement(
        '.jobs-easy-apply-content, [data-test-modal], .jobs-easy-apply-modal',
        4000,
      );
      if (!modal) {
        console.warn("[ApplyFlow] Easy Apply modal did not appear");
        return;
      }

      const resumeId = await getDefaultResumeId();
      const MAX_STEPS = 10;

      for (let step = 0; step < MAX_STEPS; step++) {
        await sleep(700);

        // Fill all visible fields in the modal
        await fillContainer(modal);

        // Check for submit button
        const submitBtn = modal.querySelector<HTMLButtonElement>(
          'button[aria-label*="Submit application"], button[aria-label*="submit application"]',
        );
        if (submitBtn) {
          const prefs = (await chrome.storage.local.get(["settings:preferences"]))["settings:preferences"] as
            | { autoSubmit?: boolean }
            | undefined;
          if (prefs?.autoSubmit) {
            submitBtn.click();
            browser.runtime.sendMessage({
              type: "LOG_ACTIVITY",
              payload: {
                type: "applied",
                url: location.href,
                boardName: "LinkedIn",
                fieldsCount: 0,
                timestamp: new Date().toISOString(),
              },
            }).catch(() => {});
          }
          return;
        }

        // Advance to next step
        const nextBtn =
          modal.querySelector<HTMLButtonElement>('button[aria-label*="Continue to next step"]') ??
          modal.querySelector<HTMLButtonElement>('button[aria-label*="Review your application"]') ??
          modal.querySelector<HTMLButtonElement>('button[aria-label*="Next"]') ??
          modal.querySelector<HTMLButtonElement>("footer button:last-child");

        if (!nextBtn) break;

        // Request LLM mapping for this step's fields before advancing
        const stepInputs = Array.from(modal.querySelectorAll<Element>("input, select, textarea"))
          .filter(el => {
            const type = (el as HTMLInputElement).type?.toLowerCase();
            return type !== "hidden" && type !== "submit" && type !== "button";
          });
        if (stepInputs.length > 0) {
          const fields = stepInputs.map(el => {
            const inp = el as HTMLInputElement;
            const isSelect = el.tagName === "SELECT";
            const isTextarea = el.tagName === "TEXTAREA";
            return {
              name: inp.name || inp.id || "",
              label: inp.labels?.[0]?.textContent?.trim() ?? el.getAttribute("aria-label") ?? inp.placeholder ?? inp.name ?? "",
              type: isSelect ? "select" : isTextarea ? "textarea" : inp.type ?? "text",
              options: isSelect
                ? Array.from((el as unknown as HTMLSelectElement).options).map(o => o.text)
                : undefined,
            };
          });
          browser.runtime.sendMessage({
            type: "FIELD_MAP_REQUEST",
            payload: { fields, resumeId },
          }).catch(() => {});
          await sleep(300);
        }

        nextBtn.click();
      }
    }

    // ── Message listener ─────────────────────────────────────────────────────

    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if (request.type === "DETECT_FORM") {
        sendResponse({
          status: detectionState.status,
          boardName: detectionState.boardName,
          fields: detectionState.fields ?? [],
        });
      } else if (request.type === "FILL_FORM") {
        void fillForm(null);
        sendResponse({ success: true });
      } else if (request.type === "SHOW_REVIEW_PANEL") {
        showReviewPanel();
        sendResponse({ success: true });
      } else if (request.type === "CLICK_EASY_APPLY") {
        void clickEasyApplyAndFill();
        sendResponse({ success: true });
      } else if (request.type === "FIELD_MAP_RESPONSE") {
        const mappings = request.payload as Record<string, string>;
        if (detectionState.fields) {
          detectionState.fields = detectionState.fields.map((f) => ({
            ...f,
            mappedValue: mappings[f.name] ?? f.mappedValue,
          }));
        }
      }
      return true;
    });

    // ── Boot ─────────────────────────────────────────────────────────────────

    setTimeout(() => { void runDetection(); }, 1000);

    let detectionDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
      if (detectionDebounceTimer) return;
      detectionDebounceTimer = setTimeout(() => {
        detectionDebounceTimer = null;
        if (
          !document.getElementById("applyflow-toast-host") &&
          !document.getElementById("applyflow-panel-host")
        ) {
          void runDetection();
        }
      }, 400);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },
});
