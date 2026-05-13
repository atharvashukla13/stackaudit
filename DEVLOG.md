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

---

## Day 2 — 2026-05-13

**Hours worked:** 6

**What I did:**
- Built all 3 API routes: `/api/audit` (save), `/api/summary` (AI generation), `/api/leads` (capture)
- Implemented Anthropic API integration with structured 4-sentence prompt and template fallback
- Built lead capture with honeypot detection and IP rate limiting (5 submissions/hr)
- Built shareable `/audit/[slug]` page — server-rendered for OG meta tags
- Integrated share button with async save flow: instant results → background persist
- Updated ResultsView with AI summary loading, lead capture form, share functionality
- Created Supabase client with graceful fallback when unconfigured
- Wrote all entrepreneurial docs: GTM.md, ECONOMICS.md, LANDING_COPY.md, METRICS.md
- Wrote engineering docs: ARCHITECTURE.md (with Mermaid diagram), PROMPTS.md, TESTS.md
- Wrote README.md with 5 real trade-off decisions, REFLECTION.md with all 5 questions
- Created GitHub repo and pushed to github.com/atharvashukla13/stackaudit
- Deployed to Vercel at stackaudit-eta.vercel.app
- Conducted user interview outreach — reached out to developers and engineering leads
- Full E2E test on production: form → audit → results → summary → share → lead capture

**What I learned:**
- Template-based fallback summaries are surprisingly useful — specific data makes even formulaic copy feel personalized
- The 4-sentence prompt constraint is the single biggest improvement to summary quality — LLMs ramble without structural constraints
- Writing entrepreneurial docs (GTM, ECONOMICS) forces you to think about the product differently than writing code — it surfaced gaps in my CTA strategy

**Blockers:**
- None — all core features are implemented and deployed
