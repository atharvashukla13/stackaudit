# User Interviews — StackAudit

## Interview 1

**Name:** Arjun  
**Role:** Full-stack Developer (Freelance)  
**Company size:** Solo  
**Date:** 2026-05-13  
**Format:** WhatsApp DM  
**Duration:** ~10 minutes  

### Key Questions Asked
1. What AI tools do you currently pay for?
2. How did you decide which plan to use?
3. Have you ever audited your AI tool spending?
4. Would you trust a free automated audit tool?
5. Would you share results with others?

### Summary of Responses
- Uses Cursor Pro ($20/mo) and ChatGPT Plus ($20/mo). Tried Claude Free but didn't upgrade.
- Picked plans based on "what felt right" — didn't compare pricing pages across tools. Went with Pro on both because free tiers felt too limited.
- Never audited spend. Says "it's just $40/mo, not worth thinking about." But acknowledged that over a year it's nearly $500 — "okay, that's a weekend trip."
- Would trust an automated audit "only if it shows me the actual pricing source, not just a recommendation." Transparency is key.
- Would share on Twitter "if the savings number was impressive enough to be a flex."

### Key Insight
Solo developers perceive $40/mo as trivial, but reframing it as annual cost ($480/yr) shifts their perspective. The audit tool needs to prominently show annual figures, not just monthly.

---

## Interview 2

**Name:** Priya  
**Role:** Engineering Lead  
**Company size:** 12 engineers  
**Date:** 2026-05-13  
**Format:** LinkedIn DM  
**Duration:** ~12 minutes  

### Key Questions Asked
1. How does your team manage AI tool subscriptions?
2. Who decides which plans to use?
3. Have you ever reviewed whether the team is on the right plans?
4. What would make you act on an audit tool's recommendations?
5. How do you currently track AI tooling costs?

### Summary of Responses
- Team uses GitHub Copilot Business ($19/user × 12 = $228/mo), plus some individual Claude Pro subscriptions that the company reimburses.
- She chose Copilot Business for IP indemnity and admin controls. Individual devs chose their own Claude plans without guidance.
- Never reviewed plan selection after initial setup 8 months ago. "We set it and forgot it."
- Would act on recommendations "if the savings were over $100/mo and the switch didn't disrupt workflow. I'm not changing tools to save $20."
- Tracks costs via monthly credit card statements — no dedicated tracking system.

### Key Insight
The threshold for action at a 12-person team is ~$100/mo savings. Below that, the switching cost isn't worth the manager's time. The audit tool should emphasize team-level savings and filter out trivially small recommendations.

---

## Interview 3

**Name:** Karthik  
**Role:** CTO  
**Company size:** 6 engineers (seed-stage startup)  
**Date:** 2026-05-13  
**Format:** Twitter/X DM  
**Duration:** ~8 minutes  

### Key Questions Asked
1. What does your team's AI tool stack look like?
2. Have you considered whether you're on the optimal plans?
3. What would a useful audit look like to you?
4. Would you trust a tool from a company that also sells AI credits?
5. What's your biggest frustration with AI tool pricing?

### Summary of Responses
- Uses Cursor Pro for 4 devs ($80/mo), ChatGPT Team ($25/user × 6 = $150/mo), and Anthropic API (~$200/mo for their product).
- Hasn't revisited plans since initial setup. Admits "we probably have people on plans they don't fully use."
- Wants an audit that says "you're paying for X feature you don't use — here's the math." Not generic advice.
- Would trust a Credex-backed tool "if the audit is honest — if it sometimes says 'you're fine, no changes needed.' A tool that always finds savings feels like a sales pitch."
- Biggest frustration: "Every tool prices differently — per seat, per token, per credit. It's impossible to compare apples to apples."

### Key Insight
Honesty is the trust signal. An audit tool that says "you're already optimal" when true is more credible than one that always finds savings. This validated our "No Savings" UX design decision.

---

## Synthesis

### Common Themes
1. **Set-and-forget behavior**: All three interviewees picked plans once and never revisited. There's no natural trigger to re-evaluate.
2. **Annual framing matters**: Monthly costs feel small; annual costs feel real. The tool should lead with annual savings.
3. **Trust requires transparency**: Users want to see the math, the pricing source, and honest "you're fine" results — not just recommendations.
4. **Action threshold scales with team size**: Solo devs might act on $10/mo savings; team leads need $100+/mo to justify disruption.

### What Changed in Our Product
- Added annual savings prominently alongside monthly in the results hero
- Implemented the "✓ Optimized — your stack is well-optimized" experience for zero-savings scenarios
- Added confidence levels (high/medium/low) to each recommendation so users can judge reliability
- Included pricing source URLs in PRICING_DATA.md and referenced them in the audit engine reasoning
- Set the Credex CTA threshold at >$500/mo for high-intent, acknowledging that small savings don't justify a sales conversation

### Outreach Method
Reached out to developers and engineering leads via WhatsApp, LinkedIn DMs, and Twitter/X DMs. Targeted people who had recently tweeted about AI tool pricing or posted about their development setup. Response rate was approximately 30% (3 conversations from ~10 outreach messages).
