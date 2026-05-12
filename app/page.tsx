"use client";

import { useState, useEffect, useCallback } from "react";
import { TOOLS } from "@/lib/pricingData";
import { runAudit } from "@/lib/auditEngine";
import { ToolEntry, UseCase, AuditResult } from "@/lib/types";
import ToolEntryRow from "@/components/ToolEntryRow";
import ResultsView from "@/components/ResultsView";

const STORAGE_KEY = "stackaudit_form";
const USE_CASES: { value: UseCase; label: string }[] = [
  { value: "coding", label: "Coding" },
  { value: "writing", label: "Writing" },
  { value: "data", label: "Data Analysis" },
  { value: "research", label: "Research" },
  { value: "mixed", label: "Mixed" },
];

interface FormState {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

const defaultForm: FormState = {
  tools: [],
  teamSize: 1,
  useCase: "coding",
};

export default function HomePage() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [results, setResults] = useState<AuditResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Load form state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FormState;
        setForm(parsed);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save form state to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // Ignore storage errors
    }
  }, [form]);

  const addTool = useCallback(() => {
    // Find first tool not already added
    const usedIds = new Set(form.tools.map((t) => t.toolId));
    const availableId = Object.keys(TOOLS).find((id) => !usedIds.has(id as ToolEntry["toolId"]));
    if (!availableId) return;

    const tool = TOOLS[availableId];
    const defaultPlan = tool.plans.find((p) => p.pricePerSeat > 0) ?? tool.plans[0];

    setForm((prev) => ({
      ...prev,
      tools: [
        ...prev.tools,
        {
          toolId: availableId as ToolEntry["toolId"],
          planId: defaultPlan.id,
          seats: prev.teamSize || 1,
          monthlySpend: defaultPlan.isPerSeat
            ? defaultPlan.pricePerSeat * (prev.teamSize || 1)
            : defaultPlan.pricePerSeat,
        },
      ],
    }));
  }, [form.tools, form.teamSize]);

  const updateTool = useCallback((index: number, entry: ToolEntry) => {
    setForm((prev) => ({
      ...prev,
      tools: prev.tools.map((t, i) => (i === index ? entry : t)),
    }));
  }, []);

  const removeTool = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAudit = useCallback(() => {
    if (form.tools.length === 0) return;
    const auditResult = runAudit({
      tools: form.tools,
      teamSize: form.teamSize,
      useCase: form.useCase,
    });
    setResults(auditResult);
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [form]);

  const handleBack = useCallback(() => {
    setShowResults(false);
    setResults(null);
  }, []);

  if (showResults && results) {
    return (
      <ResultsView
        results={results}
        input={{ tools: form.tools, teamSize: form.teamSize, useCase: form.useCase }}
        onBack={handleBack}
      />
    );
  }

  const usedToolIds = new Set(form.tools.map((t) => t.toolId));
  const canAddMore = usedToolIds.size < Object.keys(TOOLS).length;

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="px-4 pt-16 pb-10 text-center max-w-3xl mx-auto" aria-label="Hero">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Your AI tools are{" "}
          <span className="gradient-text">costing too much</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Free audit in 60 seconds. See exactly where your team overspends on
          Cursor, Copilot, Claude, ChatGPT and more — and how to fix it.
        </p>
      </section>

      {/* Form */}
      <section className="px-4 pb-20 max-w-3xl mx-auto" aria-label="Spend input form">
        {/* Team details */}
        <div className="card-glass p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Team Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="team-size" className="block text-sm text-muted-foreground mb-1">
                Team size
              </label>
              <input
                id="team-size"
                type="number"
                min={1}
                max={10000}
                value={form.teamSize}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, teamSize: Math.max(1, parseInt(e.target.value) || 1) }))
                }
                className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-foreground focus:border-accent"
                aria-label="Number of people on your team"
              />
            </div>
            <div>
              <label htmlFor="use-case" className="block text-sm text-muted-foreground mb-1">
                Primary use case
              </label>
              <select
                id="use-case"
                value={form.useCase}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, useCase: e.target.value as UseCase }))
                }
                className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-foreground focus:border-accent"
                aria-label="Primary AI use case"
              >
                {USE_CASES.map((uc) => (
                  <option key={uc.value} value={uc.value}>
                    {uc.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tool entries */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your AI Tools</h2>
            {form.tools.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {form.tools.length} tool{form.tools.length !== 1 ? "s" : ""} added
              </span>
            )}
          </div>

          {form.tools.length === 0 && (
            <div className="card-glass p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No tools added yet. Add the AI tools your team pays for.
              </p>
            </div>
          )}

          {form.tools.map((entry, index) => (
            <ToolEntryRow
              key={`${entry.toolId}-${index}`}
              entry={entry}
              index={index}
              usedToolIds={usedToolIds}
              onChange={updateTool}
              onRemove={removeTool}
            />
          ))}

          {canAddMore && (
            <button
              onClick={addTool}
              className="w-full card-glass p-4 text-accent hover:text-accent-light border-dashed border-2 border-card-border hover:border-accent transition-colors rounded-xl font-medium cursor-pointer"
              aria-label="Add an AI tool to audit"
            >
              + Add a tool
            </button>
          )}
        </div>

        {/* Audit button */}
        <button
          onClick={handleAudit}
          disabled={form.tools.length === 0}
          className="w-full py-4 px-6 bg-accent hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-lg cursor-pointer"
          aria-label="Run your AI spend audit"
          id="run-audit-button"
        >
          {form.tools.length === 0 ? "Add tools to get started" : "Run My AI Spend Audit →"}
        </button>

        {/* Social proof / trust */}
        <p className="text-center text-sm text-muted mt-4">
          Free · No login required · Results in seconds
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border py-6 px-4 text-center text-sm text-muted">
        <p>
          StackAudit — a free tool by{" "}
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-light underline"
          >
            Credex
          </a>
        </p>
      </footer>
    </main>
  );
}
