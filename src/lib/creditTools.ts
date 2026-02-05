import { 
  LoanApplication, 
  CreditAnalysis, 
  RiskAnalysis, 
  ComplianceCheck, 
  PricingAnalysis, 
  CommitteeDecision,
  RiskStrategy,
  LoanDecision
} from '@/types/loan';

// Simulated delay for realistic processing
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// FICO Scoring Tool
export async function calculateFICOScore(application: LoanApplication): Promise<CreditAnalysis> {
  await delay(1500);
  
  // Simulate FICO calculation based on application data
  const incomeToDebtRatio = application.existingDebt / application.annualIncome;
  const employmentFactor = Math.min(application.employmentYears * 10, 50);
  const debtFactor = Math.max(0, 100 - incomeToDebtRatio * 200);
  
  const baseScore = 550 + employmentFactor + debtFactor + Math.random() * 100;
  const ficoScore = Math.min(850, Math.max(300, Math.round(baseScore)));
  
  const creditUtilization = Math.round(incomeToDebtRatio * 100);
  
  let paymentHistory = 'Excellent';
  let creditHistory = 'Strong credit profile with consistent payments';
  let recommendation = 'Proceed with standard underwriting';
  
  if (ficoScore < 620) {
    paymentHistory = 'Poor';
    creditHistory = 'Multiple delinquencies detected';
    recommendation = 'High risk - consider declining or enhanced terms';
  } else if (ficoScore < 680) {
    paymentHistory = 'Fair';
    creditHistory = 'Some late payments in history';
    recommendation = 'Moderate risk - additional documentation recommended';
  } else if (ficoScore < 740) {
    paymentHistory = 'Good';
    creditHistory = 'Generally positive credit history';
    recommendation = 'Standard terms applicable';
  }
  
  return {
    ficoScore,
    creditHistory,
    paymentHistory,
    creditUtilization,
    recommendation,
  };
}

// PD/LGD Modeling Tool
export async function calculateRiskMetrics(
  application: LoanApplication, 
  creditAnalysis: CreditAnalysis,
  strategy: RiskStrategy
): Promise<RiskAnalysis> {
  await delay(1800);
  
  // Probability of Default calculation
  const ficoFactor = (850 - creditAnalysis.ficoScore) / 550;
  const dtiRatio = application.existingDebt / application.annualIncome;
  const ltvFactor = application.requestedAmount / (application.annualIncome * 3);
  
  const basePD = 0.01 + ficoFactor * 0.08 + dtiRatio * 0.05 + ltvFactor * 0.03;
  const probabilityOfDefault = Math.min(0.35, Math.max(0.005, basePD + (Math.random() - 0.5) * 0.02));
  
  // Loss Given Default (typically 40-60% for unsecured loans)
  const lossGivenDefault = 0.45 + (Math.random() * 0.15);
  
  // Expected Loss = PD × LGD × Exposure
  const expectedLoss = probabilityOfDefault * lossGivenDefault * application.requestedAmount;
  
  let riskRating: RiskAnalysis['riskRating'] = 'low';
  let recommendation = 'Risk within acceptable parameters';
  
  if (probabilityOfDefault > 0.15) {
    riskRating = 'very-high';
    recommendation = 'Exceeds risk tolerance - recommend decline';
  } else if (probabilityOfDefault > strategy.maxPD) {
    riskRating = 'high';
    recommendation = 'Above strategy threshold - enhanced pricing required';
  } else if (probabilityOfDefault > 0.03) {
    riskRating = 'medium';
    recommendation = 'Moderate risk - standard pricing with monitoring';
  }
  
  return {
    probabilityOfDefault: Math.round(probabilityOfDefault * 10000) / 100,
    lossGivenDefault: Math.round(lossGivenDefault * 100),
    expectedLoss: Math.round(expectedLoss),
    riskRating,
    recommendation,
  };
}

// KYC Verification Tool
export async function performKYCCheck(application: LoanApplication): Promise<ComplianceCheck> {
  await delay(2000);
  
  // Simulate KYC/AML checks
  const kycVerified = Math.random() > 0.1; // 90% pass rate
  const amlCleared = Math.random() > 0.05; // 95% pass rate
  const sanctionsCleared = Math.random() > 0.02; // 98% pass rate
  
  let documentVerification = 'All documents verified and authentic';
  let recommendation = 'Clear for processing';
  
  if (!kycVerified) {
    documentVerification = 'Identity verification failed - additional documentation required';
    recommendation = 'Hold pending identity verification';
  } else if (!amlCleared) {
    documentVerification = 'AML flag triggered - enhanced due diligence required';
    recommendation = 'Escalate to compliance team';
  } else if (!sanctionsCleared) {
    documentVerification = 'Sanctions screening match detected';
    recommendation = 'Immediate escalation required';
  }
  
  return {
    kycVerified,
    amlCleared,
    sanctionsCleared,
    documentVerification,
    recommendation,
  };
}

// Risk-Adjusted Pricing Tool
export async function calculatePricing(
  application: LoanApplication,
  riskAnalysis: RiskAnalysis,
  strategy: RiskStrategy
): Promise<PricingAnalysis> {
  await delay(1600);
  
  // Base rate (simulating current market rate)
  const baseRate = 5.5 + Math.random() * 0.5;
  
  // Risk premium based on PD and strategy
  const pdMultiplier = riskAnalysis.probabilityOfDefault / 5; // Convert % to multiplier
  const riskPremium = pdMultiplier * strategy.riskPremiumMultiplier * 100;
  
  const finalRate = Math.round((baseRate + riskPremium) * 100) / 100;
  
  // Calculate monthly payment (simplified)
  const monthlyRate = finalRate / 100 / 12;
  const numPayments = 60; // 5-year term
  const monthlyPayment = Math.round(
    (application.requestedAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
  
  let recommendation = 'Pricing reflects risk profile';
  if (finalRate > 15) {
    recommendation = 'Rate exceeds typical market tolerance - consider decline';
  } else if (finalRate > 10) {
    recommendation = 'Elevated rate - ensure borrower capacity';
  }
  
  return {
    baseRate: Math.round(baseRate * 100) / 100,
    riskPremium: Math.round(riskPremium * 100) / 100,
    finalRate,
    monthlyPayment,
    recommendation,
  };
}

// Committee Decision Tool
export async function makeCommitteeDecision(
  application: LoanApplication,
  creditAnalysis: CreditAnalysis,
  riskAnalysis: RiskAnalysis,
  complianceCheck: ComplianceCheck,
  pricingAnalysis: PricingAnalysis,
  strategy: RiskStrategy
): Promise<CommitteeDecision> {
  await delay(2200);
  
  const conditions: string[] = [];
  let finalDecision: LoanDecision = 'approved';
  let approvedAmount: number | null = application.requestedAmount;
  
  // Check compliance blockers
  if (!complianceCheck.kycVerified || !complianceCheck.amlCleared || !complianceCheck.sanctionsCleared) {
    finalDecision = 'rejected';
    approvedAmount = null;
    return {
      finalDecision,
      approvedAmount,
      conditions: ['Compliance requirements not met'],
      summary: 'Application rejected due to compliance concerns. ' + complianceCheck.recommendation,
    };
  }
  
  // Check FICO against strategy
  if (creditAnalysis.ficoScore < strategy.minFICO) {
    if (creditAnalysis.ficoScore < strategy.minFICO - 50) {
      finalDecision = 'rejected';
      approvedAmount = null;
    } else {
      finalDecision = 'review';
      conditions.push('Manual review required due to credit score');
    }
  }
  
  // Check risk rating
  if (riskAnalysis.riskRating === 'very-high') {
    finalDecision = 'rejected';
    approvedAmount = null;
  } else if (riskAnalysis.riskRating === 'high') {
    if (finalDecision !== 'rejected') {
      approvedAmount = Math.round(application.requestedAmount * 0.7);
      conditions.push('Reduced loan amount due to risk profile');
    }
  }
  
  // Check pricing viability
  if (pricingAnalysis.finalRate > 18) {
    finalDecision = 'rejected';
    approvedAmount = null;
  }
  
  // Build conditions for approval
  if (finalDecision === 'approved') {
    if (pricingAnalysis.finalRate > 10) {
      conditions.push('Rate lock required within 30 days');
    }
    if (creditAnalysis.creditUtilization > 50) {
      conditions.push('Debt consolidation recommended');
    }
    conditions.push('Standard documentation package required');
  }
  
  const summary = generateDecisionSummary(finalDecision, creditAnalysis, riskAnalysis, pricingAnalysis, approvedAmount);
  
  return {
    finalDecision,
    approvedAmount,
    conditions,
    summary,
  };
}

function generateDecisionSummary(
  decision: LoanDecision,
  credit: CreditAnalysis,
  risk: RiskAnalysis,
  pricing: PricingAnalysis,
  approvedAmount: number | null
): string {
  if (decision === 'rejected') {
    return `Application declined. Credit score: ${credit.ficoScore}, Risk rating: ${risk.riskRating}. The risk profile exceeds acceptable parameters under current strategy.`;
  }
  
  if (decision === 'review') {
    return `Application requires manual review. FICO: ${credit.ficoScore}, PD: ${risk.probabilityOfDefault}%. Additional analysis needed before final determination.`;
  }
  
  return `Application approved for $${approvedAmount?.toLocaleString()}. FICO: ${credit.ficoScore}, Risk: ${risk.riskRating}, Rate: ${pricing.finalRate}%. Monthly payment: $${pricing.monthlyPayment}.`;
}
