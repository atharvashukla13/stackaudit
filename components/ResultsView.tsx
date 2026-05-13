"use client";

import { useState, useEffect, useCallback } from "react";
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

  // AI Summary state
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Share state
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Lead capture state
  const [email, setEmail] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  // Honeypot
  const [honeypot, setHoneypot] = useState("");

  // Fetch AI summary on mount
  useEffect(() => {
    setSummaryLoading(true);
    fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        results,
        teamSize: input.teamSize,
        useCase: input.useCase,
      }),
    })
      .then((res) => res.json())
      .then((data) => setSummary(data.summary ?? null))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, [results, input.teamSize, input.useCase]);

  // Save audit async for share
  const handleShare = useCallback(async () => {
    if (shareSlug) {
      // Already saved — just copy
      await copyShareUrl(shareSlug);
      return;
    }

    setShareLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tools_data: input.tools,
          results_data: { ...results, summary },
          team_size: input.teamSize,
          use_case: input.useCase,
        }),
      });
      const data = await res.json();
      if (data.slug) {
        setShareSlug(data.slug);
        await copyShareUrl(data.slug);
      }
    } catch {
      console.error("Failed to save audit for sharing");
    } finally {
      setShareLoading(false);
    }
  }, [shareSlug, input, results, summary]);

  const copyShareUrl = async (slug: string) => {
    const url = `${window.location.origin}/audit/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      prompt("Copy this link:", url);
    }
  };

  // Lead capture submit
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || leadSubmitted) return;
    setLeadLoading(true);
    setLeadError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          audit_slug: shareSlug,
          high_savings: isHighSavings,
          website: honeypot, // honeypot field
        }),
      });
      const data = await res.json();
      if (data.success || data.saved !== undefined) {
        setLeadSubmitted(true);
      } else {
        setLeadError(data.error ?? "Something went wrong");
      }
    } catch {
      setLeadError("Network error. Please try again.");
    } finally {
      setLeadLoading(false);
    }
  };

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
      <section className="text-center mb-10" aria-label="Total savings summary">
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

      {/* AI Summary */}
      <section className="mb-8" aria-label="AI-generated summary">
        {summaryLoading ? (
          <div className="card-glass p-5 animate-pulse">
            <div className="h-4 bg-card-border rounded w-3/4 mb-2" />
            <div className="h-4 bg-card-border rounded w-full mb-2" />
            <div className="h-4 bg-card-border rounded w-5/6" />
          </div>
        ) : summary ? (
          <div className="card-glass p-5">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Summary
            </h2>
            <p className="text-foreground leading-relaxed">{summary}</p>
          </div>
        ) : null}
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
              <div className="flex items-center gap-2 mb-2 flex-wrap">
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

      {/* Share button */}
      <section className="mt-8 flex justify-center" aria-label="Share audit">
        <button
          onClick={handleShare}
          disabled={shareLoading}
          className="px-6 py-3 card-glass text-accent hover:text-accent-light font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          id="share-button"
        >
          {copied ? "✓ Link copied!" : shareLoading ? "Saving..." : "🔗 Share this audit"}
        </button>
      </section>

      {/* Lead capture — shown AFTER value */}
      <section className="mt-8" aria-label="Get your report">
        {!leadSubmitted ? (
          <div className="card-glass p-6">
            <h3 className="text-lg font-semibold mb-2 text-center">
              {isHighSavings
                ? "Get a detailed savings report"
                : "Save your audit results"}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              We&apos;ll email you a copy and notify you about new optimization opportunities.
            </p>
            <form onSubmit={handleLeadSubmit} className="max-w-md mx-auto space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-foreground"
                aria-label="Email address"
                id="lead-email-input"
              />
              {/* Honeypot — hidden from real users */}
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="absolute opacity-0 h-0 w-0 pointer-events-none"
                aria-hidden="true"
              />
              {leadError && (
                <p className="text-red-400 text-sm">{leadError}</p>
              )}
              <button
                type="submit"
                disabled={leadLoading || !email}
                className="w-full py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                id="lead-submit-button"
              >
                {leadLoading ? "Sending..." : "Send me the report →"}
              </button>
            </form>
          </div>
        ) : (
          <div className="card-glass p-6 text-center">
            <div className="text-2xl mb-2">✓</div>
            <p className="text-foreground font-medium">Check your inbox!</p>
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent your audit results and will notify you about new savings.
            </p>
          </div>
        )}
      </section>

      {/* Credex CTA */}
      <section className="mt-8" aria-label="Credex offer">
        {isHighSavings ? (
          <div className="card-glass p-6 border border-accent/30 text-center">
            <h3 className="text-lg font-semibold mb-2">Save even more with Credex</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Your audit identified {fmt(results.totalMonthlySavings)}/mo in potential savings.
              Credex sources discounted AI infrastructure credits from companies that overforecast.
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
            <p className="text-sm text-muted-foreground">
              Your stack is optimized.{" "}
              <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                Learn more about Credex
              </a>{" "}
              for future optimization opportunities.
            </p>
          </div>
        ) : (
          <div className="card-glass p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Want deeper savings?{" "}
              <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
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
