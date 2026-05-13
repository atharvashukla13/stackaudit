# Metrics — StackAudit

## North Star Metric

**Qualified Leads per Week** — defined as users who complete an audit with >$100/mo savings AND submit their email.

Why this metric: StackAudit exists to generate leads for Credex. Audit completions without email capture have zero business value. Savings threshold ensures the lead is worth pursuing.

## Funnel Metrics

```
Landing Page Visit
  ↓ (conversion: ~60-80%)
Tool Added (at least 1)
  ↓ (conversion: ~70-90%)
Audit Completed (clicked "Run Audit")
  ↓ (conversion: ~20-40%)
Email Captured
  ↓ (conversion: ~5-15%)
Credex Consultation Booked
```

### Tracking Events

| Event | Where Tracked | What It Tells Us |
|-------|--------------|-----------------|
| `page_view` | Vercel Analytics | Traffic volume and sources |
| `audit_started` | Client-side (form interaction) | Engagement rate |
| `audit_completed` | Client-side (results rendered) | Completion rate |
| `summary_loaded` | API route | AI feature usage |
| `share_clicked` | Client-side | Virality potential |
| `lead_captured` | API route | Conversion rate |
| `credex_cta_clicked` | Client-side | Bottom-of-funnel intent |

## Key Metrics to Track

### Engagement
- **Audit completion rate:** % of visitors who click "Run Audit"
- **Tools per audit:** Average number of tools entered (signal of seriousness)
- **Time to audit:** Seconds from first tool added to "Run Audit" click

### Conversion
- **Email capture rate:** % of audit completers who submit email
- **High-savings lead rate:** % of leads with >$500/mo savings
- **Credex CTA click rate:** % of results viewers who click through to credex.rocks

### Virality
- **Share rate:** % of audit completers who click "Share"
- **Shared audit views:** How many people view a shared audit link
- **Referral audit rate:** % of new audits that come from shared links

### Product Quality
- **Average savings found:** Mean $/mo savings across all audits
- **"Optimal" rate:** % of audits that find zero savings (too high = engine is too conservative; too low = engine is recommending unnecessary changes)
- **Return rate:** % of users who run multiple audits (signals value)

## Target Benchmarks (First 30 Days)

| Metric | Target | Why |
|--------|--------|-----|
| Weekly audits | 200+ | Minimum for statistical significance |
| Completion rate | >60% | Below 60% = form is too complex |
| Email capture rate | >25% | Below 25% = value proposition not landing |
| High-savings leads/week | 10+ | Minimum to justify Credex sales effort |
| Optimal rate | 15-30% | Outside this range = calibrate engine |
| Share rate | >10% | Below 10% = results not compelling enough |

## Measurement Tools

- **Vercel Analytics** (built-in, free) — page views, web vitals
- **Supabase** — audit counts, lead counts, savings distributions
- **Custom logging** — API route console.error for failure tracking
