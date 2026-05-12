# DEVLOG — StackAudit

## Day 1 — 2026-05-12

**Hours worked:** 4

**What I did:**
- Initialized the Next.js 14 project with TypeScript, Tailwind CSS, and App Router
- Researched and verified pricing data for all 8 AI tools (Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf) from official vendor pricing pages
- Created the complete typed pricing data module (`lib/pricingData.ts`) with every plan, price, and source URL
- Designed the core type system (`lib/types.ts`) covering tool definitions, audit inputs, recommendations with confidence levels, and database models
- Built the full audit engine (`lib/auditEngine.ts`) with 5 distinct checks: team plan overkill detection, duplicate tool consolidation, cheaper same-vendor plan, cross-vendor alternative, and Credex credits opportunity
- Wrote 9 Vitest tests covering the audit engine — all passing
- Built the single-page spend input form with localStorage persistence across page reloads
- Built the results view with savings hero, per-tool breakdown, confidence badges, and tiered Credex CTA
- Created PRICING_DATA.md with all sources cited
- Set up GitHub Actions CI (lint + test + build on push to main)
- Production build passes successfully

**What I learned:**
- Cursor's pricing has shifted to a credit-based model; their current tiers are Hobby/Pro/Pro+/Ultra/Teams/Enterprise. The "Business" tier from the assignment spec is now called "Teams"
- Cross-vendor price comparisons are genuinely useful — Copilot Pro at $10/mo vs Cursor Pro at $20/mo is a real 50% savings for comparable functionality
- Structuring audit rules as a priority chain (overkill → duplicates → same-vendor → cross-vendor → credits) produces clean, non-overlapping recommendations

**Blockers / what I'm stuck on:**
- Need to set up Supabase project and get API keys for Day 3-4 features
- Need to start user interview outreach — planned to DM 5+ founders on X/LinkedIn tonight
- Anthropic API key needed for AI summary feature

**Plan for tomorrow:**
- Create AUDIT_RULES.md (decision matrix documenting all audit logic)
- Add any edge cases I missed in the audit engine
- Start connecting form → engine → results flow end-to-end
- Deploy to Vercel for live URL
- Send user interview outreach messages
