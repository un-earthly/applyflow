# ApplyFlow: Scope & Architecture Document

**Product:** AI-Powered Job Application Automation Platform  
**Date:** May 2026  
**Goal:** MVP scaffold \+ scope definition today. Core features shipped in 2–3 weeks.

---

## 1\. Product Overview

ApplyFlow is a **subscription-based SaaS** that helps job seekers automate their job hunt through:

1. **Browser Extension** — detects job application forms, autofills them using AI, and submits applications (or queues them for review).  
2. **Resume Manager** — JSON-native resume editor with AI-powered tailoring per job description.  
3. **User Dashboard** — track applications, success rates, pipeline stages, and AI recommendations.  
4. **Admin Panel** — operator view for user management, subscription oversight, support, and analytics.  
5. **Landing Page** — marketing site with pricing, features, and signup.

---

## 2\. Tech Stack (2026-Ready)

| Layer | Technology | Reason |
| :---- | :---- | :---- |
| **Web App** | Next.js 16 (App Router), React 19, TypeScript | Modern, RSC, fast DX |
| **Styling** | Tailwind CSS v4 \+ shadcn/ui | Rapid UI, accessible |
| **Extension** | WXT \+ React \+ TypeScript | WXT is actively maintained (Plasmo is in maintenance mode as of 2025-26). Vite-based, framework-agnostic, MV3 ready |
| **Backend** | Firebase | Auth, Firestore, Storage, Cloud Functions, Realtime — all-in-one, zero backend code |
| **AI/LLM** | OpenAI GPT-4o / Claude 3.5 Sonnet | Resume parsing, field mapping, job matching, cover letters |
| **Agentic** | Custom content-script agent \+ Skyvern API fallback | Extension-native form detection \+ Skyvern for complex multi-page flows |
| **Payments** | Stripe (Checkout \+ Customer Portal) | Subscription tiers, metered billing |
| **Resume Standard** | JSON Resume (jsonresume.org) schema | Industry standard, interoperable, template-friendly |
| **Deployment** | Vercel (web), Chrome Web Store (ext) | Fastest path to market |

---

## 3\. Core Modules

### 3.1 Browser Extension (WXT)

**Permissions:** `activeTab`, `storage`, `scripting`, `host_permissions` for job boards

**Architecture:**

`extension/`  
`├── entrypoints/`  
`│   ├── popup/           # Main UI (React)`  
`│   ├── content/         # Injected per page — form detector + filler`  
`│   ├── background/      # Service worker — API calls, auth sync`  
`│   └── options/         # Settings page`  
`├── components/          # Shared React components`  
`├── lib/`  
`│   ├── agent.ts         # AI field-mapping agent`  
`│   ├── form-scanner.ts  # DOM form detection`  
`│   ├── autofill.ts      # Form filler engine`  
`│   └── api.ts           # Backend communication`  
`└── package.json`

**How it works:**

1. **Detect** — Content script scans page for job application forms (LinkedIn, Indeed, Greenhouse, Lever, Workday, custom ATS).  
2. **Extract** — Pulls field labels, placeholders, required fields, dropdown options.  
3. **Map** — Sends field schema \+ user resume JSON to LLM. Returns field→value mappings with confidence scores.  
4. **Fill** — Injects values into form fields. For file uploads (resume/CV), uses pre-uploaded URL from Firebase Storage.  
5. **Submit** — Either auto-submits (if confidence \> threshold) or queues for user review in popup.  
6. **Log** — Records application to backend (company, role, URL, date, status).

### 3.2 Resume Manager (JSON-Native)

**Schema:** Strict JSON Resume v1.0.0 \+ custom extensions for:

- `aiSummary` — AI-generated professional summary variants  
- `skillsWeights` — proficiency \+ recency for job matching  
- `tailoredVersions[]` — job-specific resume snapshots

**Features:**

- Visual editor (forms) ↔ JSON editor (monaco) toggle  
- AI import: Parse PDF/DOCX → JSON Resume via GPT-4o  
- AI tailor: Paste job description → get optimized resume variant  
-- Template rendering: HTML/PDF export via React-PDF or Puppeteer  
-- Storage: Firebase Firestore (structured) \+ Firebase Storage (PDF exports)

### 3.3 User Dashboard (Next.js App)

**Routes:**

- `/` — Landing page  
-- `/login`, `/signup` — Firebase Auth (OAuth \+ email)  
- `/dashboard` — Main dashboard  
  - Applications pipeline (Applied → Screening → Interview → Offer)  
  - Stats: applications/day, response rate, source breakdown  
  - Job board integrations (LinkedIn, Indeed, etc.)  
- `/dashboard/resume` — Resume editor  
- `/dashboard/jobs` — Saved jobs, job alerts, AI recommendations  
- `/dashboard/settings` — Profile, billing, preferences

**Subscriptions (Stripe):**

- **Free:** 10 autofills/month, 1 resume, basic templates  
- **Pro ($12/mo):** Unlimited autofills, 5 resumes, AI tailoring, advanced templates, analytics  
- **Teams ($29/mo/user):** Everything \+ shared templates, team analytics, admin controls

### 3.4 Admin Panel (Next.js Route Group)

**Route:** `/admin/*` (protected by RLS \+ middleware role check)

**Features:**

- User table with search/filter  
- Subscription overview (MRR, churn, trials)  
- Support tickets / user feedback  
- Feature flags & kill switches  
- Job board compatibility matrix (which sites work, success rates)  
- Audit logs

### 3.5 Landing Page

- Hero with demo video/GIF  
- How it works (3 steps)  
- Pricing cards  
- Testimonials  
- FAQ  
- Footer with legal

---

## 4\. Data Model (Firebase / Firestore)

`-- Users (handled by Firebase Auth, extended via profiles)`  
`profiles`  
`- id (uuid, pk, ref auth.users)`  
`- full_name`  
`- avatar_url`  
`- subscription_tier (free|pro|team)`  
`- stripe_customer_id`  
`- stripe_subscription_id`  
`- created_at`

`resumes`  
`- id (uuid, pk)`  
`- user_id (uuid, fk)`  
`- name ("Main", "Software Engineer", etc.)`  
`- json_data (jsonb) -- JSON Resume schema`  
`- is_default (bool)`  
`- created_at, updated_at`

`applications`  
`- id (uuid, pk)`  
`- user_id (uuid, fk)`  
`- resume_id (uuid, fk, nullable)`  
`- company_name`  
`- role_title`  
`- job_url`  
`- source (linkedin, indeed, greenhouse, direct)`  
`- status (applied, screening, interview, offer, rejected, ghosted)`  
`- applied_at`  
`- notes`  
`- salary_range`  
`- location`  
`- remote_type (onsite, hybrid, remote)`  
`- metadata (jsonb) -- form data snapshot, AI confidence, etc.`

`tailored_resumes`  
`- id (uuid, pk)`  
`- resume_id (uuid, fk)`  
`- job_description (text)`  
`- tailored_json (jsonb)`  
`- ai_score (float) -- match score`  
`- created_at`

`job_boards`  
`- id (uuid, pk)`  
`- name (greenhouse, lever, workday, etc.)`  
`- domain_pattern`  
`- selector_config (jsonb) -- CSS selectors for form detection`  
`- is_supported (bool)`  
`- success_rate (float)`  
`- updated_at`

`subscriptions`  
`- id (uuid, pk)`  
`- user_id (uuid, fk)`  
`- stripe_subscription_id`  
`- stripe_price_id`  
`- status (trialing, active, past_due, canceled)`  
`- current_period_start/end`  
`- cancel_at_period_end (bool)`  
`- created_at`

---

## 5\. Agentic Workflow Architecture

### Form-Filling Agent (Extension)

`┌─────────────────────────────────────────────────────────────┐`  
`│  Job Site Page (LinkedIn, Greenhouse, etc.)                 │`  
`│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │`  
`│  │ Form Scanner │→ │ Field Schema │→ │ LLM Field Mapper │  │`  
`│  │ (DOM crawl)  │  │ (label,type, │  │ (resume JSON +   │  │`  
`│  │              │  │ required)    │  │  schema → values)│  │`  
`│  └──────────────┘  └──────────────┘  └──────────────────┘  │`  
`│                           ↓                                 │`  
`│  ┌─────────────────────────────────────────────────────┐   │`  
`│  │ Confidence Check                                    │   │`  
`│  │ > 0.9  → Autofill + Auto-submit (if allowed)       │   │`  
`│  │ 0.7-0.9 → Autofill + Queue for review              │   │`  
`│  │ < 0.7   → Queue for manual mapping                 │   │`  
`│  └─────────────────────────────────────────────────────┘   │`  
`└─────────────────────────────────────────────────────────────┘`

**LLM Prompt Strategy:**

- System prompt: "You are a job application form filler. Map form fields to resume data. Return JSON with field selectors and values. If a field has no match, suggest a reasonable default or ask the user."  
- Few-shot examples for common fields (name, email, phone, LinkedIn, portfolio, work auth, salary expectation, start date)

**Fallback for Complex Flows:**

- Multi-page applications → Use Skyvern API to orchestrate  
-- CAPTCHA → Pause, notify user  
-- File upload → Use pre-signed Firebase Storage URL

### Job Matching Agent (Backend)

- User uploads/pastes job description  
- Embedding via OpenAI `text-embedding-3-small`  
- Match against user's skills/experience vector  
- Return match score \+ missing skills \+ tailored resume suggestion

---

## 6\. API & Integration Surface

| Integration | Purpose |
| :---- | :---- |
| **Firebase Auth** | Login, SSO, session management |
| **Firebase Firestore** | All application data |
| **Firebase Cloud Functions** | Stripe webhooks, LLM proxy (rate limit \+ audit), PDF generation |
| **Firebase Storage** | Resume PDFs, cover letters, avatars |
| **Stripe** | Subscriptions, billing portal |
| **OpenAI API** | Resume parsing, field mapping, job matching, cover letters |
| **Skyvern API** (optional) | Complex multi-page application flows |
| **Chrome Extension Manifest V3** | Extension distribution |

---

## 7\. Development Phases

### Decisions (Locked)

- **Job Boards First:** LinkedIn Easy Apply \+ Indeed only. Greenhouse/Lever in Phase 2\.  
- **Submission Mode:** Hybrid. Auto-submit LinkedIn Easy Apply (low risk, predictable). Queue all others (Indeed, future boards) for user review.  
- **AI Provider:** Vercel AI SDK with provider-agnostic abstraction. Default to OpenAI GPT-4o (cost \+ speed), swappable to Claude/Anthropic or local models via single env var.  
- **Resume Editor:** Block-based WYSIWYG editor (like Notion/Craft). Each block maps to JSON Resume schema nodes. Live JSON preview. Export to PDF (React-PDF) and HTML. Import from PDF/DOCX/LinkedIn in Phase 2\.

### Phase 0: Today — Scaffold & Foundation

- [ ] Project structure (monorepo: web \+ extension)  
- [ ] Next.js 15 \+ shadcn/ui init  
-- [ ] WXT extension init  
-- [ ] Firebase project setup  
-- [ ] Database schema migrations  
- [ ] Stripe product/price setup  
- [ ] Environment variables

### Phase 1: Week 1 — Core Loop

- [ ] Extension: Form detection for top 5 job boards  
- [ ] Extension: AI field mapping (OpenAI)  
- [ ] Extension: Autofill engine  
- [ ] Web: Auth (login/signup)  
- [ ] Web: Resume JSON editor \+ import  
- [ ] Web: Application tracker dashboard

### Phase 2: Week 2 — Polish & Monetize

- [ ] Extension: Queue/review flow  
- [ ] Web: AI resume tailor  
- [ ] Web: Stripe subscriptions  
- [ ] Web: Admin panel  
- [ ] Landing page  
- [ ] PDF export

### Phase 3: Week 3 — Scale

- [ ] More job board selectors  
- [ ] Job matching recommendations  
- [ ] Analytics & insights  
- [ ] Chrome Web Store publish  
- [ ] Vercel deploy

---

## 8\. Cost Estimates

### Infrastructure (Monthly at 1,000 users)

| Service | Tier | Cost |
| :---- | :---- | :---- |
| **Vercel** | Pro | $20/mo |
| **Firebase** | Pro | $25/mo |
| **OpenAI API** | GPT-4o (\~500 calls/day) | \~$150-300/mo |
| **Stripe** | 0.5% \+ $0.25/transaction | Variable |
| **Skyvern** (optional fallback) | Pay-as-you-go | \~$50/mo |
| **Domain** | .com | $12/yr |
| **Total** |  | **\~$250-400/mo** |

### Revenue Model (at 1,000 users)

| Tier | Users | ARPU | MRR |
| :---- | :---- | :---- | :---- |
| Free | 700 | $0 | $0 |
| Pro | 250 | $12 | $3,000 |
| Teams | 50 | $29 | $1,450 |
| **Total** |  |  | **$4,450 MRR** |

**Net at 1K users: \~$4,000-4,200/mo**

### Development Time Estimate

| Phase | Effort | Calendar Time |
| :---- | :---- | :---- |
| Phase 0 (Scaffold) | 2-4 hrs | Today |
| Phase 1 (Core) | 40-50 hrs | 1 week |
| Phase 2 (Polish) | 30-40 hrs | 1 week |
| Phase 3 (Scale) | 20-30 hrs | 1 week |
| **Total** | **\~100-120 hrs** | **3 weeks** |

---

## 9\. Risks & Mitigations

| Risk | Impact | Mitigation |
| :---- | :---- | :---- |
| Job sites block extension | High | Rotate selectors, user-agent spoofing, Skyvern fallback, transparent communication |
| LLM field mapping errors | Medium | Confidence thresholds, manual review queue, user feedback loop to improve prompts |
| CAPTCHAs | Medium | Pause and notify user; integrate 2captcha for Pro users (optional) |
| Data privacy concerns | High | SOC 2 roadmap, local-first where possible, clear privacy policy, GDPR compliance |
| Chrome Web Store rejection | Medium | Follow MV3 guidelines, minimal permissions, clear single purpose |

---

## 10\. Open Questions

1. **Which job boards first?** LinkedIn Easy Apply, Indeed, Greenhouse, Lever, Workday — prioritize by volume?  
2. **Auto-submit or queue?** Legal/ethical considerations. Default to queue for safety?  
3. **Resume parser formats?** PDF only, or DOCX too? (PDF \= easier, DOCX \= mammoth.js)  
4. **AI model preference?** OpenAI vs Claude vs local (Ollama) for privacy-focused users?  
5. **Extension store strategy?** Chrome first, then Edge/Firefox/Safari?

---

## 11\. File Structure

`applyflow/`  
`├── apps/`  
`│   ├── web/                 # Next.js 15 app`  
`│   │   ├── app/`  
`│   │   │   ├── (auth)/      # login, signup`  
`│   │   │   ├── (dashboard)/ # user dashboard`  
`│   │   │   ├── admin/       # admin panel`  
`│   │   │   ├── api/         # Next.js API routes`  
`│   │   │   └── page.tsx     # landing page`  
`│   │   ├── components/`  
`│   │   ├── lib/`  
`│   │   ├── hooks/`  
`│   │   └── types/`  
`│   └── extension/           # WXT extension`  
`│       ├── entrypoints/`  
`│       ├── components/`  
`│       └── lib/`  
`├── packages/`  
`│   ├── shared/              # Shared types, utils, API clients`  
`│   ├── ui/                  # Shared shadcn components`  
`│   └── config/              # Shared tsconfig, eslint, tailwind configs`  
`├── firebase/`  
`│   ├── migrations/`  
`│   └── functions/`  
`└── SCOPE.md`

---

**Next Step:** Scaffold the monorepo and initialize all projects. Ready to proceed?  