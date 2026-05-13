# Tests — StackAudit

## Test Framework

**Vitest** — TypeScript-native, fast execution, works with the `@/` import alias from Next.js.

## Running Tests

```bash
npm test
```

Or with watch mode for development:

```bash
npx vitest --config vitest.config.mts
```

## Test Files

### `lib/__tests__/auditEngine.test.ts` — 9 tests

The audit engine is the core logic of StackAudit. Every recommendation must be defensible, so these tests verify the engine produces correct actions, savings amounts, and confidence levels for known scenarios.

| # | Test Name | What It Verifies |
|---|-----------|------------------|
| 1 | Flags 2-user Copilot Business team as overkill | Team plan detection for small teams → downgrade to Pro, high confidence |
| 2 | Flags solo Cursor Pro with cheaper alternative | Cross-vendor switch (Cursor $20 → Windsurf $15), savings > 0 |
| 3 | Reports solo Copilot Pro as optimal | No cheaper IDE exists → action: keep, savings: 0 |
| 4 | Flags ChatGPT Team for solo user | Team plan overkill for 1 user → downgrade, high confidence |
| 5 | Flags duplicate IDE tools | Cursor + Copilot both for coding → consolidation recommendation |
| 6 | Suggests Credex credits for high API spend | $500/mo Anthropic API → credits action, reason mentions Credex |
| 7 | Handles empty tool list | 0 tools → 0 recommendations, 0 savings (edge case) |
| 8 | Correctly sums savings across tools | Multi-tool input → totalMonthlySavings = sum of individual savings |
| 9 | Sets credexTier correctly | High savings → 'high', optimal → 'optimal' (CTA tier logic) |

## Coverage

The audit engine has the highest test coverage because it's the most critical business logic. API routes, components, and utilities are verified through manual E2E testing on the deployed URL.

## What's NOT Tested (and Why)

- **API routes** — These are thin wrappers around Supabase/Anthropic/Resend SDKs. Mocking external APIs adds test complexity without catching real integration bugs. Better tested E2E.
- **React components** — The form and results UI are tested manually via browser. Component tests would require a DOM environment (jsdom) and significantly more setup for limited value in an MVP.
- **Pricing data** — Prices are manually verified against vendor pages. An automated test would just assert hardcoded values against themselves.
