# Unit Economics — StackAudit

## Cost Structure

### Fixed Costs (Monthly)
| Item | Cost | Notes |
|------|------|-------|
| Vercel (Hosting) | $0 | Free tier covers ~100K requests/mo |
| Supabase | $0 | Free tier: 500MB DB, 50K auth users |
| Domain (if custom) | ~$1/mo | Amortized annual cost |
| **Total Fixed** | **~$1/mo** | |

### Variable Costs (Per Audit)
| Item | Cost/Audit | Notes |
|------|-----------|-------|
| Anthropic API (summary) | ~$0.003 | Sonnet, ~300 tokens output |
| Resend (email) | $0 | Free tier: 3,000 emails/mo |
| Supabase (storage) | ~$0 | ~1KB per audit row |
| **Total Variable** | **~$0.003** | |

### Cost at Scale
| Monthly Audits | AI Summary Cost | Email Cost | Total |
|----------------|----------------|------------|-------|
| 100 | $0.30 | $0 | $0.30 |
| 1,000 | $3.00 | $0 | $3.00 |
| 10,000 | $30.00 | $0 → $20* | $50.00 |
| 50,000 | $150.00 | $80* | $230.00 |

*Resend paid plan kicks in at 3,000 emails/mo ($20/mo for 50K)

## Revenue Model

StackAudit is a **lead-generation tool**, not a standalone revenue product.

### Value to Credex
Each qualified lead (high savings, engaged user) has an estimated value of **$50-200** based on:
- Credex's average contract value for discounted AI credits
- Typical enterprise sales conversion rate (5-15% from warm lead)
- Average customer lifetime value at Credex

### Lead Qualification Tiers
| Tier | Monthly Savings | Lead Value | Expected Action |
|------|----------------|------------|-----------------|
| High | >$500/mo | $100-200 | Direct Credex consultation |
| Medium | $100-500/mo | $30-80 | Nurture + follow-up |
| Low | $1-100/mo | $5-15 | Newsletter + awareness |
| Optimal | $0 | $2-5 | Brand awareness only |

### Break-Even Analysis
At $0.003/audit and average lead value of $50 (conservative):
- **Break-even:** 1 Credex conversion per 16,700 audits
- **Realistic conversion:** 2-5% of leads → break-even at ~200-500 audits
- **ROI:** At 1,000 audits/mo with 3% conversion → 30 leads → $1,500 value vs $3 cost = **500x ROI**

## Why Free Works

1. **Zero-friction adoption** — No signup required, instant value
2. **Trust building** — Honest recommendations (including "you're optimal") build credibility
3. **Network effects** — Shareable audit results drive organic referrals
4. **Data advantage** — Aggregated audit data reveals market pricing trends for Credex
