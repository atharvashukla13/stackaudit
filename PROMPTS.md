# Prompts — StackAudit AI Summary

## Where AI Is Used

StackAudit uses AI in exactly **one place**: generating a personalized summary paragraph on the results page. The audit logic itself is entirely rule-based — the assignment explicitly values knowing when NOT to use AI.

## The Prompt

```
You are a concise financial advisor for startup AI infrastructure spending.

A {teamSize}-person team using AI tools primarily for {useCase} ran an audit with these results:

Total current monthly spend: ${totalCurrentSpend}
Total potential monthly savings: ${totalMonthlySavings}
Total potential annual savings: ${totalAnnualSavings}

Per-tool recommendations:
- {toolName} ({plan}): {action} — saves ${savings}/mo. {reason}
...

Write exactly 4 sentences summarizing this audit:
1. One sentence describing their current AI spend situation.
2. One sentence about the biggest optimization opportunity found.
3. One sentence stating the estimated savings with a specific dollar figure.
4. One sentence with a strategic recommendation.

Be direct, specific, and use actual numbers. Do not use bullet points or lists. Write as a single paragraph. Do not exceed 100 words.
```

## Why This Prompt Structure

### Problem
LLMs tend to ramble when given open-ended summarization tasks. Early attempts produced 200+ word responses with generic advice like "consider your options carefully."

### Solution: Forced Structure
The 4-sentence constraint produces consistently useful output:
1. **Sentence 1** — grounds the summary in the user's specific context
2. **Sentence 2** — highlights the most impactful finding (useful even if they skim)
3. **Sentence 3** — gives a concrete dollar figure (the "hook")
4. **Sentence 4** — makes it actionable

### What Didn't Work

1. **"Summarize these results"** — Too vague. Model produced 3-paragraph essays with filler.
2. **"Be brief"** — Still produced 150+ words. "Brief" is subjective for LLMs.
3. **Bullet point format** — Looked like a duplicate of the per-tool breakdown. Paragraph feels more like expert advice.
4. **Role as "startup advisor"** — Produced overly enthusiastic tone. "Financial advisor" is more measured.
5. **Without word limit** — Model would sometimes produce 300+ words. The 100-word cap combined with "exactly 4 sentences" gives the right density.

## Fallback Strategy

If the Anthropic API is unavailable (key missing, rate limited, or error), the system generates a **template-based summary** using the same audit data:

```typescript
`Your ${teamSize}-person team spends $${totalCurrentSpend}/mo across ${count} AI tool(s) for ${useCase}. The biggest opportunity is ${actionVerb} ${toolName}, which could save $${savings}/mo alone. In total, implementing these recommendations would save $${totalMonthlySavings}/mo ($${totalAnnualSavings}/year). Consider starting with the highest-confidence recommendations and re-evaluating your stack quarterly.`
```

This ensures the user always sees a useful summary, even if the AI layer fails.

## Model Choice

Using `claude-sonnet-4-20250514` for the right balance of quality and cost. The summary task is simple enough that a smaller model would work, but since we're already using the Anthropic API (assignment requirement), Sonnet provides better natural language quality at a reasonable cost per call (~$0.003 per summary).
