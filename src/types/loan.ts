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
  createdAt: Date;
}

export interface CreditAnalysis {
  ficoScore: number;
  creditHistory: string;
  paymentHistory: string;
  creditUtilization: number;
  recommendation: string;
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
