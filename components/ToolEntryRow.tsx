"use client";

import { ToolEntry, ToolId } from "@/lib/types";
import { TOOLS } from "@/lib/pricingData";

interface Props {
  entry: ToolEntry;
  index: number;
  usedToolIds: Set<string>;
  onChange: (index: number, entry: ToolEntry) => void;
  onRemove: (index: number) => void;
}

export default function ToolEntryRow({ entry, index, usedToolIds, onChange, onRemove }: Props) {
  const tool = TOOLS[entry.toolId];
  const plans = tool?.plans ?? [];

  const handleToolChange = (newToolId: string) => {
    const newTool = TOOLS[newToolId];
    if (!newTool) return;
    const defaultPlan = newTool.plans.find((p) => p.pricePerSeat > 0) ?? newTool.plans[0];
    onChange(index, {
      toolId: newToolId as ToolId,
      planId: defaultPlan.id,
      seats: entry.seats,
      monthlySpend: defaultPlan.isPerSeat
        ? defaultPlan.pricePerSeat * entry.seats
        : defaultPlan.pricePerSeat,
    });
  };

  const handlePlanChange = (newPlanId: string) => {
    const plan = plans.find((p) => p.id === newPlanId);
    if (!plan) return;
    onChange(index, {
      ...entry,
      planId: newPlanId,
      monthlySpend: plan.isPerSeat ? plan.pricePerSeat * entry.seats : plan.pricePerSeat,
    });
  };

  const handleSeatsChange = (seats: number) => {
    const plan = plans.find((p) => p.id === entry.planId);
    const newSpend = plan?.isPerSeat ? plan.pricePerSeat * seats : plan?.pricePerSeat ?? 0;
    onChange(index, { ...entry, seats, monthlySpend: newSpend });
  };

  return (
    <div className="card-glass p-5" role="group" aria-label={`Tool entry ${index + 1}: ${tool?.name ?? entry.toolId}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Tool {index + 1}
        </span>
        <button
          onClick={() => onRemove(index)}
          className="text-muted hover:text-red-400 text-sm transition-colors cursor-pointer"
          aria-label={`Remove ${tool?.name ?? "tool"}`}
        >
          ✕ Remove
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Tool selector */}
        <div>
          <label htmlFor={`tool-${index}`} className="block text-sm text-muted-foreground mb-1">
            Tool
          </label>
          <select
            id={`tool-${index}`}
            value={entry.toolId}
            onChange={(e) => handleToolChange(e.target.value)}
            className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-foreground"
          >
            {Object.values(TOOLS).map((t) => (
              <option
                key={t.id}
                value={t.id}
                disabled={usedToolIds.has(t.id) && t.id !== entry.toolId}
              >
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Plan selector */}
        <div>
          <label htmlFor={`plan-${index}`} className="block text-sm text-muted-foreground mb-1">
            Plan
          </label>
          <select
            id={`plan-${index}`}
            value={entry.planId}
            onChange={(e) => handlePlanChange(e.target.value)}
            className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-foreground"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.pricePerSeat > 0
                  ? ` — $${p.pricePerSeat}${p.isPerSeat ? "/user" : ""}/mo`
                  : p.name === "Enterprise"
                  ? " — Custom"
                  : " — Free"}
              </option>
            ))}
          </select>
        </div>

        {/* Seats */}
        <div>
          <label htmlFor={`seats-${index}`} className="block text-sm text-muted-foreground mb-1">
            Number of seats
          </label>
          <input
            id={`seats-${index}`}
            type="number"
            min={1}
            max={10000}
            value={entry.seats}
            onChange={(e) => handleSeatsChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-foreground"
          />
        </div>

        {/* Monthly spend */}
        <div>
          <label htmlFor={`spend-${index}`} className="block text-sm text-muted-foreground mb-1">
            Monthly spend ($)
          </label>
          <input
            id={`spend-${index}`}
            type="number"
            min={0}
            step={1}
            value={entry.monthlySpend}
            onChange={(e) =>
              onChange(index, { ...entry, monthlySpend: Math.max(0, parseFloat(e.target.value) || 0) })
            }
            className="w-full bg-background border border-card-border rounded-lg px-3 py-2 text-foreground"
          />
        </div>
      </div>
    </div>
  );
}
