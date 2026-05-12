"use client";

import { AuditResult, AuditInput, ToolRecommendation } from "@/lib/types";

interface Props {
  results: AuditResult;
  input: AuditInput;
  onBack: () => void;
}

function confidenceBadge(c: ToolRecommendation["confidence"]) {
  const map = {
    high: { label: "High confidence", cls: "bg-green-900/50 text-green-300" },
    medium: { label: "Medium confidence", cls: "bg-yellow-900/50 text-yellow-300" },
    low: { label: "Low confidence", cls: "bg-zinc-800 text-zinc-400" },
  };
  const { label, cls } = map[c];
  return <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

function actionLabel(action: ToolRecommendation["action"]) {
  const map: Record<string, string> = {
    downgrade: "Downgrade plan",
    switch: "Switch tool",
    consolidate: "Consolidate",
    credits: "Use Credex credits",
    keep: "No change needed",
  };
  return map[action] ?? action;
}

function actionColor(action: ToolRecommendation["action"]) {
  if (action === "keep") return "border-green-800/50";
  if (action === "credits") return "border-indigo-800/50";
  return "border-yellow-800/50";
}

function fmt(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

export default function ResultsView({ results, input, onBack }: Props) {
  const isOptimal = results.totalMonthlySavings === 0;
  const isHighSavings = results.totalMonthlySavings > 500;

  return (
    <main className="flex-1 px-4 py-12 max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground mb-8 cursor-pointer"
        aria-label="Go back to edit your tools"
      >
        ← Edit tools
      </button>

      {/* Savings Hero */}
      <section className="text-center mb-12" aria-label="Total savings summary">
        {isOptimal ? (
          <>
            <div className="text-5xl font-bold text-success mb-2">✓ Optimized</div>
            <p className="text-lg text-muted-foreground">
              Your AI stack is already well-optimized. No significant savings found.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">
              Potential savings identified
            </p>
            <div className="text-5xl sm:text-6xl font-bold gradient-text savings-glow mb-1">
              {fmt(results.totalMonthlySavings)}/mo
            </div>
            <div className="text-2xl text-muted-foreground">
              {fmt(results.totalAnnualSavings)}/year
            </div>
            <p className="text-sm text-muted mt-2">
              Current spend: {fmt(results.totalCurrentSpend)}/mo across {input.tools.length} tool
              {input.tools.length !== 1 ? "s" : ""}
            </p>
          </>
        )}
      </section>

      {/* Per-tool breakdown */}
      <section aria-label="Per-tool recommendations">
        <h2 className="text-xl font-semibold mb-4">Per-Tool Breakdown</h2>
        <div className="space-y-4">
          {results.recommendations.map((rec, i) => (
            <div
              key={`${rec.toolId}-${i}`}
              className={`card-glass p-5 border-l-4 ${actionColor(rec.action)}`}
              role="article"
              aria-label={`Recommendation for ${rec.toolName}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{rec.toolName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {rec.currentPlan} · {fmt(rec.currentMonthlySpend)}/mo
                  </p>
                </div>
                <div className="text-right">
                  {rec.monthlySavings > 0 ? (
                    <span className="text-success font-bold text-lg">
                      −{fmt(rec.monthlySavings)}/mo
                    </span>
                  ) : (
                    <span className="text-success text-sm">✓ Optimal</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-card-border text-muted-foreground">
                  {actionLabel(rec.action)}
                </span>
                {confidenceBadge(rec.confidence)}
                {rec.recommendedPlan && (
                  <span className="text-xs text-accent">→ {rec.recommendedPlan}</span>
                )}
                {rec.recommendedTool && (
                  <span className="text-xs text-accent">→ {rec.recommendedTool}</span>
                )}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{rec.reason}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Credex CTA */}
      <section className="mt-10" aria-label="Credex offer">
        {isHighSavings ? (
          <div className="card-glass p-6 border border-accent/30 text-center">
            <h3 className="text-lg font-semibold mb-2">
              Save even more with Credex
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Your audit identified {fmt(results.totalMonthlySavings)}/mo in
              potential savings. Credex sources discounted AI infrastructure
              credits from companies that overforecast — the discount is real and
              substantial.
            </p>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-colors"
              id="credex-consultation-cta"
            >
              Book a Credex Consultation →
            </a>
          </div>
        ) : isOptimal ? (
          <div className="card-glass p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">You&apos;re spending well</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get notified when new optimization opportunities apply to your stack.
            </p>
            <div className="flex max-w-sm mx-auto gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-background border border-card-border rounded-lg px-3 py-2 text-sm"
                aria-label="Email for optimization notifications"
                id="notify-email-input"
              />
              <button
                className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-light transition-colors cursor-pointer"
                id="notify-submit-button"
              >
                Notify me
              </button>
            </div>
          </div>
        ) : (
          <div className="card-glass p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Want to explore deeper savings?{" "}
              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Talk to Credex
              </a>{" "}
              about discounted AI infrastructure credits.
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border mt-12 py-6 text-center text-sm text-muted">
        <p>
          StackAudit — a free tool by{" "}
          <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-light underline">
            Credex
          </a>
        </p>
      </footer>
    </main>
  );
}
