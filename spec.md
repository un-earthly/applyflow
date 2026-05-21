# ApplyFlow — Full Page, Route, Component & Wiring Spec

**Companion to:** `SCOPE.md`
**Audience:** Code agent executing implementation
**Stack:** Next.js 16 (App Router) + React 19 + TS + Tailwind v4 + shadcn/ui + Firebase + WXT extension
**Last updated:** May 2026

---

## 0. How to read this doc

Each page/route block contains:

- **Route:** URL path
- **Auth:** public, authed, role-gated
- **Layout:** which layout it nests in
- **Purpose:** one-line goal
- **Components:** ordered top-to-bottom
- **Data:** what is fetched, from where, when
- **States:** loading, empty, error, success
- **Actions:** mutations triggered from this page
- **Edge cases:** what to handle explicitly

Code agent should treat the **Components** list as the file structure under `apps/web/components/<feature>/`.

---

## 1. Design System (tokens)

### 1.1 Color tokens (HSL, shadcn-compatible)

```css
/* apps/web/app/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --primary: 234 89% 60%;          /* indigo-500 */
    --primary-foreground: 0 0% 100%;
    --secondary: 220 14% 96%;
    --secondary-foreground: 222 47% 11%;
    --muted: 220 14% 96%;
    --muted-foreground: 220 9% 46%;
    --accent: 220 14% 96%;
    --accent-foreground: 222 47% 11%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --success: 142 71% 45%;
    --warning: 38 92% 50%;
    --info: 199 89% 48%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 234 89% 60%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 222 47% 6%;
    --foreground: 210 40% 98%;
    --card: 222 47% 8%;
    --card-foreground: 210 40% 98%;
    --popover: 222 47% 8%;
    --popover-foreground: 210 40% 98%;
    --primary: 234 89% 65%;
    --primary-foreground: 222 47% 11%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 63% 51%;
    --destructive-foreground: 210 40% 98%;
    --success: 142 71% 45%;
    --warning: 38 92% 50%;
    --info: 199 89% 48%;
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 234 89% 65%;
  }
}
```

**Status colors** (application pipeline):

| Status     | Light hex  | Dark hex   | Usage                       |
|------------|------------|------------|-----------------------------|
| Applied    | `#3B82F6`  | `#60A5FA`  | Blue badge, neutral state   |
| Screening  | `#8B5CF6`  | `#A78BFA`  | Purple, in-progress         |
| Interview  | `#F59E0B`  | `#FBBF24`  | Amber, active               |
| Offer      | `#10B981`  | `#34D399`  | Green, win                  |
| Rejected   | `#EF4444`  | `#F87171`  | Red, closed-lost            |
| Ghosted    | `#6B7280`  | `#9CA3AF`  | Gray, no-response           |

### 1.2 Spacing scale

Use Tailwind defaults. Canonical gaps:

- Inside cards: `p-6` (24 px)
- Between form fields: `gap-2` (8 px) for label↔input, `gap-4` (16 px) between field groups
- Section spacing: `space-y-8` (32 px)
- Page horizontal padding: `px-4 md:px-6 lg:px-8`

### 1.3 Typography

- Font: **Inter** (web), **Geist Mono** (code blocks). Loaded via `next/font`.
- Scale:
  - `text-xs` 12/16 — captions, metadata
  - `text-sm` 14/20 — body default in dashboards
  - `text-base` 16/24 — landing body
  - `text-lg` 18/28 — card titles
  - `text-xl` 20/28 — section headings
  - `text-2xl` 24/32 — page titles
  - `text-3xl` 30/36 — hero subhead
  - `text-5xl` 48/52 — hero
  - `text-6xl` 60/60 — landing hero (lg+)
- Weights: 400 body, 500 ui-labels, 600 headings, 700 hero.

### 1.4 Radius and elevation

- Radius: `--radius: 0.5rem` (cards), `rounded-md` (8 px) inputs/buttons, `rounded-full` avatars/pills.
- Shadow:
  - `shadow-sm` cards at rest
  - `shadow-md` cards on hover
  - `shadow-lg` modals, dropdowns, popover
  - `shadow-2xl` extension popup (if floated)

### 1.5 Responsive breakpoints

| Token | px    | Use                                 |
|-------|-------|-------------------------------------|
| sm    | 640   | tablet portrait                     |
| md    | 768   | tablet landscape, small laptop      |
| lg    | 1024  | desktop default                     |
| xl    | 1280  | wide desktop                        |
| 2xl   | 1536  | landing only                        |

**Mobile-first.** Dashboard collapses sidebar < `lg`. Forms stack < `md`.

### 1.6 Motion

- Transitions: `transition-colors duration-150` on interactives, `transition-all duration-200 ease-out` on cards.
- Page transitions: disabled (Next.js default).
- Modal: `data-[state=open]:animate-in fade-in-0 zoom-in-95`.
- Toasts: `sonner` library, top-right, 4 s default.

### 1.7 Iconography

- **Lucide React** only. 16 px (inline), 20 px (buttons), 24 px (nav).
- No emoji in UI.

---

## 2. Component inventory (shared)

Build once, reuse everywhere. Drop into `apps/web/components/ui/` (shadcn) and `apps/web/components/shared/`.

### 2.1 shadcn primitives to install

```
button, input, label, textarea, select, checkbox, radio-group, switch, slider,
card, badge, separator, avatar, dialog, sheet, popover, tooltip, dropdown-menu,
command, tabs, accordion, alert, alert-dialog, toast (via sonner), skeleton,
progress, table, pagination, calendar, date-picker, breadcrumb, scroll-area,
form (react-hook-form + zod), hover-card, collapsible
```

### 2.2 Shared composite components

| Component                | Purpose                                            |
|--------------------------|----------------------------------------------------|
| `AppLogo`                | Wordmark + icon, sizes sm/md/lg                    |
| `ThemeToggle`            | Light/dark/system                                  |
| `UserAvatar`             | Avatar + initials fallback, online dot optional    |
| `EmptyState`             | Icon + title + body + CTA                          |
| `LoadingSpinner`         | sm/md/lg                                           |
| `PageHeader`             | Title + description + actions slot                 |
| `StatCard`               | Label, value, delta %, sparkline optional          |
| `ApplicationCard`        | Used in kanban + list                              |
| `ApplicationStatusBadge` | Pill, color-coded                                  |
| `ResumeCard`             | Preview thumbnail + name + last edited             |
| `JobBoardLogo`           | LinkedIn/Indeed/Greenhouse etc. icon set           |
| `AIBadge`                | "AI-generated" or confidence chip                  |
| `ConfirmDialog`          | Destructive action wrapper                         |
| `KeyboardShortcut`       | `<kbd>` styled                                     |
| `MarkdownView`           | Read-only MDX renderer for AI outputs              |
| `CopyButton`             | Inline copy-to-clipboard                           |
| `FileDropzone`           | PDF/DOCX upload, drag+drop, progress               |
| `PageBreadcrumb`         | Auto from route                                    |
| `DataTable`              | TanStack Table wrapper                             |
| `FilterBar`              | Search + multi-filter + saved views                |
| `BulkActionBar`          | Appears on row selection                           |

---

## 3. Web app — full route map

### 3.1 Public / marketing

| Route                | File                                   | Auth  |
|----------------------|----------------------------------------|-------|
| `/`                  | `app/(marketing)/page.tsx`             | public |
| `/pricing`           | `app/(marketing)/pricing/page.tsx`     | public |
| `/features`          | `app/(marketing)/features/page.tsx`    | public |
| `/changelog`         | `app/(marketing)/changelog/page.tsx`   | public |
| `/blog`              | `app/(marketing)/blog/page.tsx`        | public |
| `/blog/[slug]`       | `app/(marketing)/blog/[slug]/page.tsx` | public |
| `/about`             | `app/(marketing)/about/page.tsx`       | public |
| `/contact`           | `app/(marketing)/contact/page.tsx`     | public |
| `/legal/privacy`     | `app/(marketing)/legal/privacy/page.tsx` | public |
| `/legal/terms`       | `app/(marketing)/legal/terms/page.tsx`   | public |
| `/legal/cookies`     | `app/(marketing)/legal/cookies/page.tsx` | public |
| `/legal/dpa`         | `app/(marketing)/legal/dpa/page.tsx`     | public |

### 3.2 Auth

| Route                | File                                   | Auth          |
|----------------------|----------------------------------------|---------------|
| `/login`             | `app/(auth)/login/page.tsx`            | guest only    |
| `/signup`            | `app/(auth)/signup/page.tsx`           | guest only    |
| `/forgot-password`   | `app/(auth)/forgot-password/page.tsx`  | guest only    |
| `/reset-password`    | `app/(auth)/reset-password/page.tsx`   | token-gated   |
| `/verify-email`      | `app/(auth)/verify-email/page.tsx`     | authed (unverified) |
| `/auth/callback`     | `app/(auth)/callback/route.ts`         | OAuth handler |
| `/logout`            | `app/(auth)/logout/route.ts`           | authed        |

### 3.3 Onboarding

| Route                            | File                                                | Auth   |
|----------------------------------|-----------------------------------------------------|--------|
| `/onboarding`                    | `app/(onboarding)/page.tsx` → redirect to step 1    | authed |
| `/onboarding/welcome`            | `app/(onboarding)/welcome/page.tsx`                 | authed |
| `/onboarding/profile`            | `app/(onboarding)/profile/page.tsx`                 | authed |
| `/onboarding/resume`             | `app/(onboarding)/resume/page.tsx`                  | authed |
| `/onboarding/preferences`        | `app/(onboarding)/preferences/page.tsx`             | authed |
| `/onboarding/install-extension`  | `app/(onboarding)/install-extension/page.tsx`       | authed |
| `/onboarding/complete`           | `app/(onboarding)/complete/page.tsx`                | authed |

### 3.4 Dashboard

| Route                                    | File                                                          | Auth   |
|------------------------------------------|---------------------------------------------------------------|--------|
| `/dashboard`                             | `app/(dashboard)/page.tsx`                                    | authed |
| `/dashboard/applications`                | `app/(dashboard)/applications/page.tsx`                       | authed |
| `/dashboard/applications/[id]`           | `app/(dashboard)/applications/[id]/page.tsx`                  | authed |
| `/dashboard/applications/new`            | `app/(dashboard)/applications/new/page.tsx`                   | authed |
| `/dashboard/resumes`                     | `app/(dashboard)/resumes/page.tsx`                            | authed |
| `/dashboard/resumes/new`                 | `app/(dashboard)/resumes/new/page.tsx`                        | authed |
| `/dashboard/resumes/[id]`                | `app/(dashboard)/resumes/[id]/page.tsx`                       | authed |
| `/dashboard/resumes/[id]/edit`           | `app/(dashboard)/resumes/[id]/edit/page.tsx`                  | authed |
| `/dashboard/resumes/[id]/tailor`         | `app/(dashboard)/resumes/[id]/tailor/page.tsx`                | authed |
| `/dashboard/resumes/[id]/preview`        | `app/(dashboard)/resumes/[id]/preview/page.tsx`               | authed |
| `/dashboard/resumes/[id]/versions`       | `app/(dashboard)/resumes/[id]/versions/page.tsx`              | authed |
| `/dashboard/jobs`                        | `app/(dashboard)/jobs/page.tsx`                               | authed |
| `/dashboard/jobs/saved`                  | `app/(dashboard)/jobs/saved/page.tsx`                         | authed |
| `/dashboard/jobs/recommended`            | `app/(dashboard)/jobs/recommended/page.tsx`                   | authed |
| `/dashboard/jobs/[id]`                   | `app/(dashboard)/jobs/[id]/page.tsx`                          | authed |
| `/dashboard/cover-letters`               | `app/(dashboard)/cover-letters/page.tsx`                      | authed |
| `/dashboard/cover-letters/[id]`          | `app/(dashboard)/cover-letters/[id]/page.tsx`                 | authed |
| `/dashboard/analytics`                   | `app/(dashboard)/analytics/page.tsx`                          | Pro+   |
| `/dashboard/queue`                       | `app/(dashboard)/queue/page.tsx`                              | authed |

### 3.5 Settings

| Route                                  | File                                                  | Auth     |
|----------------------------------------|-------------------------------------------------------|----------|
| `/settings`                            | `app/(dashboard)/settings/page.tsx` → /profile        | authed   |
| `/settings/profile`                    | `app/(dashboard)/settings/profile/page.tsx`           | authed   |
| `/settings/account`                    | `app/(dashboard)/settings/account/page.tsx`           | authed   |
| `/settings/billing`                    | `app/(dashboard)/settings/billing/page.tsx`           | authed   |
| `/settings/billing/upgrade`            | `app/(dashboard)/settings/billing/upgrade/page.tsx`   | authed   |
| `/settings/billing/invoices`           | `app/(dashboard)/settings/billing/invoices/page.tsx`  | authed   |
| `/settings/notifications`              | `app/(dashboard)/settings/notifications/page.tsx`     | authed   |
| `/settings/integrations`               | `app/(dashboard)/settings/integrations/page.tsx`      | authed   |
| `/settings/job-preferences`            | `app/(dashboard)/settings/job-preferences/page.tsx`   | authed   |
| `/settings/privacy`                    | `app/(dashboard)/settings/privacy/page.tsx`           | authed   |
| `/settings/api-keys`                   | `app/(dashboard)/settings/api-keys/page.tsx`          | Pro+     |
| `/settings/team`                       | `app/(dashboard)/settings/team/page.tsx`              | Teams    |
| `/settings/team/members`               | `app/(dashboard)/settings/team/members/page.tsx`      | Teams    |
| `/settings/team/billing`               | `app/(dashboard)/settings/team/billing/page.tsx`      | Teams    |
| `/settings/danger-zone`                | `app/(dashboard)/settings/danger-zone/page.tsx`       | authed   |

### 3.6 Admin

| Route                              | File                                              | Auth (role) |
|------------------------------------|---------------------------------------------------|-------------|
| `/admin`                           | `app/(admin)/admin/page.tsx`                      | admin       |
| `/admin/users`                     | `app/(admin)/admin/users/page.tsx`                | admin       |
| `/admin/users/[id]`                | `app/(admin)/admin/users/[id]/page.tsx`           | admin       |
| `/admin/subscriptions`             | `app/(admin)/admin/subscriptions/page.tsx`        | admin       |
| `/admin/applications`              | `app/(admin)/admin/applications/page.tsx`         | admin       |
| `/admin/job-boards`                | `app/(admin)/admin/job-boards/page.tsx`           | admin       |
| `/admin/job-boards/[id]`           | `app/(admin)/admin/job-boards/[id]/page.tsx`      | admin       |
| `/admin/feature-flags`             | `app/(admin)/admin/feature-flags/page.tsx`        | admin       |
| `/admin/support`                   | `app/(admin)/admin/support/page.tsx`              | admin       |
| `/admin/support/[id]`              | `app/(admin)/admin/support/[id]/page.tsx`         | admin       |
| `/admin/audit-logs`                | `app/(admin)/admin/audit-logs/page.tsx`           | admin       |
| `/admin/analytics`                 | `app/(admin)/admin/analytics/page.tsx`            | admin       |
| `/admin/announcements`             | `app/(admin)/admin/announcements/page.tsx`        | admin       |

### 3.7 API routes (Next.js Route Handlers)

| Route                                 | Method | Purpose                                       |
|---------------------------------------|--------|-----------------------------------------------|
| `/api/auth/session`                   | GET    | Current session for extension                 |
| `/api/auth/extension-token`           | POST   | Issue short-lived token for extension         |
| `/api/resumes`                        | GET/POST | List/create resumes                         |
| `/api/resumes/[id]`                   | GET/PATCH/DELETE | Single resume                       |
| `/api/resumes/[id]/tailor`            | POST   | AI tailor against JD                          |
| `/api/resumes/[id]/parse`             | POST   | Parse PDF/DOCX upload                         |
| `/api/resumes/[id]/export`            | POST   | Generate PDF                                  |
| `/api/applications`                   | GET/POST | List/create applications                    |
| `/api/applications/[id]`              | GET/PATCH/DELETE | Single application                  |
| `/api/applications/bulk`              | PATCH  | Bulk status update                            |
| `/api/jobs/match`                     | POST   | Score JD against resume                       |
| `/api/jobs/saved`                     | GET/POST | Saved jobs                                  |
| `/api/cover-letters`                  | GET/POST | List/generate                               |
| `/api/cover-letters/[id]`             | GET/PATCH/DELETE |                                     |
| `/api/llm/field-map`                  | POST   | Extension calls this with field schema        |
| `/api/llm/usage`                      | GET    | User's monthly LLM quota                      |
| `/api/stripe/checkout`                | POST   | Start checkout session                        |
| `/api/stripe/portal`                  | POST   | Customer portal redirect                      |
| `/api/stripe/webhook`                 | POST   | Stripe events                                 |
| `/api/admin/users`                    | GET    | Admin user list                               |
| `/api/admin/feature-flags`            | GET/PATCH |                                            |

---

## 4. Layouts

### 4.1 `(marketing)` layout
- Top nav: logo (left), nav links (center, hidden < md), auth buttons (right)
- Footer: 4-column on lg, 1-column on mobile. Logo, Product, Resources, Legal, Socials.
- Max width container: `max-w-7xl mx-auto`.

### 4.2 `(auth)` layout
- Centered card, max-w 420 px, vertical center on viewport.
- Logo above card.
- Footer link: terms + privacy.
- No nav.

### 4.3 `(onboarding)` layout
- Top bar: logo (left), step indicator (center), "Skip for now" (right, conditionally).
- Progress bar pinned below top bar, height 2 px, primary color.
- Centered content max-w 560 px.
- Bottom action bar: Back (ghost) ↔ Continue (primary), fixed to bottom on mobile.

### 4.4 `(dashboard)` layout
- **Sidebar** (lg+): 240 px fixed left.
  - Top: logo + workspace switcher (if Teams)
  - Nav groups: Workspace (Dashboard, Applications, Queue), Library (Resumes, Cover Letters, Jobs), Insights (Analytics)
  - Bottom: subscription badge + upgrade CTA (if free), user avatar with menu (Settings, Logout, Theme)
- **Topbar** (< lg): Hamburger → Sheet sidebar. Logo center. User avatar right.
- **Main**: `max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6`.
- **CommandPalette** (cmd+k) globally mounted.

### 4.5 `(admin)` layout
- Same as dashboard but sidebar shows admin nav and a red "ADMIN" badge under logo.
- Top bar shows "Acting as admin" alert if also has user role.

---

## 5. Page-by-page spec (web)

### 5.1 Landing `/`

- **Sections** (vertical, in order):
  1. **Nav** (sticky, blur backdrop on scroll)
  2. **Hero**: H1 (60 px lg, 36 px mobile), subhead, primary CTA (Start free), secondary CTA (Watch demo). Right: looping screencast `<video autoplay muted loop playsinline>` of extension filling a form. Mobile: video below text.
  3. **Logo strip**: "Works on" — LinkedIn, Indeed, Greenhouse, Lever, Workday, Ashby. Grayscale logos, animate-pulse skeleton during load.
  4. **3-step how it works**: cards with icon + step number + title + body. `grid-cols-1 md:grid-cols-3 gap-6`.
  5. **Feature deep-dive**: Alternating two-column rows (image left, copy right; flip every other). Sticky scroll behavior on lg+.
  6. **Pricing preview**: 3 cards (Free / Pro / Teams). "See full pricing" link.
  7. **Testimonials**: marquee on lg+, swipe on mobile.
  8. **FAQ accordion**: 8 items.
  9. **CTA band**: dark indigo, white text, "Start applying in minutes" + button.
  10. **Footer**.
- **States**: video falls back to static GIF if `prefers-reduced-motion`.
- **SEO**: full Open Graph, JSON-LD `SoftwareApplication`.

### 5.2 Pricing `/pricing`
- 3-tier comparison table
- Toggle: Monthly / Yearly (yearly = 2 months free)
- Feature row icons: ✓ / — / number
- Bottom: enterprise contact CTA
- Sticky CTA bar on mobile (current plan or "Start Pro")

### 5.3 Features `/features`
- Category cards: Autofill, Resume AI, Tracking, Job Match
- Each card links to anchor sections deeper on page

### 5.4 Login `/login`
- Card with:
  - Heading "Welcome back"
  - Email input (label above, 14 px label, 8 px gap to input)
  - Password input + Forgot link inline right
  - Primary button: "Sign in" (full width, 40 px height)
  - Separator with "or"
  - OAuth buttons (Google, GitHub, LinkedIn) — outlined, icon + label, full width, 8 px gap between
  - Footer link: "Don't have an account? Sign up"
- **Validation** (zod + react-hook-form):
  - Email: required, valid format
  - Password: required, min 8
  - Show inline error below field, 12 px text, destructive color
- **Firebase**: `signInWithEmailAndPassword`. On error map codes to messages: `auth/wrong-password` → "Incorrect email or password" (do not leak which is wrong).
- **States**: loading (button spinner + disable), error (red alert above form), success (redirect to last-intended URL or `/dashboard`).

### 5.5 Signup `/signup`
- Same shape as Login.
- Fields: full name, email, password (with strength meter — weak/fair/strong/very-strong based on zxcvbn).
- Checkbox: agree to ToS + Privacy (required to enable button).
- Marketing opt-in: unchecked by default.
- **Firebase**: `createUserWithEmailAndPassword` then trigger `sendEmailVerification`.
- **On success**: redirect to `/onboarding/welcome`.

### 5.6 Forgot password `/forgot-password`
- Single email field + button "Send reset link".
- Success state: replace form with "Check your inbox" message + resend button (60 s cooldown).

### 5.7 Reset password `/reset-password?token=...`
- Verify token on mount via Firebase `verifyPasswordResetCode`.
- Two fields: new password + confirm.
- After submit: success screen with "Sign in" button.

### 5.8 Verify email `/verify-email`
- Big illustration (Lucide `MailCheck`)
- Body: "We sent a link to {email}. Click it to verify."
- Resend button (60 s cooldown).
- "Wrong email?" → logout link.
- Auto-redirect to `/onboarding/welcome` once `emailVerified` is true (poll every 3 s while tab is focused).

### 5.9 Onboarding — Welcome `/onboarding/welcome`
- Greeting with first name.
- 5 bullet list of what they'll set up.
- Single primary CTA: "Let's go".
- Step indicator: 1/5.

### 5.10 Onboarding — Profile `/onboarding/profile`
- Fields: full name (prefilled), location (city autocomplete via free API or static select), phone (optional), LinkedIn URL (optional), portfolio URL (optional), work auth status (select: Citizen / PR / Work visa / Need sponsorship), years of experience (slider 0-30).
- Step 2/5.

### 5.11 Onboarding — Resume `/onboarding/resume`
- Two large choice cards:
  - **Upload existing** — FileDropzone, PDF/DOCX, 5 MB max. After upload, call `/api/resumes/parse`. Show progress: "Reading… Extracting sections… Cleaning up…"
  - **Start blank** — opens block-editor scaffold preloaded with placeholder sections.
  - **Import from LinkedIn** (Phase 2, gray "Coming soon" badge).
- After parse, show preview with edit button → continues to step 4.
- Step 3/5.

### 5.12 Onboarding — Preferences `/onboarding/preferences`
- Job titles (tag input, min 1)
- Locations (tag input + "Open to remote" toggle)
- Salary range (dual slider, currency picker)
- Employment types (multi-checkbox: full-time, contract, part-time, internship)
- Industries (tag input, optional)
- Step 4/5.

### 5.13 Onboarding — Install extension `/onboarding/install-extension`
- Big "Add to Chrome" button → Web Store URL.
- Auto-detect installation: poll `chrome.runtime.sendMessage` via window message bridge from extension content script. Once detected, advance.
- Fallback "I've installed it" button.
- Browser detection: show Edge/Brave equivalent CTA, gray-out unsupported browsers with a note.
- Step 5/5.

### 5.14 Onboarding — Complete `/onboarding/complete`
- Confetti animation (canvas-confetti, opt-out for reduced-motion).
- "You're set. Here's where to go next."
- 3 CTAs: "Open dashboard", "Try a test fill on LinkedIn", "Invite a friend (Pro perk)".

### 5.15 Dashboard home `/dashboard`
- **Top row** (4 stat cards `grid-cols-2 lg:grid-cols-4 gap-4`):
  - Applications this week (vs last week delta)
  - Response rate (last 30 d)
  - Interviews scheduled
  - Autofills remaining this month (free/pro indicator)
- **Recent activity feed** (left, lg:col-span-2): timeline list of last 10 events (applied to X, status changed, AI generated cover letter Y).
- **Pipeline mini** (right, lg:col-span-1): vertical stacked bar showing counts per status, click to filter applications view.
- **Recommended jobs** (full width below): horizontal scroll cards, 4 visible on lg.
- **Empty state**: if 0 applications, show large illustration + "Install the extension to start" + CTA.

### 5.16 Applications list `/dashboard/applications`
- **Header**: title + count, view toggle (Kanban / Table), filter bar.
- **Filters**: status (multi), source (multi), date range, search by company or role.
- **Saved views**: dropdown ("All open", "Needs follow-up", custom).
- **Kanban view**: 6 columns matching statuses, drag-drop with dnd-kit. Each card: company logo (favicon from URL), role title (bold), location, source badge, days since applied. Right-click context menu: change status, archive, delete.
- **Table view**: DataTable with columns: checkbox, company, role, status (badge), source, applied, salary, last update, actions (...). Sortable, paginated 25/50/100.
- **Bulk actions**: change status, export CSV, archive, delete.
- **Empty state**: per filter combination, distinct copy ("No applications in Offer status yet — keep going.").

### 5.17 Application detail `/dashboard/applications/[id]`
- **Header**: back link, company name + role, status badge (clickable to change), source, link to job posting, applied date.
- **Tabs**: Overview / Form snapshot / Notes / Timeline / Files.
- **Overview**: company info (auto-fetched logo + description if known), salary, location, remote type, contact persons (LinkedIn URLs), tags.
- **Form snapshot**: exact JSON of what the extension submitted, read-only with copy button.
- **Notes**: rich-text editor (tiptap), autosave every 2 s after stop typing.
- **Timeline**: chronological events. Add manual event (CTA).
- **Files**: resume version used, cover letter used, downloaded copies.
- **Actions** (top-right dropdown): Duplicate, Set reminder, Archive, Delete.

### 5.18 New application `/dashboard/applications/new`
- Manual entry form: company, role, URL, source, status, notes.
- Submit returns to detail page.

### 5.19 Resumes list `/dashboard/resumes`
- Grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` of ResumeCards.
- Each card: thumbnail (first page render via React-PDF), name, last edited, default badge, dropdown (Rename, Duplicate, Set as default, Export PDF, Delete).
- Top right: "New resume" button → modal with choices (Upload, Start blank, Duplicate existing).
- Quota note: "X of Y resumes used".

### 5.20 Resume editor `/dashboard/resumes/[id]/edit`
- **Three-pane layout** (lg+):
  - Left (200 px): section navigator (Basics, Work, Education, Skills, Projects, Certifications, Languages, Awards, References, Custom). Drag-reorder.
  - Center: block-based editor. Each block has a hover toolbar (drag handle, add block, delete, AI rewrite).
  - Right (320 px): live preview (PDF render). Template selector at top. Zoom controls.
- < lg: single column with bottom tab bar (Sections / Editor / Preview).
- **Toolbar** (top of center pane): undo/redo, template switch, JSON view toggle, AI assist (rewrite section / suggest skills), Save state ("Saved 2s ago"), Export PDF, More menu (Versions, Tailor for job, Share read-only).
- **Autosave**: debounce 800 ms.
- **Keyboard**: `/` to add block, `cmd+k` for AI command palette inside editor.
- **JSON view**: monaco editor, schema-validated, live two-way binding.

### 5.21 Resume tailor `/dashboard/resumes/[id]/tailor`
- **Step 1**: paste job description or paste job URL (we scrape on server).
- **Step 2**: AI extracts requirements, shows checklist of skills/keywords matched vs missing.
- **Step 3**: side-by-side diff of original vs tailored. Accept/reject per change.
- **Step 4**: save as new version "Tailored — {company} {role}". Counts against tailored versions cap on free.

### 5.22 Resume preview `/dashboard/resumes/[id]/preview`
- Full-screen preview, template selector toolbar at top.
- Print / Download PDF / Share read-only link buttons.

### 5.23 Resume versions `/dashboard/resumes/[id]/versions`
- Table of versions with diff view per row. Restore button per version.

### 5.24 Jobs `/dashboard/jobs`
- Tab nav: Saved / Recommended / Searches.
- **Saved**: list of saved jobs the user marked in the extension or web.
- **Recommended**: AI-matched jobs based on profile + resume.
- **Searches**: saved search queries with notification toggles.
- Card: logo, company, role, location, posted date, match score (0-100), Apply button (opens job URL with extension hint).

### 5.25 Job detail `/dashboard/jobs/[id]`
- Two-column on lg:
  - Left: job description full text (sanitized HTML)
  - Right: sticky action card — Apply (opens URL), Save, Generate cover letter, Tailor resume, Show match breakdown.
- Match breakdown modal: which skills matched, which missing, suggested resume edits.

### 5.26 Cover letters `/dashboard/cover-letters`
- List of generated cover letters. Each: company, role, date, preview.
- "Generate new" button: select resume + paste JD → AI output → editable.

### 5.27 Cover letter detail `/dashboard/cover-letters/[id]`
- Rich-text editor, AI rewrite tools (more concise, more enthusiastic, change tone).
- Export PDF/copy/use in application.

### 5.28 Analytics `/dashboard/analytics` (Pro+)
- Pro paywall if Free.
- KPI grid: applications, response rate, interviews, offers, avg time-to-response.
- Charts (Recharts):
  - Applications over time (line, daily/weekly toggle)
  - Status funnel (funnel chart)
  - Source breakdown (donut)
  - Best-performing resumes (bar)
  - Avg confidence per field (heatmap, advanced)
- Filters: date range, source, resume.
- Export CSV.

### 5.29 Queue `/dashboard/queue`
- Items the extension sent for review (low-confidence fills).
- Each item: job URL preview thumb (or favicon), company/role, fields needing review (count), submit/discard buttons, "Open in browser" link.
- Detail row expands to show full field list with edit-in-place inputs.

### 5.30 Settings — Profile `/settings/profile`
- Avatar uploader (Firebase Storage, 2 MB, 256 px crop).
- Name, headline, location, phone, websites.
- "Save changes" sticky bottom bar appears when dirty.

### 5.31 Settings — Account `/settings/account`
- Email (with verify button if unverified, change email flow).
- Password change.
- 2FA setup (TOTP via QR + recovery codes).
- Connected accounts (Google, GitHub, LinkedIn) — connect/disconnect.
- Sessions list: device, location, last active, revoke button.

### 5.32 Settings — Billing `/settings/billing`
- Current plan card: tier, status, next renewal, "Manage in Stripe portal" button.
- Usage card: autofills used vs cap, resumes used vs cap, AI tokens used.
- Plan comparison + upgrade CTA.
- Cancel/downgrade link at bottom (opens AlertDialog with feedback prompt).

### 5.33 Settings — Billing — Upgrade `/settings/billing/upgrade`
- Plan picker, billing cycle toggle, prorated preview, "Continue to Stripe".

### 5.34 Settings — Billing — Invoices `/settings/billing/invoices`
- Table from Stripe: date, amount, status, PDF download link.

### 5.35 Settings — Notifications `/settings/notifications`
- Channels: Email, In-app, Push (extension).
- Events table with per-channel toggles:
  - Application status change
  - Interview reminder
  - New recommended job
  - Weekly summary
  - Quota near limit
  - Product announcements

### 5.36 Settings — Integrations `/settings/integrations`
- Cards per integration: LinkedIn (connect for profile import — Phase 2), Notion (export — Phase 2), Calendly (interview sync — Phase 2). Each has Connect button + status.

### 5.37 Settings — Job preferences `/settings/job-preferences`
- Same fields as Onboarding step 4, editable.
- Plus "Dealbreakers": companies to exclude, keywords to exclude.

### 5.38 Settings — Privacy `/settings/privacy`
- Toggles: analytics, error reporting, AI training opt-out, marketing.
- Data export button → triggers job, emails ZIP.
- Delete account button → AlertDialog with type-confirm.

### 5.39 Settings — API keys `/settings/api-keys` (Pro+)
- List of keys with last-used.
- "Create key" → modal asking name and scopes. Show key once, with copy + download.
- Revoke per row.

### 5.40 Settings — Team (Teams plan) `/settings/team`, `/members`, `/billing`
- `/members`: table of members, role select (Admin/Member), invite by email, resend invite, remove.
- `/billing`: seats, per-seat cost, add seats button.

### 5.41 Settings — Danger zone `/settings/danger-zone`
- Transfer ownership (Teams).
- Wipe applications.
- Wipe resumes.
- Delete account.
- Each row: red outline button + descriptive copy.

### 5.42 Admin home `/admin`
- KPI grid: MRR, active subs, trial signups (7 d), churn (30 d), DAU, autofills today, LLM spend today.
- Recent signups feed.
- System health (Firebase, Stripe, OpenAI) — green/yellow/red dots from a `/api/admin/health` endpoint.

### 5.43 Admin — Users `/admin/users`
- DataTable: email, name, plan, signup, last active, applications count, actions.
- Filters: plan, signup date, search.
- Actions: impersonate, reset password, suspend, refund, delete.

### 5.44 Admin — User detail `/admin/users/[id]`
- Profile, subscription history, applications, support tickets, audit log per user.
- Actions panel (right sticky): Impersonate, Grant Pro for X days, Refund, Suspend, Add note.

### 5.45 Admin — Subscriptions `/admin/subscriptions`
- Table from Stripe sync: customer, plan, status, MRR, next renewal.
- Filter by status.
- Quick links to Stripe dashboard.

### 5.46 Admin — Job boards `/admin/job-boards`
- Table: name, domain, supported (toggle), success rate, last updated, selectors version.
- Per-row "Edit selectors" → editor at `/admin/job-boards/[id]`.

### 5.47 Admin — Job board detail `/admin/job-boards/[id]`
- Form for selector config JSON (monaco).
- Test against a URL (server-side fetch + parse preview).
- Version history.

### 5.48 Admin — Feature flags `/admin/feature-flags`
- Table of flags with toggle and rollout % slider.
- Per-flag: targeting rules (user IDs, plan, country).

### 5.49 Admin — Support `/admin/support`
- Inbox style. List left, conversation right.
- Reply box with canned responses.
- Tag, assign, resolve.

### 5.50 Admin — Audit logs `/admin/audit-logs`
- DataTable: actor, action, target, IP, timestamp.
- Filters: actor, action type, date.

### 5.51 Admin — Analytics `/admin/analytics`
- Cohort retention, conversion funnel (visit → signup → activate → pay), LTV by acquisition source.

### 5.52 Admin — Announcements `/admin/announcements`
- Composer for in-app banners + targeting + schedule.

### 5.53 Error pages
- `not-found.tsx`: 404 illustration, search input, return home.
- `error.tsx`: 500 illustration, refresh + report bug buttons.
- `unauthorized.tsx`: 401, sign in button.
- `forbidden.tsx`: 403, contact admin.

---

## 6. Extension — full spec (WXT)

### 6.1 Structure recap

```
extension/
├── entrypoints/
│   ├── popup/
│   │   ├── App.tsx
│   │   ├── routes/
│   │   │   ├── home.tsx
│   │   │   ├── current-job.tsx
│   │   │   ├── activity.tsx
│   │   │   ├── resume.tsx
│   │   │   └── settings.tsx
│   │   └── index.html
│   ├── content/
│   │   ├── index.ts          # detector boot
│   │   ├── overlays/
│   │   │   ├── DetectorToast.tsx
│   │   │   ├── ReviewPanel.tsx
│   │   │   ├── ConfirmModal.tsx
│   │   │   └── CaptchaNotice.tsx
│   │   └── agent.ts
│   ├── background/
│   │   └── index.ts
│   └── options/
│       └── index.html
```

### 6.2 Popup — dimensions and shell

- Fixed size: **380 × 600 px**.
- Root: rounded 12 px (extension popup chrome ignores it but Firefox respects), padding 0 on outer container.
- **Topbar**: 48 px tall, contains logo (16 px), title of current view (center, 14 px medium), avatar dropdown (right, 24 px).
- **Bottom tab bar**: 56 px tall, 5 icon tabs (Home, Current, Activity, Resume, Settings). Active state: primary color icon + label. Inactive: muted.
- Main content scroll: `flex-1 overflow-y-auto`, padding `p-4`.
- Routing: in-popup hash router or memory router (no URL).

### 6.3 Popup — Tab 1: Home `#/home`

- **If not logged in**: Big logo + "Sign in" button → opens web `/login?return=extension`. Wait for token via background message.
- **If logged in, no current job page**:
  - Greeting: "Hey {firstName}"
  - Quota chip: "23 / 50 autofills this month" with progress bar (4 px tall).
  - Quick actions: "Browse recommended jobs" (opens web), "View applications" (opens web), "Tutorial" (opens content overlay demo).
  - Recent activity (last 3) — compact.
- **If on a known job page**: redirect to `#/current-job`.

### 6.4 Popup — Tab 2: Current job `#/current-job`

- **Detect state badges** (top):
  - Green "Form detected" + board name
  - Yellow "Partial detection" with reason
  - Red "Unsupported page"
  - Gray "No form on this page"
- Below, conditional UI:
  - **Detected**: list of detected fields with mapped values from resume. Each row: field label, value (truncate), confidence dot (green/yellow/red), edit pencil. Bottom: "Fill form" primary button + "Fill and submit" secondary (only when allowed by board policy).
  - **Unsupported**: show CTA "Report this site" + open a quick form (URL prefilled).
  - **No form**: empty illustration "We'll wake up when you open an application page."
- Settings cog at top-right of this tab → toggles per-site:
  - Auto-fill on detect (default off)
  - Auto-submit (default off, board-allowed only)

### 6.5 Popup — Tab 3: Activity `#/activity`

- List of recent fills (last 50), grouped by day.
- Each row: company (favicon), role, status pill (Filled / Submitted / Queued / Failed), time, "Open job" link, "Send to dashboard" if not already saved.
- Filter chips at top: All / Submitted / Queued / Failed.

### 6.6 Popup — Tab 4: Resume `#/resume`

- Current default resume name + thumbnail (small).
- "Switch resume" → list of available resumes (synced from backend).
- "Open editor" → opens web `/dashboard/resumes/{id}/edit`.
- AI cover letter quick-gen: textarea ("Paste JD"), button → opens result modal with copy.

### 6.7 Popup — Tab 5: Settings `#/settings`

- Account section: avatar + email + logout.
- Behavior section: switches (Auto-fill, Auto-submit if allowed, Show overlay, Sound on fill).
- Job board status: scrollable list of supported boards with on/off toggles.
- Privacy: "Pause for 1 hour" toggle, "Clear local cache" button.
- Help: link to docs, contact support, version number.

### 6.8 Content script — detection lifecycle

1. On `DOMContentLoaded` + `MutationObserver` on body.
2. Hash check (`location.host` + page signature) against `job_boards` config from Firestore (cached in storage with TTL 6 h).
3. If matched, run **selector pack** for that board to extract form schema.
4. Send schema to background → background to `/api/llm/field-map` with auth.
5. Receive field-value map → render **DetectorToast** overlay.

### 6.9 Content overlays — visual spec

All overlays mount in a **shadow root** to avoid CSS leakage. Render with React + Tailwind compiled into the shadow style scope (WXT supports this via `cssInjectionMode: 'ui'`).

- **DetectorToast** — bottom-right of viewport, 320 × auto, rounded-lg, shadow-2xl, slide-in. Contains: logo, "We can fill this for you", "Review" (ghost) + "Fill" (primary) buttons. Dismiss × top-right. Auto-hide after 12 s if no interaction.
- **ReviewPanel** — right-side sheet, 400 px wide, full height, slide from right. Contents:
  - Header: company + role guessed from page title/meta.
  - Field list: scrollable. Each field: label, current value (editable), confidence dot, "Use different value" dropdown (pulls from resume).
  - Footer: "Fill all" + "Fill and submit" (if board allows) + "Cancel".
- **ConfirmModal** — center modal for destructive/risky moments (Submit confirm if auto-submit was on but confidence low). Shadow-2xl, backdrop blur.
- **CaptchaNotice** — top banner inside the page, sticky, amber background: "CAPTCHA detected, finish manually. We'll log it once you submit."

### 6.10 Background service worker

- Persistent message bus.
- Handles:
  - Auth token refresh (every 50 m).
  - LLM API calls (proxy so the key stays server-side via Firebase Functions).
  - Activity log writes.
  - Listening for page lifecycle messages from content scripts.
- Storage:
  - `chrome.storage.local`: session token, resume cache (JSON), board config cache, per-site preferences.
  - `chrome.storage.sync`: theme, language.

### 6.11 Options page

Opened from `chrome://extensions` or the popup. Full-page settings (sibling to web settings but more granular for extension behavior):

- General: theme, language, sound, hotkeys.
- Sites: per-domain rules table (auto-fill, auto-submit, blocked).
- Privacy: clear cache, pause schedule.
- About: version, license, links.

### 6.12 Extension onboarding (first run after install)

- Opens a new tab to `/onboarding/install-extension` with `?installed=1` so the web app knows.
- Popup first open shows a 3-card swipeable mini-tour:
  1. "Pin the extension" (animated arrow to toolbar)
  2. "Visit a job page"
  3. "We do the boring part"
- Skip + Next.

---

## 7. Wiring — concrete data flows

### 7.1 Auth (web)

```
User → /login → Firebase Auth (email/password or OAuth)
     → onAuthStateChanged → set session cookie via /api/auth/session
     → middleware reads cookie → grants access to (dashboard) routes
     → /api/auth/me returns profile (cached in React Query)
```

- Middleware: `apps/web/middleware.ts` — checks cookie, redirects unauthed users on protected routes to `/login?next=...`.
- Session cookie: HttpOnly, Secure, SameSite=Lax, 30 d sliding.
- Server Components read user via `getServerUser()` helper (Firebase Admin SDK).

### 7.2 Extension auth handshake

```
Extension popup → "Sign in" → opens web /login?return=extension
Web finishes auth → web posts message to opener tab + writes a one-time pairing code into Firestore at /pairings/{code}
Extension polls /api/auth/extension-token with the code → receives 24h token + refresh token
Background worker stores tokens in chrome.storage.local
All extension → backend calls send Bearer token
Refresh runs at 50 min via alarm
```

- Backend endpoint `/api/auth/extension-token`: validates code, returns Firebase custom token, deletes the pairing record.

### 7.3 Resume sync

```
Web edits resume → /api/resumes/[id] PATCH → Firestore
Firestore onWrite Cloud Function → pushes to /users/{uid}/extensionInbox with resume id
Extension background subscribes via long-poll (every 60 s) or WebSocket via Firebase Realtime Database channel
Extension updates local cache
```

- Alternatively, simpler: extension reads from `/api/resumes/default` on every popup open. Cache 2 min.

### 7.4 Form-fill flow

```
Page loads → content script detects board
content → background: "FORM_DETECTED" { schema, url }
background → /api/llm/field-map { schema, resumeId } → returns { mappings, confidences }
background → content: "FILL_INSTRUCTIONS" { mappings }
content shows DetectorToast
User clicks "Fill" or "Review"
content → DOM writes (focus, set, dispatch input + change events for React/Vue forms)
content waits for user to submit OR auto-submits if allowed
On submit → content → background: "APPLICATION_SUBMITTED" { snapshot }
background → /api/applications POST → Firestore
background → popup: "ACTIVITY_LOGGED"
```

### 7.5 Stripe subscription

```
User clicks Upgrade → POST /api/stripe/checkout → Stripe Checkout URL
After payment, Stripe redirects to /settings/billing?session_id=...
Stripe webhook → /api/stripe/webhook → updates Firestore subscription record
Profile.subscription_tier updated atomically
Middleware re-reads tier on next request
Customer portal: POST /api/stripe/portal returns portal URL
```

- Webhook events handled: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.

### 7.6 LLM proxy

```
All LLM calls (web + extension) hit Firebase Function `llmProxy`
Function:
  1. Authenticates request (Firebase Admin verify token)
  2. Checks quota (subscriptions + monthly usage counters)
  3. Forwards to provider via Vercel AI SDK
  4. Records token usage and cost in Firestore /usage/{uid}/{yyyymm}
  5. Returns response
```

- Quota enforcement returns 402 with structured body `{ code: 'QUOTA_EXCEEDED', upgradeUrl }`.

### 7.7 Admin role gate

```
Middleware checks `profile.role === 'admin'` for /admin/*
Server Actions in admin routes call assertAdmin(user) helper
Cloud Functions check custom claim { admin: true } set via admin console
```

### 7.8 Email pipeline

- Provider: Resend.
- Transactional: verify, password reset, weekly summary, quota alert, billing.
- Templates: React Email components in `packages/emails/`.
- Triggered from Cloud Functions; not from client.

### 7.9 File upload

```
Client → /api/uploads/signed-url POST { type, filename } → returns signed PUT URL (Firebase Storage)
Client PUT directly to Storage with progress events
On 200, client POST /api/resumes/[id]/parse with the storage path
Server fetches via Admin SDK, parses with pdf-parse / mammoth, sends to LLM for JSON Resume mapping
Returns parsed JSON to client
```

### 7.10 Realtime updates

- Use Firestore listeners only inside Server Component-friendly client islands (`'use client'` components that subscribe with `onSnapshot`).
- Keep listeners scoped (single doc or short query).
- Tear down on unmount.

---

## 8. State management

| Domain                | Strategy                                                            |
|-----------------------|---------------------------------------------------------------------|
| Auth (web)            | React Server Components + cookie. Client islands use a context.     |
| Server data (web)     | TanStack Query for client-island fetching; otherwise RSC fetch.     |
| Forms                 | react-hook-form + zod, everywhere.                                  |
| Resume editor state   | Zustand store, local autosave; sync on debounce to server.          |
| Extension UI state    | Zustand store inside popup.                                         |
| Extension cross-ctx   | `chrome.storage.local` + message bus.                               |
| Realtime              | Firestore `onSnapshot` in dedicated client components.              |
| Toasts                | sonner global Toaster.                                              |

---

## 9. Validation schemas (zod, summary)

Define in `packages/shared/schemas/`:

- `auth.ts`: loginSchema, signupSchema, resetSchema
- `profile.ts`: profileSchema, preferencesSchema
- `resume.ts`: jsonResumeSchema (full JSON Resume v1 + extensions)
- `application.ts`: applicationSchema, applicationStatusEnum, sourceEnum
- `job.ts`: savedJobSchema, jobMatchSchema
- `coverLetter.ts`: coverLetterSchema
- `subscription.ts`: tierEnum, subscriptionSchema
- `extension.ts`: fieldSchema, mappingSchema, confidenceSchema

Every API route validates input with zod and returns `{ ok: false, error: { code, message, fields? } }` on failure.

---

## 10. Accessibility

- All shadcn primitives ship with ARIA; do not regress.
- Color contrast min 4.5:1 for body text. Verify with `axe-core` in dev.
- Focus rings always visible (`focus-visible:ring-2 ring-ring`).
- Keyboard: every interactive reachable, custom keymap documented in `/help/shortcuts`.
- Reduced motion: respect `prefers-reduced-motion`.
- Forms: every input has a `<Label>`; errors linked via `aria-describedby`.
- Skip link at top of dashboard: "Skip to main".

---

## 11. Loading, empty, error, success — required for every page

For each page above, the code agent must implement:

- **Loading**: `loading.tsx` per segment, skeleton matching the final layout (not spinner only).
- **Empty**: dedicated empty-state component, never a blank screen.
- **Error**: `error.tsx` per segment with retry; report-to-Sentry button.
- **Success**: toast confirmation for any mutation.

Use `Suspense` boundaries inside server components for streaming.

---

## 12. Analytics & logging

- **PostHog** for product analytics (events: page_view, autofill_started, autofill_completed, application_submitted, resume_tailored, upgrade_clicked, etc.).
- **Sentry** for errors (web + extension + Cloud Functions).
- **OpenTelemetry** export from Cloud Functions to Honeycomb (Phase 3).

---

## 13. Environment variables

**Firebase** — ✅ configured in `apps/web/.env.local`

Still needed (add to `.env.local`):
```
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
AI_FIELD_MAP_MODEL=gpt-4o-mini
AI_TAILOR_MODEL=gpt-4o
AI_PARSE_MODEL=gpt-4o-mini

# Email
RESEND_API_KEY=

# Extension
NEXT_PUBLIC_EXTENSION_ID=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_MARKETING_URL=
```

---

## 14. Build order for the code agent

~~1. Scaffold monorepo (Turborepo + pnpm), apps/web, apps/extension, packages/shared, packages/ui, packages/emails, firebase/functions.~~ ✅
~~2. Set up shadcn/ui in apps/web with the token CSS above.~~ ✅
3. Build the `(marketing)` layout + `/`, `/pricing`, `/legal/*`. Static, no auth.
4. Complete `(auth)` flow: forgot-password, reset-password, verify-email pages. *(login + signup + Firebase + proxy already done)*
5. Build the `(onboarding)` flow end-to-end.
~~6. Build `(dashboard)` layout, Dashboard home with stubbed data.~~ ✅
7. Build Resumes module (list, editor, preview) with autosave.
8. Build Applications module (list kanban+table, detail, manual create).
9. Stripe billing wiring + paywall hooks.
10. Complete extension: popup tabs, auth pairing flow. *(WXT scaffold + popup shell already done)*
11. Content script detection for LinkedIn Easy Apply first; field mapper proxy.
12. Autofill engine + DetectorToast + ReviewPanel.
13. Activity logging round-trip to `/api/applications`.
14. Indeed selectors next; then queue-for-review flow.
15. Cover letters + resume tailoring.
16. Analytics page (Pro).
17. Admin panel.
18. Polish, empty states, a11y pass, Sentry/PostHog, deploy.

---

## 15. Done-definition per feature

A feature is shipped only when **all** are true:

- Happy path works on Chrome stable on macOS + Windows.
- Loading, empty, error, success states implemented.
- a11y: keyboard-only operable, screen-reader labels.
- Mobile responsive (web) at 360 px width.
- Sentry instrumented, PostHog event fired on key actions.
- Zod validation server-side.
- Unit test for any non-trivial pure function in `packages/shared`.
- README in feature folder describing data flow and gotchas.

---

End of spec. Hand to code agent.