import { NextRequest, NextResponse } from 'next/server';
import { AuditResult } from '@/lib/types';

interface SummaryRequest {
  results: AuditResult;
  teamSize: number;
  useCase: string;
}

/**
 * Generate a structured AI summary using Anthropic API.
 * Falls back to a template-based summary if the API is unavailable.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SummaryRequest;

    if (!body.results) {
      return NextResponse.json({ error: 'Missing results data' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Fallback: generate a template-based summary without AI
      const summary = generateFallbackSummary(body.results, body.teamSize, body.useCase);
      return NextResponse.json({ summary, source: 'template' });
    }

    try {
      const prompt = buildPrompt(body.results, body.teamSize, body.useCase);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        console.error('[summary] Anthropic API error:', response.status);
        const summary = generateFallbackSummary(body.results, body.teamSize, body.useCase);
        return NextResponse.json({ summary, source: 'template' });
      }

      const data = await response.json();
      const summary = data?.content?.[0]?.text ?? generateFallbackSummary(body.results, body.teamSize, body.useCase);

      return NextResponse.json({ summary, source: 'ai' });
    } catch (apiError) {
      console.error('[summary] Anthropic API call failed:', apiError);
      const summary = generateFallbackSummary(body.results, body.teamSize, body.useCase);
      return NextResponse.json({ summary, source: 'template' });
    }
  } catch (err) {
    console.error('[summary] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Build a structured prompt for the AI summary.
 * Forces a 4-sentence structure to prevent rambling.
 */
function buildPrompt(results: AuditResult, teamSize: number, useCase: string): string {
  const toolLines = results.recommendations
    .map((r) => `- ${r.toolName} (${r.currentPlan}): ${r.action} — saves $${r.monthlySavings}/mo. ${r.reason}`)
    .join('\n');

  return `You are a concise financial advisor for startup AI infrastructure spending.

A ${teamSize}-person team using AI tools primarily for ${useCase} ran an audit with these results:

Total current monthly spend: $${results.totalCurrentSpend}
Total potential monthly savings: $${results.totalMonthlySavings}
Total potential annual savings: $${results.totalAnnualSavings}

Per-tool recommendations:
${toolLines}

Write exactly 4 sentences summarizing this audit:
1. One sentence describing their current AI spend situation.
2. One sentence about the biggest optimization opportunity found.
3. One sentence stating the estimated savings with a specific dollar figure.
4. One sentence with a strategic recommendation.

Be direct, specific, and use actual numbers. Do not use bullet points or lists. Write as a single paragraph. Do not exceed 100 words.`;
}

/**
 * Template-based fallback summary when Anthropic API is unavailable.
 * Still produces useful, specific output based on actual audit data.
 */
function generateFallbackSummary(results: AuditResult, teamSize: number, useCase: string): string {
  const { totalCurrentSpend, totalMonthlySavings, totalAnnualSavings, recommendations } = results;

  if (totalMonthlySavings === 0) {
    return `Your ${teamSize}-person team's AI stack for ${useCase} is already well-optimized at $${totalCurrentSpend}/mo. No significant savings opportunities were identified across your ${recommendations.length} tool(s). Continue monitoring for pricing changes or new alternatives that may offer better value. Consider signing up for pricing alerts to stay ahead of market shifts.`;
  }

  const biggestSaving = recommendations.reduce((max, r) => r.monthlySavings > max.monthlySavings ? r : max, recommendations[0]);
  const actionVerb = biggestSaving.action === 'downgrade' ? 'downgrading' : biggestSaving.action === 'consolidate' ? 'consolidating' : biggestSaving.action === 'switch' ? 'switching' : 'optimizing';

  return `Your ${teamSize}-person team spends $${totalCurrentSpend}/mo across ${recommendations.length} AI tool(s) for ${useCase}. The biggest opportunity is ${actionVerb} ${biggestSaving.toolName}, which could save $${biggestSaving.monthlySavings}/mo alone. In total, implementing these recommendations would save $${totalMonthlySavings}/mo ($${totalAnnualSavings}/year). Consider starting with the highest-confidence recommendations and re-evaluating your stack quarterly.`;
}
