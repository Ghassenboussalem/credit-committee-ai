import { 
  LoanApplication, 
  BehavioralAnalysis, 
  BehavioralRedFlag 
} from '@/types/loan';

// Income benchmarks by loan purpose
const PURPOSE_INCOME_EXPECTATIONS: Record<string, { minIncome: number; typicalRange: [number, number] }> = {
  'Home Purchase': { minIncome: 60000, typicalRange: [80000, 250000] },
  'Business Expansion': { minIncome: 75000, typicalRange: [100000, 300000] },
  'Debt Consolidation': { minIncome: 35000, typicalRange: [45000, 120000] },
  'Vehicle Purchase': { minIncome: 30000, typicalRange: [40000, 150000] },
  'Education': { minIncome: 25000, typicalRange: [35000, 100000] },
  'Home Improvement': { minIncome: 50000, typicalRange: [60000, 180000] },
  'Medical Expenses': { minIncome: 30000, typicalRange: [40000, 120000] },
  'Other': { minIncome: 35000, typicalRange: [45000, 150000] },
};

// Typical debt levels by income bracket
const INCOME_DEBT_PATTERNS: { maxIncome: number; typicalDebtMax: number }[] = [
  { maxIncome: 50000, typicalDebtMax: 15000 },
  { maxIncome: 75000, typicalDebtMax: 25000 },
  { maxIncome: 100000, typicalDebtMax: 40000 },
  { maxIncome: 150000, typicalDebtMax: 60000 },
  { maxIncome: 250000, typicalDebtMax: 100000 },
  { maxIncome: Infinity, typicalDebtMax: 150000 },
];

/**
 * Check if amount is suspiciously round
 */
function isRoundNumber(amount: number): boolean {
  // Check for common round amounts
  const roundPatterns = [1000, 5000, 10000, 25000, 50000, 100000];
  return roundPatterns.some(p => amount === p || amount % p === 0);
}

/**
 * Analyze loan amount precision
 */
function checkAmountPrecision(application: LoanApplication): BehavioralRedFlag {
  const isRound = isRoundNumber(application.requestedAmount);
  const veryRound = application.requestedAmount % 10000 === 0;
  
  return {
    flag: 'Round Number Request',
    severity: veryRound ? 'low' : 'low',
    description: veryRound 
      ? `Exactly $${application.requestedAmount.toLocaleString()} requested - very round numbers may indicate less specific planning`
      : `Loan amount of $${application.requestedAmount.toLocaleString()} shows ${isRound ? 'some' : 'specific'} financial planning`,
    detected: veryRound,
  };
}

/**
 * Check purpose-income mismatch
 */
function checkPurposeIncomeMismatch(application: LoanApplication): BehavioralRedFlag {
  const expectations = PURPOSE_INCOME_EXPECTATIONS[application.purpose] || PURPOSE_INCOME_EXPECTATIONS['Other'];
  const isBelowMinimum = application.annualIncome < expectations.minIncome;
  const isBelowTypical = application.annualIncome < expectations.typicalRange[0];
  
  let severity: 'low' | 'medium' | 'high' = 'low';
  let description = '';
  let detected = false;
  
  if (isBelowMinimum) {
    severity = 'high';
    description = `Income of $${application.annualIncome.toLocaleString()} is significantly below typical minimum ($${expectations.minIncome.toLocaleString()}) for ${application.purpose} loans. This combination raises affordability concerns.`;
    detected = true;
  } else if (isBelowTypical) {
    severity = 'medium';
    description = `Income of $${application.annualIncome.toLocaleString()} is below typical range ($${expectations.typicalRange[0].toLocaleString()}-$${expectations.typicalRange[1].toLocaleString()}) for ${application.purpose} loans.`;
    detected = true;
  } else {
    description = `Income level is appropriate for ${application.purpose} loan purpose.`;
  }
  
  return {
    flag: 'Purpose-Income Mismatch',
    severity,
    description,
    detected,
  };
}

/**
 * Check for abnormal debt patterns
 */
function checkDebtPatterns(application: LoanApplication): BehavioralRedFlag {
  const bracket = INCOME_DEBT_PATTERNS.find(b => application.annualIncome <= b.maxIncome) 
    || INCOME_DEBT_PATTERNS[INCOME_DEBT_PATTERNS.length - 1];
  
  const debtExceedsTypical = application.existingDebt > bracket.typicalDebtMax;
  const debtRatio = application.existingDebt / bracket.typicalDebtMax;
  
  let severity: 'low' | 'medium' | 'high' = 'low';
  let description = '';
  let detected = false;
  
  if (debtRatio > 2) {
    severity = 'high';
    description = `Existing debt of $${application.existingDebt.toLocaleString()} is ${(debtRatio).toFixed(1)}x higher than typical for this income bracket (expected max: $${bracket.typicalDebtMax.toLocaleString()}). May indicate financial distress.`;
    detected = true;
  } else if (debtRatio > 1.3) {
    severity = 'medium';
    description = `Existing debt is ${Math.round((debtRatio - 1) * 100)}% above typical for income level. Consider debt management capacity.`;
    detected = true;
  } else {
    description = `Debt levels are within normal range for income bracket.`;
  }
  
  return {
    flag: 'Abnormal Debt Pattern',
    severity,
    description,
    detected,
  };
}

/**
 * Check for employment instability signals
 */
function checkEmploymentStability(application: LoanApplication): BehavioralRedFlag {
  const isVeryNew = application.employmentYears < 1;
  const isNew = application.employmentYears < 2;
  const loanToIncome = application.requestedAmount / application.annualIncome;
  
  let severity: 'low' | 'medium' | 'high' = 'low';
  let description = '';
  let detected = false;
  
  if (isVeryNew && loanToIncome > 0.5) {
    severity = 'high';
    description = `Less than 1 year employment combined with large loan request (${Math.round(loanToIncome * 100)}% of income) - high risk profile.`;
    detected = true;
  } else if (isNew && loanToIncome > 0.75) {
    severity = 'medium';
    description = `${application.employmentYears} years employment with aggressive borrowing pattern (${Math.round(loanToIncome * 100)}% of income).`;
    detected = true;
  } else if (isNew) {
    severity = 'low';
    description = `Limited employment history (${application.employmentYears} years) - standard monitoring recommended.`;
    detected = true;
  } else {
    description = `Employment tenure of ${application.employmentYears} years indicates stability.`;
  }
  
  return {
    flag: 'Employment Instability',
    severity,
    description,
    detected,
  };
}

/**
 * Check loan-to-income desperation signals
 */
function checkDesperation(application: LoanApplication): BehavioralRedFlag {
  const loanToIncome = application.requestedAmount / application.annualIncome;
  const totalDebtAfterLoan = application.existingDebt + application.requestedAmount;
  const postLoanDTI = (totalDebtAfterLoan / application.annualIncome) * 100;
  
  let severity: 'low' | 'medium' | 'high' = 'low';
  let description = '';
  let detected = false;
  
  if (loanToIncome > 1.5 || postLoanDTI > 80) {
    severity = 'high';
    description = `Requesting ${Math.round(loanToIncome * 100)}% of annual income. Post-loan DTI would be ${postLoanDTI.toFixed(0)}% - may indicate financial desperation.`;
    detected = true;
  } else if (loanToIncome > 1.0 || postLoanDTI > 60) {
    severity = 'medium';
    description = `Large request relative to income (${Math.round(loanToIncome * 100)}%). Post-loan obligations would be substantial.`;
    detected = true;
  } else if (loanToIncome > 0.75) {
    severity = 'low';
    description = `Moderately aggressive loan request (${Math.round(loanToIncome * 100)}% of income).`;
    detected = true;
  } else {
    description = `Conservative loan request relative to income.`;
  }
  
  return {
    flag: 'Financial Stress Signal',
    severity,
    description,
    detected,
  };
}

/**
 * Calculate psychological risk score (0-100)
 */
function calculatePsychologicalRiskScore(flags: BehavioralRedFlag[]): number {
  let score = 0;
  
  flags.forEach(flag => {
    if (!flag.detected) return;
    
    switch (flag.severity) {
      case 'high':
        score += 25;
        break;
      case 'medium':
        score += 15;
        break;
      case 'low':
        score += 5;
        break;
    }
  });
  
  return Math.min(100, score);
}

/**
 * Generate overall behavioral assessment
 */
function generateOverallAssessment(flags: BehavioralRedFlag[], riskScore: number): string {
  const detectedFlags = flags.filter(f => f.detected);
  const highCount = detectedFlags.filter(f => f.severity === 'high').length;
  const mediumCount = detectedFlags.filter(f => f.severity === 'medium').length;
  
  if (riskScore >= 60) {
    return `🔴 HIGH BEHAVIORAL RISK (Score: ${riskScore}/100). Multiple concerning patterns detected: ${highCount} high-severity and ${mediumCount} medium-severity flags. This application exhibits financial stress signals that warrant enhanced scrutiny.`;
  } else if (riskScore >= 30) {
    return `🟡 MODERATE BEHAVIORAL RISK (Score: ${riskScore}/100). Some concerning patterns identified. ${detectedFlags.length} flags detected - recommend careful review of stated income and purpose alignment.`;
  } else if (riskScore > 0) {
    return `🟢 LOW BEHAVIORAL RISK (Score: ${riskScore}/100). Minor flags detected but overall profile appears consistent. Standard verification procedures should suffice.`;
  } else {
    return `✅ CLEAN BEHAVIORAL PROFILE (Score: ${riskScore}/100). No red flags detected. Application data appears consistent and reasonable for stated purpose and income level.`;
  }
}

/**
 * Main function to perform complete behavioral analysis
 */
export function performBehavioralAnalysis(application: LoanApplication): BehavioralAnalysis {
  const redFlags: BehavioralRedFlag[] = [
    checkAmountPrecision(application),
    checkPurposeIncomeMismatch(application),
    checkDebtPatterns(application),
    checkEmploymentStability(application),
    checkDesperation(application),
  ];
  
  const psychologicalRiskScore = calculatePsychologicalRiskScore(redFlags);
  const overallAssessment = generateOverallAssessment(redFlags, psychologicalRiskScore);
  
  const flagCount = {
    low: redFlags.filter(f => f.detected && f.severity === 'low').length,
    medium: redFlags.filter(f => f.detected && f.severity === 'medium').length,
    high: redFlags.filter(f => f.detected && f.severity === 'high').length,
  };
  
  return {
    redFlags,
    psychologicalRiskScore,
    overallAssessment,
    flagCount,
  };
}
