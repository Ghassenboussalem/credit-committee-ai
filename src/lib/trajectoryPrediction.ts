import { 
  LoanApplication, 
  CreditTrajectory, 
  TrajectoryPrediction,
  FICOComponents 
} from '@/types/loan';

/**
 * Calculate debt velocity - rate of debt accumulation over time
 */
function calculateDebtVelocity(application: LoanApplication): number {
  if (application.employmentYears === 0) {
    return application.existingDebt; // All debt is new
  }
  return application.existingDebt / application.employmentYears;
}

/**
 * Determine trajectory trend based on financial indicators
 */
function determineTrend(
  application: LoanApplication,
  debtVelocity: number
): 'improving' | 'stable' | 'declining' {
  const incomeToDebtGrowth = application.annualIncome / (debtVelocity * 12 || 1);
  const dti = (application.existingDebt / application.annualIncome) * 100;
  
  // Strong income relative to debt accumulation = improving
  if (incomeToDebtGrowth > 10 && dti < 25) {
    return 'improving';
  }
  
  // High debt velocity or DTI = declining
  if (incomeToDebtGrowth < 3 || dti > 40) {
    return 'declining';
  }
  
  return 'stable';
}

/**
 * Project FICO score at future time points
 */
function projectFICO(
  currentFICO: number,
  trend: 'improving' | 'stable' | 'declining',
  months: number,
  application: LoanApplication,
  components: FICOComponents
): TrajectoryPrediction {
  // Monthly change rates based on trend
  const monthlyRates = {
    improving: 2.5,  // +2.5 points/month
    stable: 0.3,     // +0.3 points/month (slight positive bias)
    declining: -1.5, // -1.5 points/month
  };
  
  // Calculate base projection
  const baseChange = monthlyRates[trend] * months;
  let projectedFICO = Math.round(currentFICO + baseChange);
  
  // Apply component-specific adjustments
  // Strong payment history provides stability
  if (components.paymentHistory.rating === 'excellent') {
    projectedFICO += Math.round(months * 0.3);
  } else if (components.paymentHistory.rating === 'poor') {
    projectedFICO -= Math.round(months * 0.5);
  }
  
  // Employment tenure adds positive momentum
  if (application.employmentYears >= 5) {
    projectedFICO += Math.round(months * 0.2);
  }
  
  // Calculate confidence intervals
  // Uncertainty grows with time
  const baseVariance = 15;
  const timeVariance = months * 1.5;
  const totalVariance = baseVariance + timeVariance;
  
  // Adjust variance based on trend stability
  const varianceMultiplier = trend === 'stable' ? 0.8 : trend === 'declining' ? 1.3 : 1.0;
  const adjustedVariance = Math.round(totalVariance * varianceMultiplier);
  
  // Clamp to valid FICO range
  projectedFICO = Math.max(300, Math.min(850, projectedFICO));
  const confidenceLow = Math.max(300, projectedFICO - adjustedVariance);
  const confidenceHigh = Math.min(850, projectedFICO + adjustedVariance);
  
  return {
    months,
    projectedFICO,
    confidenceLow,
    confidenceHigh,
    trend,
  };
}

/**
 * Generate risk assessment narrative
 */
function generateRiskAssessment(
  trend: 'improving' | 'stable' | 'declining',
  debtVelocity: number,
  application: LoanApplication
): string {
  const dti = ((application.existingDebt / application.annualIncome) * 100).toFixed(1);
  const monthlyDebtVelocity = (debtVelocity / 12).toFixed(0);
  
  let assessment = '';
  
  if (trend === 'declining') {
    assessment = `⚠️ CONCERNING TRAJECTORY: Debt growing at ~$${monthlyDebtVelocity}/month with ${dti}% DTI. `;
    
    if (debtVelocity > application.annualIncome * 0.1) {
      assessment += `Debt accumulation rate exceeds 10% of annual income - high risk of payment stress. `;
    }
    
    if (parseFloat(dti) > 40) {
      assessment += `DTI above 40% suggests existing financial strain. Adding new debt may accelerate decline.`;
    } else {
      assessment += `While DTI is manageable, the trend suggests worsening financial health over time.`;
    }
  } else if (trend === 'improving') {
    assessment = `✅ POSITIVE TRAJECTORY: Strong income-to-debt ratio with controlled debt accumulation ($${monthlyDebtVelocity}/month). `;
    assessment += `Current ${dti}% DTI with ${application.employmentYears} years employment suggests stable financial management. `;
    assessment += `Profile likely to maintain or improve creditworthiness.`;
  } else {
    assessment = `➡️ STABLE TRAJECTORY: Debt velocity of $${monthlyDebtVelocity}/month is proportional to income. `;
    assessment += `${dti}% DTI indicates manageable debt load. `;
    assessment += `Credit profile expected to remain consistent absent major financial changes.`;
  }
  
  return assessment;
}

/**
 * Main function to calculate complete credit trajectory
 */
export function calculateCreditTrajectory(
  application: LoanApplication,
  currentFICO: number,
  components: FICOComponents
): CreditTrajectory {
  const debtVelocity = calculateDebtVelocity(application);
  const incomeDebtRatio = application.annualIncome / (application.existingDebt || 1);
  const trajectoryTrend = determineTrend(application, debtVelocity);
  
  // Generate predictions for 12, 24, and 36 months
  const predictions: TrajectoryPrediction[] = [
    projectFICO(currentFICO, trajectoryTrend, 12, application, components),
    projectFICO(currentFICO, trajectoryTrend, 24, application, components),
    projectFICO(currentFICO, trajectoryTrend, 36, application, components),
  ];
  
  const riskAssessment = generateRiskAssessment(trajectoryTrend, debtVelocity, application);
  
  return {
    debtVelocity,
    incomeDebtRatio,
    trajectoryTrend,
    predictions,
    riskAssessment,
  };
}
