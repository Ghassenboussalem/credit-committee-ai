export type AgentStatus = 'idle' | 'processing' | 'complete' | 'error';

export type LoanDecision = 'pending' | 'approved' | 'rejected' | 'review';

export interface LoanApplication {
  id: string;
  applicantName: string;
  requestedAmount: number;
  purpose: string;
  annualIncome: number;
  employmentYears: number;
  existingDebt: number;
  industry: string;
  createdAt: Date;
}

// Industry risk coefficients (lower = safer)
export const INDUSTRY_RISK: Record<string, { coefficient: number; stability: string; layoffRisk: string }> = {
  'Technology': { coefficient: 1.1, stability: 'Volatile', layoffRisk: 'High' },
  'Healthcare': { coefficient: 0.85, stability: 'Very Stable', layoffRisk: 'Low' },
  'Government': { coefficient: 0.8, stability: 'Very Stable', layoffRisk: 'Very Low' },
  'Education': { coefficient: 0.85, stability: 'Stable', layoffRisk: 'Low' },
  'Finance': { coefficient: 0.95, stability: 'Moderate', layoffRisk: 'Moderate' },
  'Retail': { coefficient: 1.25, stability: 'Volatile', layoffRisk: 'High' },
  'Manufacturing': { coefficient: 1.1, stability: 'Cyclical', layoffRisk: 'Moderate' },
  'Construction': { coefficient: 1.2, stability: 'Cyclical', layoffRisk: 'High' },
  'Hospitality': { coefficient: 1.3, stability: 'Volatile', layoffRisk: 'Very High' },
  'Transportation': { coefficient: 1.05, stability: 'Moderate', layoffRisk: 'Moderate' },
  'Energy': { coefficient: 1.0, stability: 'Cyclical', layoffRisk: 'Moderate' },
  'Real Estate': { coefficient: 1.15, stability: 'Cyclical', layoffRisk: 'Moderate' },
  'Legal': { coefficient: 0.9, stability: 'Stable', layoffRisk: 'Low' },
  'Consulting': { coefficient: 1.0, stability: 'Moderate', layoffRisk: 'Moderate' },
  'Non-Profit': { coefficient: 0.95, stability: 'Stable', layoffRisk: 'Low' },
  'Other': { coefficient: 1.0, stability: 'Unknown', layoffRisk: 'Unknown' },
};

export interface IndustryAnalysis {
  industry: string;
  riskCoefficient: number;
  stability: string;
  layoffRisk: string;
  adjustedFICO: number;
  industryPercentile: number;
  benchmarkComparison: string;
}

export interface TrajectoryPrediction {
  months: number;
  projectedFICO: number;
  confidenceLow: number;
  confidenceHigh: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface CreditTrajectory {
  debtVelocity: number; // $/year
  incomeDebtRatio: number;
  trajectoryTrend: 'improving' | 'stable' | 'declining';
  predictions: TrajectoryPrediction[];
  riskAssessment: string;
}

export interface BehavioralRedFlag {
  flag: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  detected: boolean;
}

export interface BehavioralAnalysis {
  redFlags: BehavioralRedFlag[];
  psychologicalRiskScore: number;
  overallAssessment: string;
  flagCount: { low: number; medium: number; high: number };
}

export interface FICOComponent {
  score: number;
  weight: number;
  contribution: number;
  description: string;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface WhatIfScenario {
  change: string;
  newFICO: number;
  delta: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface FICOComponents {
  paymentHistory: FICOComponent;
  amountsOwed: FICOComponent;
  lengthOfHistory: FICOComponent;
  newCredit: FICOComponent;
  creditMix: FICOComponent;
}

export interface CreditAnalysis {
  ficoScore: number;
  ficoComponents: FICOComponents;
  preliminaryFICO: number;
  aiAdjustment: number;
  creditHistory: string;
  paymentHistory: string;
  creditUtilization: number;
  recommendation: string;
  whatIfScenarios: WhatIfScenario[];
  componentAnalysis: string;
  industryAnalysis?: IndustryAnalysis;
  creditTrajectory?: CreditTrajectory;
  behavioralAnalysis?: BehavioralAnalysis;
}

export interface RiskAnalysis {
  probabilityOfDefault: number;
  lossGivenDefault: number;
  expectedLoss: number;
  riskRating: 'low' | 'medium' | 'high' | 'very-high';
  recommendation: string;
}

export interface ComplianceCheck {
  kycVerified: boolean;
  amlCleared: boolean;
  sanctionsCleared: boolean;
  documentVerification: string;
  recommendation: string;
}

export interface PricingAnalysis {
  baseRate: number;
  riskPremium: number;
  finalRate: number;
  monthlyPayment: number;
  recommendation: string;
}

export interface CommitteeDecision {
  finalDecision: LoanDecision;
  approvedAmount: number | null;
  conditions: string[];
  summary: string;
}

export interface AgentState {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  color: string;
  icon: string;
  analysis?: CreditAnalysis | RiskAnalysis | ComplianceCheck | PricingAnalysis | CommitteeDecision;
}

export interface RiskStrategy {
  name: string;
  maxDTI: number;
  minFICO: number;
  maxPD: number;
  riskPremiumMultiplier: number;
}

export const RISK_STRATEGIES: Record<string, RiskStrategy> = {
  conservative: {
    name: 'Conservative',
    maxDTI: 35,
    minFICO: 720,
    maxPD: 0.03,
    riskPremiumMultiplier: 1.5,
  },
  moderate: {
    name: 'Moderate',
    maxDTI: 43,
    minFICO: 680,
    maxPD: 0.05,
    riskPremiumMultiplier: 1.2,
  },
  aggressive: {
    name: 'Aggressive',
    maxDTI: 50,
    minFICO: 620,
    maxPD: 0.08,
    riskPremiumMultiplier: 1.0,
  },
};
