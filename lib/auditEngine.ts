// StackAudit — Core audit engine
// Hardcoded rules, NOT AI. The assignment says: knowing when NOT to use AI is part of the test.
// Every recommendation must be defensible — a finance person should read the reasoning and agree.

import { AuditInput, AuditResult, ToolRecommendation, ToolEntry, UseCase, Confidence } from './types';
import { TOOLS, getPlanInfo, estimatePlanCost } from './pricingData';

/**
 * Run the full audit on user input and return results.
 */
export function runAudit(input: AuditInput): AuditResult {
  const recommendations: ToolRecommendation[] = [];

  for (const entry of input.tools) {
    const rec = auditSingleTool(entry, input.teamSize, input.useCase, input.tools);
    recommendations.push(rec);
  }

  const totalMonthlySavings = recommendations.reduce((sum, r) => sum + r.monthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;
  const totalCurrentSpend = recommendations.reduce((sum, r) => sum + r.currentMonthlySpend, 0);

  let credexTier: AuditResult['credexTier'] = 'optimal';
  if (totalMonthlySavings > 500) credexTier = 'high';
  else if (totalMonthlySavings > 100) credexTier = 'medium';
  else if (totalMonthlySavings > 0) credexTier = 'low';

  return { recommendations, totalMonthlySavings, totalAnnualSavings, totalCurrentSpend, credexTier };
}

function auditSingleTool(
  entry: ToolEntry,
  teamSize: number,
  useCase: UseCase,
  allTools: ToolEntry[]
): ToolRecommendation {
  const tool = TOOLS[entry.toolId];
  const currentPlan = getPlanInfo(entry.toolId, entry.planId);
  const toolName = tool?.name ?? entry.toolId;
  const currentPlanName = currentPlan?.name ?? entry.planId;

  const base: ToolRecommendation = {
    toolId: entry.toolId,
    toolName,
    currentPlan: currentPlanName,
    currentMonthlySpend: entry.monthlySpend,
    action: 'keep',
    monthlySavings: 0,
    reason: 'Your current plan appears well-suited for your usage.',
    confidence: 'medium',
  };

  if (!tool || !currentPlan) return base;

  // Run checks in priority order — return the first actionable recommendation
  const checks = [
    () => checkTeamPlanOverkill(entry, currentPlan, tool, teamSize),
    () => checkDuplicateTools(entry, allTools, useCase),
    () => checkCheaperSameVendorPlan(entry, currentPlan, tool, teamSize, useCase),
    () => checkCheaperAlternative(entry, useCase, teamSize),
    () => checkCredexCredits(entry),
  ];

  for (const check of checks) {
    const result = check();
    if (result && (result.monthlySavings ?? 0) > 0) {
      return { ...base, ...result };
    }
  }

  // Optimal — no savings found
  return {
    ...base,
    action: 'keep',
    reason: `Your ${currentPlanName} plan at ${formatCurrency(entry.monthlySpend)}/mo is appropriate for a ${teamSize}-person team using it for ${useCase}.`,
    confidence: 'high',
  };
}

// ---- CHECK 1: Team/Business plan overkill for small teams ----
function checkTeamPlanOverkill(
  entry: ToolEntry,
  currentPlan: ReturnType<typeof getPlanInfo>,
  tool: (typeof TOOLS)[string],
  teamSize: number
): Partial<ToolRecommendation> | null {
  if (!currentPlan) return null;
  const planName = currentPlan.name.toLowerCase();
  const isTeamPlan = planName.includes('team') || planName.includes('business') || planName.includes('enterprise');
  if (!isTeamPlan) return null;

  // Find the best individual plan
  const individualPlans = tool.plans.filter(
    (p) => !p.name.toLowerCase().includes('team') &&
           !p.name.toLowerCase().includes('business') &&
           !p.name.toLowerCase().includes('enterprise') &&
           p.pricePerSeat > 0
  );
  if (individualPlans.length === 0) return null;

  // Sort by price ascending to find cheapest viable individual plan
  const cheapest = individualPlans.sort((a, b) => a.pricePerSeat - b.pricePerSeat)[0];
  const individualCost = cheapest.pricePerSeat * entry.seats;

  if (entry.seats <= 2 && individualCost < entry.monthlySpend) {
    const savings = entry.monthlySpend - individualCost;
    return {
      action: 'downgrade',
      recommendedPlan: cheapest.name,
      monthlySavings: savings,
      reason: `Your ${entry.seats}-person team is on ${currentPlan.name}, which includes collaboration features (SSO, admin controls, centralized billing) that typically deliver value at 5+ seats. Switching each user to ${cheapest.name} at ${formatCurrency(cheapest.pricePerSeat)}/user saves ${formatCurrency(savings)}/mo without losing core AI capabilities.`,
      confidence: 'high' as Confidence,
    };
  }

  // Check min seat requirements
  if (currentPlan.minSeats && entry.seats < currentPlan.minSeats) {
    const minCost = currentPlan.pricePerSeat * currentPlan.minSeats;
    if (minCost > entry.monthlySpend) return null; // They're paying less than min somehow
    const savings = entry.monthlySpend - (cheapest.pricePerSeat * entry.seats);
    if (savings > 0) {
      return {
        action: 'downgrade',
        recommendedPlan: cheapest.name,
        monthlySavings: savings,
        reason: `${currentPlan.name} requires a minimum of ${currentPlan.minSeats} seats, but you only have ${entry.seats} users. You're paying for unused seats. Individual ${cheapest.name} plans would cost ${formatCurrency(cheapest.pricePerSeat * entry.seats)}/mo total.`,
        confidence: 'high' as Confidence,
      };
    }
  }

  return null;
}

// ---- CHECK 2: Duplicate tools for same use case ----
function checkDuplicateTools(
  entry: ToolEntry,
  allTools: ToolEntry[],
  useCase: UseCase
): Partial<ToolRecommendation> | null {
  const tool = TOOLS[entry.toolId];
  if (!tool) return null;

  // Find other tools of the same category
  const sameCategory = allTools.filter(
    (t) => t.toolId !== entry.toolId && TOOLS[t.toolId]?.category === tool.category
  );
  if (sameCategory.length === 0) return null;

  // IDE tools: if user has both Cursor and Copilot (or Windsurf), suggest consolidating
  if (tool.category === 'ide') {
    const otherIDE = sameCategory[0];
    const otherName = TOOLS[otherIDE.toolId]?.name ?? otherIDE.toolId;
    // Suggest dropping the more expensive one
    if (entry.monthlySpend >= otherIDE.monthlySpend && entry.monthlySpend > 0) {
      return {
        action: 'consolidate',
        monthlySavings: entry.monthlySpend,
        reason: `You're paying for both ${tool.name} and ${otherName} — both are AI code editors with overlapping capabilities (completions, chat, agent mode). Most teams find one sufficient. Consolidating to ${otherName} eliminates ${formatCurrency(entry.monthlySpend)}/mo in redundant spend.`,
        confidence: 'medium' as Confidence,
      };
    }
  }

  // Chat tools: Claude + ChatGPT overlap
  if (tool.category === 'chat') {
    const otherChat = sameCategory[0];
    const otherName = TOOLS[otherChat.toolId]?.name ?? otherChat.toolId;
    if (entry.monthlySpend > 0 && otherChat.monthlySpend > 0) {
      const cheaper = entry.monthlySpend <= otherChat.monthlySpend ? entry : otherChat;
      if (entry.toolId !== cheaper.toolId) {
        return {
          action: 'consolidate',
          monthlySavings: entry.monthlySpend,
          reason: `You're subscribing to both ${tool.name} and ${otherName} for ${useCase}. Unless your team has distinct workflow requirements for each, consolidating to the lower-cost option saves ${formatCurrency(entry.monthlySpend)}/mo.`,
          confidence: 'medium' as Confidence,
        };
      }
    }
  }

  return null;
}

// ---- CHECK 3: Cheaper same-vendor plan ----
function checkCheaperSameVendorPlan(
  entry: ToolEntry,
  currentPlan: ReturnType<typeof getPlanInfo>,
  tool: (typeof TOOLS)[string],
  teamSize: number,
  useCase: UseCase
): Partial<ToolRecommendation> | null {
  if (!currentPlan || currentPlan.pricePerSeat === 0) return null;

  // Find cheaper plans from the same vendor that could work
  const cheaperPlans = tool.plans.filter(
    (p) => p.pricePerSeat > 0 &&
           p.pricePerSeat < currentPlan.pricePerSeat &&
           (!p.minSeats || entry.seats >= p.minSeats)
  );

  for (const plan of cheaperPlans.sort((a, b) => b.pricePerSeat - a.pricePerSeat)) {
    const newCost = estimatePlanCost(entry.toolId, plan.id, entry.seats);
    const savings = entry.monthlySpend - newCost;
    if (savings > 0) {
      // Check if the downgrade makes sense for the use case
      const isPowerPlan = currentPlan.name.toLowerCase().includes('ultra') ||
                          currentPlan.name.toLowerCase().includes('max') ||
                          currentPlan.name.toLowerCase().includes('pro+');
      
      if (isPowerPlan && useCase !== 'coding') {
        return {
          action: 'downgrade',
          recommendedPlan: plan.name,
          monthlySavings: savings,
          reason: `You're on ${currentPlan.name} (${formatCurrency(currentPlan.pricePerSeat)}/user) which is designed for heavy all-day coding use with maximum model access. For ${useCase} workflows, ${plan.name} at ${formatCurrency(plan.pricePerSeat)}/user provides sufficient capability at ${formatCurrency(savings)}/mo less.`,
          confidence: 'high' as Confidence,
        };
      }

      // Generic downgrade recommendation
      if (savings >= entry.monthlySpend * 0.2) {
        return {
          action: 'downgrade',
          recommendedPlan: plan.name,
          monthlySavings: savings,
          reason: `${plan.name} at ${formatCurrency(plan.pricePerSeat)}/user covers core ${useCase} needs. The additional capacity in ${currentPlan.name} (${formatCurrency(currentPlan.pricePerSeat)}/user) is a ${Math.round((1 - plan.pricePerSeat / currentPlan.pricePerSeat) * 100)}% premium — worth evaluating if your team consistently hits ${plan.name} limits.`,
          confidence: 'medium' as Confidence,
        };
      }
    }
  }

  return null;
}

// ---- CHECK 4: Cheaper cross-vendor alternative ----
function checkCheaperAlternative(
  entry: ToolEntry,
  useCase: UseCase,
  teamSize: number
): Partial<ToolRecommendation> | null {
  const tool = TOOLS[entry.toolId];
  if (!tool || entry.monthlySpend === 0) return null;

  // IDE alternatives: compare Cursor vs Copilot vs Windsurf
  if (tool.category === 'ide') {
    const alternatives: { toolId: string; planId: string; name: string }[] = [];
    
    if (entry.toolId !== 'windsurf') {
      alternatives.push({ toolId: 'windsurf', planId: 'windsurf_pro', name: 'Windsurf Pro' });
    }
    if (entry.toolId !== 'github_copilot') {
      alternatives.push({ toolId: 'github_copilot', planId: 'copilot_pro', name: 'GitHub Copilot Pro' });
    }
    if (entry.toolId !== 'cursor') {
      alternatives.push({ toolId: 'cursor', planId: 'cursor_pro', name: 'Cursor Pro' });
    }

    for (const alt of alternatives) {
      const altCost = estimatePlanCost(alt.toolId, alt.planId, entry.seats);
      const savings = entry.monthlySpend - altCost;
      if (savings >= entry.monthlySpend * 0.25) {
        return {
          action: 'switch',
          recommendedTool: alt.name,
          monthlySavings: savings,
          reason: `${alt.name} at ${formatCurrency(altCost)}/mo provides comparable AI-assisted ${useCase} capabilities (completions, chat, agent mode) at ${Math.round((savings / entry.monthlySpend) * 100)}% less than your current ${tool.name} spend. Migration effort is typically low — settings and keybindings transfer within an hour.`,
          confidence: 'medium' as Confidence,
        };
      }
    }
  }

  return null;
}

// ---- CHECK 5: Credex credits opportunity ----
function checkCredexCredits(entry: ToolEntry): Partial<ToolRecommendation> | null {
  // Credex offers discounted credits — typically 15-30% off retail
  // Only flag for significant spend (>$100/mo) where credits make sense
  if (entry.monthlySpend < 100) return null;
  
  const tool = TOOLS[entry.toolId];
  if (!tool) return null;
  
  // API spend is the best candidate for Credex credits
  if (tool.category === 'api') {
    const estimatedSavings = Math.round(entry.monthlySpend * 0.2);
    return {
      action: 'credits',
      monthlySavings: estimatedSavings,
      reason: `At ${formatCurrency(entry.monthlySpend)}/mo in ${tool.name} costs, you qualify for Credex discounted infrastructure credits. Companies sourcing through Credex typically save 15-30% on API spend — an estimated ${formatCurrency(estimatedSavings)}/mo for your usage level.`,
      confidence: 'medium' as Confidence,
    };
  }

  // Subscription tools with high spend
  if (entry.monthlySpend >= 200) {
    const estimatedSavings = Math.round(entry.monthlySpend * 0.15);
    return {
      action: 'credits',
      monthlySavings: estimatedSavings,
      reason: `Your ${formatCurrency(entry.monthlySpend)}/mo ${tool.name} spend may be eligible for Credex discounted credits sourced from companies that overforecast. Estimated savings: ${formatCurrency(estimatedSavings)}/mo (15% of current spend).`,
      confidence: 'low' as Confidence,
    };
  }

  return null;
}

// ---- Helpers ----
function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
