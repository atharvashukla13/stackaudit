import { describe, it, expect } from 'vitest';
import { runAudit } from '@/lib/auditEngine';
import { AuditInput } from '@/lib/types';

describe('auditEngine', () => {
  it('flags 2-user Copilot Business team as overkill and recommends Pro', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'github_copilot', planId: 'copilot_business', seats: 2, monthlySpend: 38 },
      ],
      teamSize: 2,
      useCase: 'coding',
    };
    const result = runAudit(input);
    expect(result.recommendations).toHaveLength(1);
    const rec = result.recommendations[0];
    expect(rec.action).toBe('downgrade');
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.confidence).toBe('high');
    expect(rec.recommendedPlan).toBe('Pro');
  });

  it('flags solo Cursor Pro user with a cheaper cross-vendor alternative', () => {
    // Cursor Pro is $20/mo, Copilot Pro is $10/mo — a valid 50% savings recommendation
    const input: AuditInput = {
      tools: [
        { toolId: 'cursor', planId: 'cursor_pro', seats: 1, monthlySpend: 20 },
      ],
      teamSize: 1,
      useCase: 'coding',
    };
    const result = runAudit(input);
    expect(result.recommendations).toHaveLength(1);
    const rec = result.recommendations[0];
    expect(rec.action).toBe('switch');
    expect(rec.monthlySavings).toBeGreaterThan(0);
  });

  it('reports solo Copilot Pro user as already optimal (no cheaper IDE alternative)', () => {
    // Copilot Pro at $10/mo is the cheapest paid IDE — no switch possible
    const input: AuditInput = {
      tools: [
        { toolId: 'github_copilot', planId: 'copilot_pro', seats: 1, monthlySpend: 10 },
      ],
      teamSize: 1,
      useCase: 'coding',
    };
    const result = runAudit(input);
    expect(result.recommendations).toHaveLength(1);
    const rec = result.recommendations[0];
    expect(rec.action).toBe('keep');
    expect(rec.monthlySavings).toBe(0);
  });

  it('flags ChatGPT Team for solo user as overkill', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'chatgpt', planId: 'chatgpt_team', seats: 1, monthlySpend: 25 },
      ],
      teamSize: 1,
      useCase: 'writing',
    };
    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.action).toBe('downgrade');
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.confidence).toBe('high');
  });

  it('flags duplicate IDE tools (Cursor + Copilot) for consolidation', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'cursor', planId: 'cursor_pro', seats: 5, monthlySpend: 100 },
        { toolId: 'github_copilot', planId: 'copilot_pro', seats: 5, monthlySpend: 50 },
      ],
      teamSize: 5,
      useCase: 'coding',
    };
    const result = runAudit(input);
    // At least one should get flagged for consolidation
    const consolidated = result.recommendations.filter((r) => r.action === 'consolidate');
    expect(consolidated.length).toBeGreaterThanOrEqual(1);
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
  });

  it('suggests Credex credits for high API spend', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'anthropic_api', planId: 'anthropic_api_payg', seats: 1, monthlySpend: 500 },
      ],
      teamSize: 5,
      useCase: 'coding',
    };
    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.action).toBe('credits');
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.reason).toContain('Credex');
  });

  it('handles empty tool list gracefully', () => {
    const input: AuditInput = {
      tools: [],
      teamSize: 1,
      useCase: 'coding',
    };
    const result = runAudit(input);
    expect(result.recommendations).toHaveLength(0);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.totalAnnualSavings).toBe(0);
  });

  it('correctly sums total savings across multiple tools', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'chatgpt', planId: 'chatgpt_team', seats: 1, monthlySpend: 25 },
        { toolId: 'anthropic_api', planId: 'anthropic_api_payg', seats: 1, monthlySpend: 300 },
      ],
      teamSize: 1,
      useCase: 'mixed',
    };
    const result = runAudit(input);
    const sumSavings = result.recommendations.reduce((s, r) => s + r.monthlySavings, 0);
    expect(result.totalMonthlySavings).toBe(sumSavings);
    expect(result.totalAnnualSavings).toBe(sumSavings * 12);
  });

  it('sets credexTier correctly based on total savings', () => {
    // High savings (>$500/mo)
    const highInput: AuditInput = {
      tools: [
        { toolId: 'anthropic_api', planId: 'anthropic_api_payg', seats: 1, monthlySpend: 5000 },
      ],
      teamSize: 10,
      useCase: 'coding',
    };
    const highResult = runAudit(highInput);
    expect(highResult.credexTier).toBe('high');

    // Optimal (0 savings) — Copilot Pro has no cheaper alternative
    const optimalInput: AuditInput = {
      tools: [
        { toolId: 'github_copilot', planId: 'copilot_pro', seats: 1, monthlySpend: 10 },
      ],
      teamSize: 1,
      useCase: 'coding',
    };
    const optimalResult = runAudit(optimalInput);
    expect(optimalResult.credexTier).toBe('optimal');
  });
});
