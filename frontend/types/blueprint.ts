// Shared TypeScript types for the blueprint data structures

export interface Intent {
  sector: string;
  sub_sector: string;
  business_type: string;
  target_market: string;
  stage: string;
  geography: string;
  problem_statement: string;
  unique_value_proposition: string;
  revenue_model: string;
  team_assumption: string;
}

export interface BMC {
  customer_segments: string;
  value_propositions: string;
  channels: string;
  customer_relationships: string;
  revenue_streams: string;
  key_resources: string;
  key_activities: string;
  key_partnerships: string;
  cost_structure: string;
}

export interface BudgetLineItem {
  item: string;
  min: number;
  max: number;
  notes: string;
}

export interface Budget {
  currency: string;
  disclaimer: string;
  one_time_costs: BudgetLineItem[];
  monthly_recurring: BudgetLineItem[];
  total_setup_min: number;
  total_setup_max: number;
  monthly_burn_min: number;
  monthly_burn_max: number;
  runway_recommendation: string;
  funding_needed_min: number;
  funding_needed_max: number;
}

export interface GTMPhase {
  phase: string;
  duration: string;
  goal: string;
  channels: string[];
  tactics: string[];
  success_criteria: string;
}

export interface GTM {
  target_beachhead: string;
  positioning_statement: string;
  key_metrics: string[];
  phases: GTMPhase[];
  cac_estimate: string;
  ltv_estimate: string;
}

export interface Competitor {
  name: string;
  sector: string;
  description: string;
  business_model: string;
  strengths: string[];
  weaknesses: string[];
  positioning_gap: string;
  source: string;
}

export interface GovernmentScheme {
  name: string;
  provider: string;
  description: string;
  eligibility: string[];
  funding_amount: string;
  stage: string[];
  source: string;
  last_updated: string;
}

export interface Investor {
  name: string;
  type: string;
  focus_sectors: string[];
  stages: string[];
  ticket_size: string;
  description: string;
  portfolio_examples: string[];
  application: string;
}

export interface LegalStep {
  step: string;
  authority: string;
  timeline: string;
  cost_approx: string;
  priority: string;
}

export interface ComplianceItem {
  item: string;
  frequency: string;
  authority: string;
  notes: string;
}

export interface Legal {
  recommended_structure: string;
  reason: string;
  registration_steps: LegalStep[];
  compliance_checklist: ComplianceItem[];
  ip_recommendations: string[];
  key_risks: string[];
}

export interface Source {
  name: string;
  url: string;
  type: string;
}

export interface Blueprint {
  idea: string;
  intent: Intent;
  business_model_canvas: BMC;
  budget_estimate: Budget;
  gtm_strategy: GTM;
  legal_compliance: Legal;
  competitors: Competitor[];
  government_schemes: GovernmentScheme[];
  investors: Investor[];
  sources: Source[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
