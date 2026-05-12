import { ToolInfo } from './types';

export const TOOLS: Record<string, ToolInfo> = {
  cursor: {
    id: 'cursor', name: 'Cursor', vendor: 'Anysphere', category: 'ide',
    pricingUrl: 'https://cursor.sh/pricing', verifiedDate: '2026-05-12',
    plans: [
      { id: 'cursor_hobby', name: 'Hobby', pricePerSeat: 0, isPerSeat: false, features: ['Limited Agent', 'Limited Tab'] },
      { id: 'cursor_pro', name: 'Pro', pricePerSeat: 20, isPerSeat: true, features: ['Extended Agent', 'Frontier models', 'Cloud agents'] },
      { id: 'cursor_pro_plus', name: 'Pro+', pricePerSeat: 60, isPerSeat: true, features: ['3x usage on all models'] },
      { id: 'cursor_ultra', name: 'Ultra', pricePerSeat: 200, isPerSeat: true, features: ['20x usage', 'Priority features'] },
      { id: 'cursor_teams', name: 'Teams', pricePerSeat: 40, isPerSeat: true, features: ['SSO', 'Analytics', 'Team billing'] },
      { id: 'cursor_enterprise', name: 'Enterprise', pricePerSeat: 0, isPerSeat: true, features: ['Pooled usage', 'SCIM', 'Audit logs'] },
    ],
  },
  github_copilot: {
    id: 'github_copilot', name: 'GitHub Copilot', vendor: 'GitHub / Microsoft', category: 'ide',
    pricingUrl: 'https://github.com/features/copilot/plans', verifiedDate: '2026-05-12',
    plans: [
      { id: 'copilot_free', name: 'Free', pricePerSeat: 0, isPerSeat: false, features: ['50 chats/mo', '2000 completions/mo'] },
      { id: 'copilot_pro', name: 'Pro', pricePerSeat: 10, isPerSeat: true, features: ['300 premium requests', 'Agent mode'] },
      { id: 'copilot_pro_plus', name: 'Pro+', pricePerSeat: 39, isPerSeat: true, features: ['5x premium requests', 'All models'] },
      { id: 'copilot_business', name: 'Business', pricePerSeat: 19, isPerSeat: true, features: ['IP indemnity', 'Admin/SSO'] },
      { id: 'copilot_enterprise', name: 'Enterprise', pricePerSeat: 39, isPerSeat: true, features: ['Codebase indexing', 'Fine-tuned models'] },
    ],
  },
  claude: {
    id: 'claude', name: 'Claude', vendor: 'Anthropic', category: 'chat',
    pricingUrl: 'https://www.anthropic.com/pricing', verifiedDate: '2026-05-12',
    plans: [
      { id: 'claude_free', name: 'Free', pricePerSeat: 0, isPerSeat: false, features: ['Chat on web/mobile', 'Web search'] },
      { id: 'claude_pro', name: 'Pro', pricePerSeat: 20, isPerSeat: true, features: ['5x usage', 'Claude Code', 'Projects'] },
      { id: 'claude_max_5x', name: 'Max (5x)', pricePerSeat: 100, isPerSeat: true, features: ['5x Pro usage', 'Higher limits'] },
      { id: 'claude_max_20x', name: 'Max (20x)', pricePerSeat: 200, isPerSeat: true, features: ['20x Pro usage', 'Priority'] },
      { id: 'claude_team', name: 'Team', pricePerSeat: 25, isPerSeat: true, minSeats: 5, features: ['SSO', 'Admin controls'] },
      { id: 'claude_enterprise', name: 'Enterprise', pricePerSeat: 0, isPerSeat: true, features: ['SCIM', 'Audit logs', 'HIPAA-ready'] },
    ],
  },
  chatgpt: {
    id: 'chatgpt', name: 'ChatGPT', vendor: 'OpenAI', category: 'chat',
    pricingUrl: 'https://openai.com/chatgpt/pricing/', verifiedDate: '2026-05-12',
    plans: [
      { id: 'chatgpt_free', name: 'Free', pricePerSeat: 0, isPerSeat: false, features: ['Basic chat'] },
      { id: 'chatgpt_plus', name: 'Plus', pricePerSeat: 20, isPerSeat: true, features: ['GPT-5.5', 'Deep Research'] },
      { id: 'chatgpt_pro', name: 'Pro', pricePerSeat: 200, isPerSeat: true, features: ['20x usage', 'o1 Pro mode'] },
      { id: 'chatgpt_team', name: 'Team', pricePerSeat: 25, minSeats: 2, isPerSeat: true, features: ['Team workspaces', 'Admin/SSO'] },
      { id: 'chatgpt_enterprise', name: 'Enterprise', pricePerSeat: 0, isPerSeat: true, features: ['Enterprise security'] },
    ],
  },
  anthropic_api: {
    id: 'anthropic_api', name: 'Anthropic API', vendor: 'Anthropic', category: 'api',
    pricingUrl: 'https://www.anthropic.com/pricing#api', verifiedDate: '2026-05-12',
    plans: [
      { id: 'anthropic_api_payg', name: 'Pay-as-you-go', pricePerSeat: 0, isPerSeat: false, features: ['Haiku: $1/$5/1M', 'Sonnet: $3/$15/1M', 'Opus: $5/$25/1M'] },
    ],
  },
  openai_api: {
    id: 'openai_api', name: 'OpenAI API', vendor: 'OpenAI', category: 'api',
    pricingUrl: 'https://openai.com/api/pricing/', verifiedDate: '2026-05-12',
    plans: [
      { id: 'openai_api_payg', name: 'Pay-as-you-go', pricePerSeat: 0, isPerSeat: false, features: ['GPT-4o mini: low cost', 'GPT-4.1: mid-range', 'Batch: 50% off'] },
    ],
  },
  gemini: {
    id: 'gemini', name: 'Gemini', vendor: 'Google', category: 'chat',
    pricingUrl: 'https://ai.google.dev/pricing', verifiedDate: '2026-05-12',
    plans: [
      { id: 'gemini_free', name: 'Free', pricePerSeat: 0, isPerSeat: false, features: ['Flash models', 'Daily limits'] },
      { id: 'gemini_pro', name: 'AI Pro', pricePerSeat: 19.99, isPerSeat: true, features: ['1M context', 'Code Assist', '5TB'] },
      { id: 'gemini_ultra', name: 'AI Ultra', pricePerSeat: 249.99, isPerSeat: true, features: ['Top priority', '30TB', 'YouTube Premium'] },
      { id: 'gemini_api', name: 'API', pricePerSeat: 0, isPerSeat: false, features: ['Flash: $0.50/$3/1M', 'Pro: $2/$12/1M'] },
    ],
  },
  windsurf: {
    id: 'windsurf', name: 'Windsurf', vendor: 'Codeium', category: 'ide',
    pricingUrl: 'https://windsurf.com/pricing', verifiedDate: '2026-05-12',
    plans: [
      { id: 'windsurf_free', name: 'Free', pricePerSeat: 0, isPerSeat: false, features: ['25 credits/mo', 'Autocomplete'] },
      { id: 'windsurf_pro', name: 'Pro', pricePerSeat: 15, isPerSeat: true, features: ['500 credits/mo', 'Premium models'] },
      { id: 'windsurf_teams', name: 'Teams', pricePerSeat: 30, isPerSeat: true, features: ['Admin dashboard', 'Team billing'] },
      { id: 'windsurf_enterprise', name: 'Enterprise', pricePerSeat: 0, isPerSeat: true, features: ['1000+ credits', 'SSO/RBAC'] },
    ],
  },
};

export function getToolInfo(toolId: string): ToolInfo | undefined {
  return TOOLS[toolId];
}

export function getPlanInfo(toolId: string, planId: string) {
  return TOOLS[toolId]?.plans.find((p) => p.id === planId);
}

export function getAllToolIds(): string[] {
  return Object.keys(TOOLS);
}

export function estimatePlanCost(toolId: string, planId: string, seats: number): number {
  const plan = getPlanInfo(toolId, planId);
  if (!plan) return 0;
  return plan.isPerSeat ? plan.pricePerSeat * seats : plan.pricePerSeat;
}
