import { 
  LoanApplication, 
  CreditAnalysis, 
  RiskAnalysis, 
  ComplianceCheck, 
  PricingAnalysis, 
  CommitteeDecision,
  RiskStrategy,
} from '@/types/loan';
import { supabase } from '@/integrations/supabase/client';
import {
  calculateFICOComponents,
  calculatePreliminaryFICO,
  generateWhatIfScenarios,
  getComponentAnalysisSummary,
} from './ficoCalculations';

interface AnalysisResponse<T> {
  analysis: T;
  agentType: string;
}

async function callCreditAnalysisAgent<T>(
  agentType: string,
  application: LoanApplication,
  strategy: RiskStrategy,
  previousAnalyses?: Record<string, unknown>,
  preCalculatedData?: Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<AnalysisResponse<T>>('credit-analysis', {
    body: {
      agentType,
      application,
      strategy,
      previousAnalyses,
      preCalculatedData,
    },
  });

  if (error) {
    console.error(`${agentType} agent error:`, error);
    throw new Error(`${agentType} analysis failed: ${error.message}`);
  }

  if (!data?.analysis) {
    throw new Error(`No analysis returned from ${agentType} agent`);
  }

  return data.analysis;
}

// FICO Scoring Tool - Real AI with Pre-Calculations
export async function calculateFICOScore(
  application: LoanApplication,
  strategy: RiskStrategy
): Promise<CreditAnalysis> {
  // Phase 1: Pre-calculate all FICO components
  const ficoComponents = calculateFICOComponents(application);
  
  // Phase 2: Calculate preliminary FICO
  const preliminaryFICO = calculatePreliminaryFICO(ficoComponents);
  
  // Phase 3: Generate what-if scenarios
  const whatIfScenarios = generateWhatIfScenarios(application, preliminaryFICO);
  
  // Phase 4: Get component analysis summary
  const componentAnalysis = getComponentAnalysisSummary(ficoComponents);
  
  // Phase 5: Send to AI for validation and qualitative assessment
  const preCalculatedData = {
    ficoComponents,
    preliminaryFICO,
    whatIfScenarios,
    componentAnalysis,
  };
  
  return callCreditAnalysisAgent<CreditAnalysis>('credit', application, strategy, undefined, preCalculatedData);
}

// PD/LGD Modeling Tool - Real AI
export async function calculateRiskMetrics(
  application: LoanApplication, 
  creditAnalysis: CreditAnalysis,
  strategy: RiskStrategy
): Promise<RiskAnalysis> {
  return callCreditAnalysisAgent<RiskAnalysis>('risk', application, strategy, {
    creditAnalysis,
  });
}

// KYC Verification Tool - Real AI
export async function performKYCCheck(
  application: LoanApplication,
  strategy: RiskStrategy
): Promise<ComplianceCheck> {
  return callCreditAnalysisAgent<ComplianceCheck>('compliance', application, strategy);
}

// Risk-Adjusted Pricing Tool - Real AI
export async function calculatePricing(
  application: LoanApplication,
  riskAnalysis: RiskAnalysis,
  strategy: RiskStrategy
): Promise<PricingAnalysis> {
  return callCreditAnalysisAgent<PricingAnalysis>('pricing', application, strategy, {
    riskAnalysis,
  });
}

// Committee Decision Tool - Real AI
export async function makeCommitteeDecision(
  application: LoanApplication,
  creditAnalysis: CreditAnalysis,
  riskAnalysis: RiskAnalysis,
  complianceCheck: ComplianceCheck,
  pricingAnalysis: PricingAnalysis,
  strategy: RiskStrategy
): Promise<CommitteeDecision> {
  return callCreditAnalysisAgent<CommitteeDecision>('chair', application, strategy, {
    creditAnalysis,
    riskAnalysis,
    complianceCheck,
    pricingAnalysis,
  });
}
