// StackAudit — Core type definitions

export type ToolId =
  | 'cursor'
  | 'github_copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic_api'
  | 'openai_api'
  | 'gemini'
  | 'windsurf';

export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

export type Confidence = 'high' | 'medium' | 'low';

export type RecommendationAction =
  | 'downgrade'
  | 'switch'
  | 'keep'
  | 'consolidate'
  | 'credits';

// ---- Tool metadata ----

export interface PlanInfo {
  id: string;
  name: string;
  pricePerSeat: number; // $/user/month — 0 for free plans
  minSeats?: number;
  isPerSeat: boolean; // true = price × seats, false = flat price
  features: string[];
}

export interface ToolInfo {
  id: ToolId;
  name: string;
  vendor: string;
  category: 'ide' | 'chat' | 'api';
  plans: PlanInfo[];
  pricingUrl: string;
  verifiedDate: string; // ISO date string
}

// ---- User input ----

export interface ToolEntry {
  toolId: ToolId;
  planId: string;
  seats: number;
  monthlySpend: number; // what the user actually pays
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

// ---- Audit results ----

export interface ToolRecommendation {
  toolId: ToolId;
  toolName: string;
  currentPlan: string;
  currentMonthlySpend: number;
  action: RecommendationAction;
  recommendedPlan?: string;
  recommendedTool?: string;
  monthlySavings: number;
  reason: string;
  confidence: Confidence;
}

export interface AuditResult {
  recommendations: ToolRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  totalCurrentSpend: number;
  credexTier: 'high' | 'medium' | 'low' | 'optimal';
  summary?: string; // AI-generated summary
}

// ---- Database models ----

export interface AuditRecord {
  id?: string;
  slug: string;
  tools_data: ToolEntry[];
  results_data: AuditResult;
  team_size: number;
  use_case: UseCase;
  total_monthly_savings: number;
  total_annual_savings: number;
  summary?: string;
  created_at?: string;
}

export interface LeadRecord {
  id?: string;
  audit_id?: string;
  email: string;
  company_name?: string;
  role?: string;
  team_size?: number;
  high_savings: boolean;
  created_at?: string;
}
