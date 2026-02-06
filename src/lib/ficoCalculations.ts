import { LoanApplication, FICOComponents, FICOComponent, WhatIfScenario } from '@/types/loan';

// FICO Component Weights (industry standard)
const WEIGHTS = {
  paymentHistory: 35,
  amountsOwed: 30,
  lengthOfHistory: 15,
  newCredit: 10,
  creditMix: 10,
};

// Credit Mix scores by loan purpose
const PURPOSE_SCORES: Record<string, number> = {
  'Home Purchase': 85,
  'Business Expansion': 70,
  'Debt Consolidation': 85,
  'Vehicle Purchase': 80,
  'Education': 85,
  'Home Improvement': 80,
  'Medical Expenses': 90,
  'Other': 75,
};

function getRating(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'fair';
  return 'poor';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Payment History (35% of FICO)
 * Based on DTI ratio - lower DTI suggests better payment reliability
 */
export function calculatePaymentHistoryScore(application: LoanApplication): number {
  const dti = ((application.existingDebt / 12) / (application.annualIncome / 12)) * 100;
  
  // Formula: 100 - (DTI * 1.5)
  let score = 100 - (dti * 1.5);
  
  // Bonus for low debt relative to income
  if (dti < 15) score += 5;
  if (dti < 10) score += 5;
  
  // Penalty for high debt
  if (dti > 40) score -= 10;
  if (dti > 50) score -= 15;
  
  return clamp(Math.round(score), 0, 100);
}

/**
 * Amounts Owed (30% of FICO)
 * Based on existing debt as percentage of annual income
 */
export function calculateAmountsOwedScore(application: LoanApplication): number {
  const debtToIncomeRatio = application.existingDebt / application.annualIncome;
  
  // Formula: 100 - (debt ratio * 200)
  let score = 100 - (debtToIncomeRatio * 200);
  
  // Bonus for minimal debt
  if (debtToIncomeRatio < 0.05) score += 10;
  if (debtToIncomeRatio < 0.1) score += 5;
  
  // Additional penalty for high debt burden
  if (debtToIncomeRatio > 0.4) score -= 10;
  if (debtToIncomeRatio > 0.6) score -= 15;
  
  return clamp(Math.round(score), 0, 100);
}

/**
 * Length of Credit History (15% of FICO)
 * Using employment years as proxy for financial stability
 */
export function calculateLengthOfHistoryScore(application: LoanApplication): number {
  const years = application.employmentYears;
  
  // Formula: min(100, years * 10 + 20)
  let score = Math.min(100, years * 10 + 20);
  
  // Bonus for long-term stability
  if (years >= 10) score = Math.min(100, score + 5);
  if (years >= 15) score = Math.min(100, score + 5);
  
  // Penalty for very short history
  if (years < 1) score -= 15;
  if (years < 2) score -= 5;
  
  return clamp(Math.round(score), 0, 100);
}

/**
 * New Credit (10% of FICO)
 * Based on requested loan amount relative to income
 */
export function calculateNewCreditScore(application: LoanApplication): number {
  const loanToIncomeRatio = application.requestedAmount / application.annualIncome;
  
  // Formula: 100 - (ratio * 100)
  let score = 100 - (loanToIncomeRatio * 100);
  
  // Bonus for conservative borrowing
  if (loanToIncomeRatio < 0.25) score += 10;
  if (loanToIncomeRatio < 0.15) score += 5;
  
  // Penalty for aggressive borrowing
  if (loanToIncomeRatio > 1.0) score -= 15;
  if (loanToIncomeRatio > 1.5) score -= 10;
  
  return clamp(Math.round(score), 0, 100);
}

/**
 * Credit Mix (10% of FICO)
 * Based on loan purpose - some purposes indicate healthier credit behavior
 */
export function calculateCreditMixScore(application: LoanApplication): number {
  const baseScore = PURPOSE_SCORES[application.purpose] || 75;
  
  // Adjustment based on financial stability indicators
  let adjustment = 0;
  
  // Stable employment suggests diverse credit experience
  if (application.employmentYears >= 5) adjustment += 5;
  
  // Higher income suggests more credit experience
  if (application.annualIncome >= 100000) adjustment += 3;
  if (application.annualIncome >= 150000) adjustment += 2;
  
  return clamp(Math.round(baseScore + adjustment), 0, 100);
}

/**
 * Calculate component description based on score and type
 */
function getComponentDescription(type: keyof typeof WEIGHTS, score: number, application: LoanApplication): string {
  const rating = getRating(score);
  
  switch (type) {
    case 'paymentHistory':
      const dti = ((application.existingDebt / application.annualIncome) * 100).toFixed(1);
      if (rating === 'excellent') return `Strong payment capacity with ${dti}% debt-to-income ratio`;
      if (rating === 'good') return `Good payment history indicators, ${dti}% DTI is manageable`;
      if (rating === 'fair') return `Moderate concerns with ${dti}% debt burden`;
      return `High risk: ${dti}% DTI suggests payment stress`;
      
    case 'amountsOwed':
      const debtRatio = ((application.existingDebt / application.annualIncome) * 100).toFixed(1);
      if (rating === 'excellent') return `Minimal debt exposure at ${debtRatio}% of income`;
      if (rating === 'good') return `Reasonable debt levels: ${debtRatio}% of annual income`;
      if (rating === 'fair') return `Elevated debt: ${debtRatio}% of income committed`;
      return `Concerning debt levels: ${debtRatio}% of income`;
      
    case 'lengthOfHistory':
      if (rating === 'excellent') return `${application.employmentYears}+ years employment shows strong stability`;
      if (rating === 'good') return `${application.employmentYears} years employment indicates reliability`;
      if (rating === 'fair') return `${application.employmentYears} years employment - building history`;
      return `Limited history with only ${application.employmentYears} years employment`;
      
    case 'newCredit':
      const loanRatio = ((application.requestedAmount / application.annualIncome) * 100).toFixed(0);
      if (rating === 'excellent') return `Conservative request: ${loanRatio}% of annual income`;
      if (rating === 'good') return `Moderate request at ${loanRatio}% of income`;
      if (rating === 'fair') return `Ambitious request: ${loanRatio}% of annual income`;
      return `High-risk request: ${loanRatio}% of income`;
      
    case 'creditMix':
      if (rating === 'excellent') return `${application.purpose} indicates healthy credit behavior`;
      if (rating === 'good') return `${application.purpose} is a reasonable credit purpose`;
      if (rating === 'fair') return `${application.purpose} carries moderate risk profile`;
      return `${application.purpose} suggests credit stress`;
      
    default:
      return '';
  }
}

/**
 * Build a single FICO component with all metadata
 */
function buildComponent(
  type: keyof typeof WEIGHTS,
  score: number,
  application: LoanApplication
): FICOComponent {
  const weight = WEIGHTS[type];
  return {
    score,
    weight,
    contribution: (score * weight) / 100,
    description: getComponentDescription(type, score, application),
    rating: getRating(score),
  };
}

/**
 * Calculate all FICO components
 */
export function calculateFICOComponents(application: LoanApplication): FICOComponents {
  return {
    paymentHistory: buildComponent('paymentHistory', calculatePaymentHistoryScore(application), application),
    amountsOwed: buildComponent('amountsOwed', calculateAmountsOwedScore(application), application),
    lengthOfHistory: buildComponent('lengthOfHistory', calculateLengthOfHistoryScore(application), application),
    newCredit: buildComponent('newCredit', calculateNewCreditScore(application), application),
    creditMix: buildComponent('creditMix', calculateCreditMixScore(application), application),
  };
}

/**
 * Calculate preliminary FICO score from components
 * Maps 0-100 component scale to 300-850 FICO range
 */
export function calculatePreliminaryFICO(components: FICOComponents): number {
  const totalContribution = 
    components.paymentHistory.contribution +
    components.amountsOwed.contribution +
    components.lengthOfHistory.contribution +
    components.newCredit.contribution +
    components.creditMix.contribution;
  
  // Map 0-100 scale to 300-850 FICO range
  const fico = 300 + (totalContribution * 5.5);
  
  return Math.round(clamp(fico, 300, 850));
}

/**
 * Generate what-if scenarios with modified inputs
 */
export function generateWhatIfScenarios(
  application: LoanApplication,
  currentFICO: number
): WhatIfScenario[] {
  const scenarios: WhatIfScenario[] = [];
  
  // Scenario 1: Employment +2 years
  if (application.employmentYears < 10) {
    const modifiedApp = { ...application, employmentYears: application.employmentYears + 2 };
    const modifiedComponents = calculateFICOComponents(modifiedApp);
    const newFICO = calculatePreliminaryFICO(modifiedComponents);
    const delta = newFICO - currentFICO;
    scenarios.push({
      change: 'Employment +2 years',
      newFICO,
      delta,
      impact: delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral',
    });
  }
  
  // Scenario 2: Reduce debt by $5,000 (if they have enough debt)
  if (application.existingDebt >= 5000) {
    const modifiedApp = { ...application, existingDebt: application.existingDebt - 5000 };
    const modifiedComponents = calculateFICOComponents(modifiedApp);
    const newFICO = calculatePreliminaryFICO(modifiedComponents);
    const delta = newFICO - currentFICO;
    scenarios.push({
      change: 'Reduce debt by $5,000',
      newFICO,
      delta,
      impact: delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral',
    });
  }
  
  // Scenario 3: Reduce loan amount by 20%
  const reducedLoan = Math.round(application.requestedAmount * 0.8);
  if (reducedLoan !== application.requestedAmount) {
    const modifiedApp = { ...application, requestedAmount: reducedLoan };
    const modifiedComponents = calculateFICOComponents(modifiedApp);
    const newFICO = calculatePreliminaryFICO(modifiedComponents);
    const delta = newFICO - currentFICO;
    scenarios.push({
      change: `Request $${reducedLoan.toLocaleString()} instead`,
      newFICO,
      delta,
      impact: delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral',
    });
  }
  
  // Scenario 4: Income increase by 15%
  const increasedIncome = Math.round(application.annualIncome * 1.15);
  {
    const modifiedApp = { ...application, annualIncome: increasedIncome };
    const modifiedComponents = calculateFICOComponents(modifiedApp);
    const newFICO = calculatePreliminaryFICO(modifiedComponents);
    const delta = newFICO - currentFICO;
    scenarios.push({
      change: `Income increase to $${increasedIncome.toLocaleString()}`,
      newFICO,
      delta,
      impact: delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral',
    });
  }
  
  // Scenario 5: Pay off all existing debt
  if (application.existingDebt > 0) {
    const modifiedApp = { ...application, existingDebt: 0 };
    const modifiedComponents = calculateFICOComponents(modifiedApp);
    const newFICO = calculatePreliminaryFICO(modifiedComponents);
    const delta = newFICO - currentFICO;
    scenarios.push({
      change: 'Pay off all existing debt',
      newFICO,
      delta,
      impact: delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral',
    });
  }
  
  // Sort by positive impact first, then by delta magnitude
  return scenarios.sort((a, b) => b.delta - a.delta).slice(0, 5);
}

/**
 * Get summary analysis of all components
 */
export function getComponentAnalysisSummary(components: FICOComponents): string {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  const componentList = [
    { name: 'Payment History', component: components.paymentHistory },
    { name: 'Amounts Owed', component: components.amountsOwed },
    { name: 'Length of History', component: components.lengthOfHistory },
    { name: 'New Credit', component: components.newCredit },
    { name: 'Credit Mix', component: components.creditMix },
  ];
  
  componentList.forEach(({ name, component }) => {
    if (component.rating === 'excellent' || component.rating === 'good') {
      strengths.push(`${name} (${component.score}/100)`);
    } else {
      weaknesses.push(`${name} (${component.score}/100)`);
    }
  });
  
  let summary = '';
  if (strengths.length > 0) {
    summary += `Strengths: ${strengths.join(', ')}. `;
  }
  if (weaknesses.length > 0) {
    summary += `Areas for improvement: ${weaknesses.join(', ')}.`;
  }
  
  return summary.trim();
}
