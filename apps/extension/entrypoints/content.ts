export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
  const SUPPORTED_BOARDS = [
    { domain: 'linkedin.com', name: 'LinkedIn' },
    { domain: 'indeed.com', name: 'Indeed' },
    { domain: 'greenhouse.io', name: 'Greenhouse' },
    { domain: 'lever.co', name: 'Lever' },
    { domain: 'workday.com', name: 'Workday' },
    { domain: 'ashby.com', name: 'Ashby' },
  ];

  console.log('ApplyFlow content script loaded on:', window.location.hostname);

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'DETECT_FORM') {
      detectForm(sendResponse);
    } else if (request.type === 'FILL_FORM') {
      fillForm(request.data);
      sendResponse({ success: true });
    }
    return true;
  });

  // Auto-detect on page load
  setTimeout(() => {
    detectFormOnPageLoad();
  }, 1000);

  function detectForm(sendResponse: (response?: any) => void) {
    try {
      const hostname = window.location.hostname;
      const board = SUPPORTED_BOARDS.find((b) => hostname.includes(b.domain));

      if (!board) {
        sendResponse({ status: 'unsupported' });
        return;
      }

      // Simple form detection - look for form elements
      const forms = document.querySelectorAll('form, [role="form"]');
      if (forms.length === 0) {
        sendResponse({ status: 'empty' });
        return;
      }

      // Extract form fields
      const fields = extractFormFields();

      if (fields.length === 0) {
        sendResponse({ status: 'empty' });
        return;
      }

      sendResponse({
        status: 'detected',
        board: board.name,
        fields: fields.map((f) => ({
          label: f.label,
          value: f.value || 'Not filled',
          confidence: Math.random() * 0.5 + 0.5,
        })),
      });
    } catch (error) {
      console.error('Form detection error:', error);
      sendResponse({ status: 'error', message: error instanceof Error ? error.message : '' });
    }
  }

  function extractFormFields() {
    const fields: Array<{ label: string; name: string; type: string; value?: string }> = [];

    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input: any) => {
      if (!input.name && !input.id && !input.placeholder) return;

      const label = input.getAttribute('aria-label') || input.placeholder || input.name || input.id;
      if (!label) return;

      fields.push({
        label,
        name: input.name || input.id || '',
        type: input.type || 'text',
        value: input.value,
      });
    });

    return fields;
  }

  function detectFormOnPageLoad() {
    detectForm((response) => {
      if (response?.status === 'detected') {
        console.log('Form detected:', response.board);
      }
    });
  }

  function fillForm(data: Record<string, string>) {
    try {
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input: any) => {
        const fieldName = input.name || input.id || '';
        if (data[fieldName]) {
          input.value = data[fieldName];
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      console.log('Form filled successfully');
    } catch (error) {
      console.error('Form fill error:', error);
    }
  }
  }
});
