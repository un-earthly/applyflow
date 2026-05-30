
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Root (all apps via Turborepo)
```bash
pnpm dev          # start all apps in parallel
pnpm build        # build all apps
pnpm lint         # lint all apps
pnpm check-types  # typecheck all apps
pnpm format       # prettier format
```

### Per-app
```bash
pnpm --filter web dev          # Next.js on :3000
pnpm --filter web build
pnpm --filter web check-types  # runs next typegen then tsc

pnpm --filter extension dev    # WXT dev mode on :3001
pnpm --filter extension build  # production build
pnpm --filter extension zip    # package for Chrome Web Store
pnpm --filter extension compile  # tsc --noEmit type-check only
```

There is no test runner configured yet.

---

## Architecture

### Monorepo layout

| Path | Purpose |
|---|---|
| `apps/web` | Next.js 16 App Router — marketing, auth, dashboard, admin, API routes |
| `apps/extension` | WXT browser extension (MV3) — popup, content script, background SW |
| `apps/emails` | React Email templates (triggered from Cloud Functions, not Next.js) |
| `packages/shared` | Zod schemas + shared TypeScript types, used by both web and extension |
| `packages/ui` | Thin re-export of shadcn/ui primitives for the extension popup |
| `packages/eslint-config` | Shared ESLint config |
| `packages/typescript-config` | Shared tsconfig bases |

---

### Web app (`apps/web`)

**Route groups:**
- `(marketing)` — public landing, pricing, features, legal
- `(auth)` — login, signup, forgot/reset password, verify email
- `(dashboard)` — authed user area: applications, resumes, jobs, cover letters, analytics, queue, settings
- `(admin)` — admin-only panel at `/admin/*`

**Auth flow** — key files:
- [`apps/web/lib/firebase/client.ts`](apps/web/lib/firebase/client.ts) — exports `auth`, `db`, `storage` (client SDK)
- [`apps/web/hooks/use-auth.tsx`](apps/web/hooks/use-auth.tsx) — `AuthProvider` + `useAuth`; listens to `onIdTokenChanged`, calls `syncSession()` on each token change
- [`apps/web/app/api/auth/session/route.ts`](apps/web/app/api/auth/session/route.ts) — POST exchanges ID token for an HttpOnly `session` cookie (14 d) **and** a non-HttpOnly `af_id_token` cookie (1 h) the extension can read
- [`apps/web/lib/server/get-server-user.ts`](apps/web/lib/server/get-server-user.ts) — reads the `session` cookie via Admin SDK; used in all Server Components and API routes
- [`apps/web/lib/firebase/admin.ts`](apps/web/lib/firebase/admin.ts) — lazy Admin SDK singleton; use `adminAuth()` and `adminDb()`
- There is **no middleware.ts** — route protection is done per-layout by calling `getServerUser()` and redirecting

**API route conventions:**
- Input validation via [`apps/web/lib/api-validate.ts`](apps/web/lib/api-validate.ts) — `parseBody(schema, body)` returns a typed object or a ready `NextResponse` error
- Error shape: `{ ok: false, error: { code, message, fields? } }`
- Quota over-limit returns status 402 with `{ code: "QUOTA_EXCEEDED", upgradeUrl }`

**Key `next.config.ts` notes:**
- `serverExternalPackages` includes all Firebase packages and `@react-pdf/renderer` to prevent bundling issues
- `Cross-Origin-Opener-Policy: unsafe-none` set globally — required for Firebase Auth `signInWithPopup`

**Shared Zod schemas** in [`packages/shared/src/schemas/`](packages/shared/src/schemas/) (`auth`, `profile`, `resume`, `application`, `job`, `coverLetter`, `subscription`, `extension`) — imported as `@repo/shared`.

---

### Resume template system (`apps/web`)

11 visual templates, each a self-contained React component that renders at exactly 794 × 1123 px (A4).

**Key files:**
- [`apps/web/lib/resume-templates/types.ts`](apps/web/lib/resume-templates/types.ts) — `ResumeData` type + helpers (`dateRange`, `keywords`, `highlights`, `A4_WIDTH`, `A4_HEIGHT`)
- [`apps/web/lib/resume-templates/index.ts`](apps/web/lib/resume-templates/index.ts) — `RESUME_TEMPLATES` array + `getTemplate(id)` lookup
- [`apps/web/lib/resume-templates/templates/`](apps/web/lib/resume-templates/templates/) — 11 template components: `classic`, `modern`, `minimal`, `executive`, `tech`, `elegant`, `bold`, `creative`, `compact`, `gradient`, `sidebar-dark`
- [`apps/web/components/resume/template-preview.tsx`](apps/web/components/resume/template-preview.tsx) — `<TemplatePreview template={tpl} scale={0.35} data={optionalData} />` — renders any template scaled to thumbnail size using CSS `transform: scale()`

**Data format (`ResumeData` / `JsonData` — same shape):**
```typescript
{ basics: { name, label, email, phone, url, summary, location },
  work: { name (company), position, startDate, endDate, summary }[],
  education: { institution, studyType, area, startDate, endDate, score }[],
  skills: { name, level, keywords (comma-sep string) }[],
  projects: { name, description, url, highlights (newline-sep string), startDate, endDate }[] }
```
Stored in Firestore as `jsonData` field on each resume document. Also stores `templateId: string`.

**Template rules:**
- All templates use inline styles only (no Tailwind) so they render correctly when scaled with `transform: scale()`
- Templates must render at 794px wide — never use `100%` widths inside templates
- `skills.keywords` is a comma-separated string; use `keywords()` helper to split it
- `projects.highlights` is a newline-separated string; use `highlights()` helper to split it

**Resume subpages:**
- `resumes/page.tsx` — gallery of resume cards with template thumbnails; New Resume dialog (template picker); Upload PDF dialog
- `resumes/[id]/edit/page.tsx` — 3-pane editor: section nav → form → scaled live preview; template switcher in toolbar
- `resumes/[id]/preview/page.tsx` — full A4 render of chosen template; template switcher dropdown; PDF + Print buttons
- `resumes/[id]/tailor/page.tsx` — AI job-description matching wizard
- `resumes/[id]/versions/page.tsx` — version history with restore

**API routes:**
- `POST /api/resumes/[id]/export` — renders resume as PDF using `@react-pdf/renderer`; maps `jsonData` → `ResumeContent` for the renderer
- `POST /api/resumes/parse-pdf` — receives `{ pdfUrl, fileName }`; uses GPT-4o to extract text then GPT-4o-mini to parse into `ResumeData` JSON; falls back to empty scaffold if no `OPENAI_API_KEY`

---

### Browser extension (`apps/extension`)

**Entrypoints:**
- [`apps/extension/entrypoints/background.ts`](apps/extension/entrypoints/background.ts) — MV3 service worker; **all** Chrome API calls and external fetches originate here
- [`apps/extension/entrypoints/content.ts`](apps/extension/entrypoints/content.ts) — injected into every page; detects job boards, shows shadow DOM overlays, fills forms
- [`apps/extension/entrypoints/popup/`](apps/extension/entrypoints/popup/) — React SPA (380×600 px), 4 tabs: Home, Apply, Activity, Settings
- [`apps/extension/entrypoints/options/`](apps/extension/entrypoints/options/) — full-page settings via `chrome://extensions`

**Popup architecture** (redesigned — dark glassmorphism):
- [`apps/extension/entrypoints/popup/App.tsx`](apps/extension/entrypoints/popup/App.tsx) — shell; delegates auth check to background via `GET_AUTH_STATUS` message; never calls `chrome.*` directly
- [`apps/extension/entrypoints/popup/tabs/home.tsx`](apps/extension/entrypoints/popup/tabs/home.tsx) — auto-apply toggle, 3 stat cards (today/queued/month), recent application list
- [`apps/extension/entrypoints/popup/tabs/current-job.tsx`](apps/extension/entrypoints/popup/tabs/current-job.tsx) — form detection + fill/review actions
- [`apps/extension/entrypoints/popup/tabs/activity.tsx`](apps/extension/entrypoints/popup/tabs/activity.tsx) — filterable activity list
- [`apps/extension/entrypoints/popup/tabs/settings.tsx`](apps/extension/entrypoints/popup/tabs/settings.tsx) — account, behavior toggles, resume switcher
- [`apps/extension/entrypoints/popup/style.css`](apps/extension/entrypoints/popup/style.css) — design system: `.glass`, `.glass-strong`, `.toggle-track/.toggle-thumb`, `.btn`, `.pill`, `.spinner`

**Critical popup rules:**
- The popup must NEVER `await chrome.runtime.sendMessage(...)` for **read** operations. `sendMessage` hangs if the MV3 service worker is cold-starting, causing permanent spinner states. Use `chrome.storage.local.get(...)` directly instead — it is always available in any extension context and never hangs.
- For **write** operations (toggle settings, log activity), write to `chrome.storage.local` first, then notify the SW fire-and-forget: `chrome.runtime.sendMessage(...).catch(() => {})`.
- Auth check: popup reads `session:token` from `chrome.storage.local` directly. It then sends `GET_AUTH_STATUS` fire-and-forget to wake the SW for cookie sync; `chrome.storage.onChanged` notifies the popup when the token arrives.

**Extension auth pairing (how the extension gets a token):**
1. Popup opens `/login?return=extension` in a tab
2. After login, the web app writes `{ idToken, expiresAt: now+5min }` to Firestore at `/pairings/{code}`
3. Web redirects to `/auth/extension-success?code=...` — page has `#af-extension-bridge[data-code]`
4. Content script sends `{ type: "PAIR_CODE", code }` to the background
5. Background calls [`apps/web/app/api/auth/extension-token/route.ts`](apps/web/app/api/auth/extension-token/route.ts) → receives `idToken`, stores in `chrome.storage.local["session:token"]`
6. Background also has a fallback `tabs.onUpdated` listener in case content script fires first
7. Token refreshed every 50 min via `chrome.alarms`

**Auto cookie-sync (no explicit pairing needed):**
- Background runs `syncAuthFromCookie()` on **startup** — calls `chrome.cookies.getAll({ name: "af_id_token" })` across all domains
- Derives API base URL from cookie domain (localhost → `http://localhost:3000`, applyflow.io → `https://app.applyflow.io`)
- Also called in `GET_AUTH_STATUS` handler if no stored token — so logging in on the web app auto-syncs the extension without any extra steps
- WXT_APP_URL env var is no longer required for dev auth sync (cookie domain is used instead)

**Extension → backend API calls** go through the background SW with `Bearer {idToken}`. Target URL: `WXT_APP_URL` env var (prefix `WXT_`, not `NEXT_PUBLIC_`), defaults to `https://app.applyflow.io`.

**`chrome.storage.local` key conventions:**
| Key | Contents |
|---|---|
| `session:token` | Firebase ID token |
| `auth:user` | User profile object |
| `cache:resumes` | Cached resume list |
| `activity:log` | Last 200 fill events |
| `settings:preferences` | `{ autoFill, autoSubmit, showOverlay, soundEnabled }` |
| `popup:activeTab` | Active tab index for popup |

**Background message types** (send via `chrome.runtime.sendMessage`):
| Type | Direction | Returns |
|---|---|---|
| `GET_AUTH_STATUS` | popup→bg | `{ isLoggedIn, user, quota }` |
| `GET_SETTINGS` | popup→bg | `{ settings }` |
| `UPDATE_SETTINGS` | popup→bg | `{ settings }` |
| `GET_RESUMES` | popup→bg | `{ resumes }` |
| `SET_DEFAULT_RESUME` | popup→bg | `{ success }` |
| `GET_ACTIVITY_LOG` | popup→bg | `{ activities }` |
| `LOG_ACTIVITY` | content→bg | `{ success }` |
| `FIELD_MAP_REQUEST` | content→bg | (async; bg sends `FIELD_MAP_RESPONSE` back to tab) |
| `PAIR_CODE` | content→bg | `{ success }` |
| `LOGOUT` | popup→bg | `{ success }` |

**Content script messages** (send via `chrome.tabs.sendMessage`):
| Type | Returns |
|---|---|
| `DETECT_FORM` | `{ status, boardName, fields }` |
| `FILL_FORM` | `{ success }` |
| `SHOW_REVIEW_PANEL` | `{ success }` |
| `FIELD_MAP_RESPONSE` | (sent by bg; updates detectionState in content) |

**Content script overlays** use vanilla DOM (no React) in shadow roots to prevent CSS leakage from job sites. Inline `<style>` tags injected into each shadow root.

**TypeScript:** Extension uses `@types/chrome` (declared in [`apps/extension/tsconfig.json`](apps/extension/tsconfig.json) via `"types": ["chrome"]`). WXT's `browser` polyfill is used for storage; `chrome.*` is used directly for cookies/tabs/alarms.

---

### Form-fill data flow

```
content script detects board hostname
  → sends FIELD_MAP_REQUEST to background
  → background POSTs to /api/llm/field-map (Bearer token)
  → background sends FIELD_MAP_RESPONSE to content tab
  → content updates detectionState.fields with mapped values
  → DetectorToast appears (auto-dismisses after 12 s)

User clicks Fill / Review:
  → fillForm() writes values into DOM inputs
  → dispatches input + change events (for React/Vue-controlled fields)
  → sends LOG_ACTIVITY to background
  → background POSTs to /api/applications
  → background appends to activity:log in chrome.storage.local
```

---

### Firestore data model (abbreviated)

| Collection | Key fields |
|---|---|
| `profiles` | `uid`, `subscription_tier`, `stripe_customer_id` |
| `resumes` | `user_id`, `name`, `json_data` (JSON Resume schema), `is_default` |
| `applications` | `user_id`, `status` (applied/screening/interview/offer/rejected/ghosted), `source`, `metadata` |
| `tailored_resumes` | `resume_id`, `job_description`, `tailored_json`, `ai_score` |
| `pairings` | `idToken`, `expiresAt` — one-time extension auth codes, auto-deleted after use |
| `subscriptions` | Stripe subscription mirror |

---

### Environment variables

**Web ([`apps/web/.env.local`](apps/web/.env.local)):**
```
# Firebase client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Firebase Admin SDK
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=        # keep \n escaping — admin.ts calls .replace(/\\n/g, "\n")

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=
NEXT_PUBLIC_STRIPE_PRICE_TEAMS_MONTHLY=
NEXT_PUBLIC_STRIPE_PRICE_TEAMS_YEARLY=

# AI
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
AI_DEFAULT_PROVIDER=openai

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_EXTENSION_ID=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

**Extension ([`apps/extension/.env`](apps/extension/.env)):**
```
WXT_APP_URL=http://localhost:3000   # optional in dev — cookie domain auto-detects the API base
```

---

### Subscription tiers

- **Free** — 10 autofills/month, 1 resume
- **Pro ($12/mo)** — unlimited autofills, 5 resumes, AI tailoring, analytics
- **Teams ($29/mo/user)** — everything + shared templates, team controls

Quota enforcement hits `/api/llm/usage` and returns 402 with `QUOTA_EXCEEDED` when over limit.
