import { AuditResult, ToolEntry, UseCase } from '@/lib/types';

interface Props {
  results: AuditResult;
  toolsData: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
  summary: string | null;
  createdAt: string;
}

function fmt(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}

function actionLabel(action: string) {
  const map: Record<string, string> = {
    downgrade: 'Downgrade plan',
    switch: 'Switch tool',
    consolidate: 'Consolidate',
    credits: 'Use Credex credits',
    keep: 'No change needed',
  };
  return map[action] ?? action;
}

function confidenceColor(c: string) {
  if (c === 'high') return 'bg-green-900/50 text-green-300';
  if (c === 'medium') return 'bg-yellow-900/50 text-yellow-300';
  return 'bg-zinc-800 text-zinc-400';
}

export default function SharedAuditView({ results, teamSize, useCase, summary, createdAt }: Props) {
  const isOptimal = results.totalMonthlySavings === 0;

  return (
    <main className="flex-1 px-4 py-12 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-2">
        <a href="/" className="text-accent hover:text-accent-light text-sm font-medium">
          StackAudit
        </a>
      </div>

      {/* Savings Hero */}
      <section className="text-center mb-10" aria-label="Savings summary">
        {isOptimal ? (
          <>
            <div className="text-4xl font-bold text-success mb-2">✓ Optimized</div>
            <p className="text-muted-foreground">This team&apos;s AI stack is already well-optimized.</p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">
              Potential savings found
            </p>
            <div className="text-5xl font-bold gradient-text mb-1">
              {fmt(results.totalMonthlySavings)}/mo
            </div>
            <div className="text-xl text-muted-foreground">
              {fmt(results.totalAnnualSavings)}/year
            </div>
          </>
        )}
        <p className="text-xs text-muted mt-3">
          {teamSize}-person team · {useCase} · audited {new Date(createdAt).toLocaleDateString()}
        </p>
      </section>

      {/* AI Summary */}
      {summary && (
        <section className="card-glass p-5 mb-8" aria-label="AI summary">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            Summary
          </h2>
          <p className="text-foreground leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Per-tool breakdown */}
      <section aria-label="Recommendations">
        <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
        <div className="space-y-3">
          {results.recommendations.map((rec, i) => (
            <div key={i} className="card-glass p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{rec.toolName}</h3>
                  <p className="text-sm text-muted-foreground">{rec.currentPlan} · {fmt(rec.currentMonthlySpend)}/mo</p>
                </div>
                {rec.monthlySavings > 0 ? (
                  <span className="text-success font-bold">−{fmt(rec.monthlySavings)}/mo</span>
                ) : (
                  <span className="text-success text-sm">✓ Optimal</span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-card-border text-muted-foreground">
                  {actionLabel(rec.action)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${confidenceColor(rec.confidence)}`}>
                  {rec.confidence} confidence
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{rec.reason}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-10 text-center" aria-label="Call to action">
        <div className="card-glass p-6">
          <h3 className="text-lg font-semibold mb-2">Run your own audit</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Free · No login required · Results in 60 seconds
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl transition-colors"
          >
            Audit My AI Spend →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border mt-12 py-6 text-center text-sm text-muted">
        <p>
          StackAudit — a free tool by{' '}
          <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-light underline">
            Credex
          </a>
        </p>
      </footer>
    </main>
  );
}
