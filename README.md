# StackAudit — AI Spend Audit for Startups

A free web app that audits your team's AI tool spending and surfaces concrete savings. Built as a lead-generation asset for [Credex](https://credex.rocks).

**Live URL:** https://stackaudit-eta.vercel.app/

---

## What It Does

1. **Input your AI tools** — Cursor, Copilot, Claude, ChatGPT, Gemini, Windsurf, or API spend
2. **Get an instant audit** — Client-side engine analyzes plan/seat/spend against verified pricing data
3. **See specific savings** — Per-tool breakdown with confidence levels and finance-literate reasoning
4. **AI-generated summary** — Structured paragraph via Anthropic API (template fallback if API unavailable)
5. **Share your results** — Shareable URL with dynamic OG meta tags
6. **Credex CTA** — Tiered call-to-action based on savings magnitude

---

## Quick Start

```bash
git clone <repo-url>
cd stackaudit
npm install
cp .env.example .env.local
# Fill in your keys in .env.local
npm run dev
```

**Required env vars** (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`

**Run tests:** `npm test` (9 tests, all passing)

**Build:** `npm run build`

---

## 5 Key Trade-Off Decisions

### 1. Client-side audit engine vs server-side
**Chose: Client-side.** The audit runs entirely in the browser. This gives instant results (0 network latency), works without backend dependencies, and keeps the critical path simple. Trade-off: pricing data is bundled in the client JS (~6KB), making it technically inspectable — but this data is public pricing anyway.

### 2. Hardcoded rules vs LLM-driven recommendations
**Chose: Hardcoded rules.** The assignment explicitly values knowing when NOT to use AI. A rule-based engine is auditable, testable, and produces consistent output. An LLM might hallucinate savings that don't exist. Every recommendation traces back to a specific pricing comparison you can verify.

### 3. Template-based AI fallback vs failing silently
**Chose: Always return a summary.** If the Anthropic API fails, we generate a template-based summary using the same audit data. The user always sees a useful result. The trade-off is that template summaries are formulaic, but they're accurate and specific.

### 4. Async save for sharing vs blocking save before results
**Chose: Async.** Results display instantly. The database save happens in the background when the user clicks "Share." This means the share button activates slightly after results load, but the perceived performance is dramatically better.

### 5. Lead capture AFTER value vs before
**Chose: After.** The user sees full audit results before we ask for an email. This is lower conversion rate than gating results behind email, but it builds trust and aligns with the assignment's emphasis on honest, value-first product design.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (Postgres) |
| Email | Resend |
| AI Summary | Anthropic API (Claude) |
| Hosting | Vercel |
| Testing | Vitest |

---

## File Structure

```
stackaudit/
├── app/
│   ├── api/
│   │   ├── audit/route.ts      # Save audit to Supabase
│   │   ├── leads/route.ts      # Lead capture + email
│   │   └── summary/route.ts    # AI summary generation
│   ├── audit/[slug]/page.tsx   # Shareable audit (SSR)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Landing + form
├── components/
│   ├── ResultsView.tsx         # Results + share + lead capture
│   ├── SharedAuditView.tsx     # Public shared audit view
│   └── ToolEntryRow.tsx        # Tool input row
├── lib/
│   ├── __tests__/
│   │   └── auditEngine.test.ts # 9 tests
│   ├── auditEngine.ts          # Core audit logic (5 checks)
│   ├── pricingData.ts          # Verified pricing for 8 tools
│   ├── supabase.ts             # Supabase client
│   ├── types.ts                # TypeScript types
│   └── utils.ts                # Helpers (slug, rate limit, etc.)
├── .github/workflows/ci.yml
├── PRICING_DATA.md
├── ARCHITECTURE.md
├── DEVLOG.md
├── PROMPTS.md
├── REFLECTION.md
├── TESTS.md
├── GTM.md
├── ECONOMICS.md
├── USER_INTERVIEWS.md
├── LANDING_COPY.md
└── METRICS.md
```

---

## License

Built for the Credex Round 1 assignment.
