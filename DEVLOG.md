# DEVLOG — StackAudit

## Day 1 — 2026-05-12

**Hours worked:** 4

**What I did:**
- Initialized the Next.js 14 project with TypeScript, Tailwind CSS, and App Router
- Researched and verified pricing data for all 8 AI tools from official vendor pricing pages
- Created the complete typed pricing data module (`lib/pricingData.ts`)
- Designed the core type system (`lib/types.ts`) with confidence levels and DB models
- Built the audit engine (`lib/auditEngine.ts`) with 5 checks: overkill, duplicates, same-vendor downgrade, cross-vendor switch, Credex credits
- Wrote 9 Vitest tests — all passing
- Built single-page spend input form with localStorage persistence
- Built results view with savings hero, per-tool breakdown, and tiered Credex CTA
- Created PRICING_DATA.md and set up GitHub Actions CI
- Production build passes, first commit made

**What I learned:**
- Cross-vendor price comparisons reveal real savings — Copilot Pro at $10/mo vs Cursor Pro at $20/mo is genuinely 50% cheaper for comparable functionality
- Structuring audit rules as a priority chain (overkill → duplicates → same-vendor → cross-vendor → credits) prevents overlapping recommendations

**Blockers:**
- Need Supabase, Anthropic, and Resend API keys for backend features
- Need to start user interview outreach

---

## Day 2 — 2026-05-13

**Hours worked:** 5

**What I did:**
- Built all 3 API routes: `/api/audit` (save), `/api/summary` (AI), `/api/leads` (capture)
- Implemented Anthropic API integration with structured 4-sentence prompt
- Added template-based fallback for AI summary when API unavailable
- Built lead capture with honeypot detection and IP rate limiting (5/hr)
- Built shareable `/audit/[slug]` page (server-rendered for OG meta tags)
- Integrated share button with async save flow (instant results → background persist)
- Updated ResultsView with AI summary loading, lead capture form, share functionality
- Created Supabase client with graceful fallback for local dev
- Wrote all entrepreneurial docs: GTM.md, ECONOMICS.md, LANDING_COPY.md, METRICS.md
- Wrote ARCHITECTURE.md with Mermaid diagram and fallback matrix
- Wrote PROMPTS.md documenting the AI summary prompt design
- Wrote TESTS.md, README.md, REFLECTION.md
- Created USER_INTERVIEWS.md template (needs real data)

**What I learned:**
- Template-based fallback summaries are surprisingly useful — specific data makes even formulaic copy feel personalized
- The 4-sentence prompt constraint is the single biggest improvement to summary quality
- Writing entrepreneurial docs (GTM, ECONOMICS) forces you to think about the product differently than writing code

**Blockers:**
- USER_INTERVIEWS.md needs real conversations — scheduled outreach for today
- Need to deploy to Vercel and push to GitHub

---

## Day 3 — 2026-05-14

_[To be filled]_

---

## Day 4 — 2026-05-15

_[To be filled]_

---

## Day 5 — 2026-05-16

_[To be filled]_

---

## Day 6 — 2026-05-17

_[To be filled]_

---

## Day 7 — 2026-05-18

_[To be filled]_
