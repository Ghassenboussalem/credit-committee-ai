import { 
  LoanApplication, 
  INDUSTRY_RISK, 
  IndustryAnalysis 
} from '@/types/loan';

// Anonymized percentile data by industry (simulated historical benchmarks)
const INDUSTRY_BENCHMARKS: Record<string, { avgFICO: number; approvalRate: number; avgLoanToIncome: number }> = {
  'Technology': { avgFICO: 720, approvalRate: 78, avgLoanToIncome: 0.65 },
  'Healthcare': { avgFICO: 740, approvalRate: 85, avgLoanToIncome: 0.55 },
  'Government': { avgFICO: 750, approvalRate: 88, avgLoanToIncome: 0.50 },
  'Education': { avgFICO: 730, approvalRate: 82, avgLoanToIncome: 0.60 },
  'Finance': { avgFICO: 735, approvalRate: 80, avgLoanToIncome: 0.58 },
  'Retail': { avgFICO: 680, approvalRate: 62, avgLoanToIncome: 0.75 },
  'Manufacturing': { avgFICO: 695, approvalRate: 68, avgLoanToIncome: 0.70 },
  'Construction': { avgFICO: 670, approvalRate: 58, avgLoanToIncome: 0.80 },
  'Hospitality': { avgFICO: 660, approvalRate: 52, avgLoanToIncome: 0.85 },
  'Transportation': { avgFICO: 700, approvalRate: 70, avgLoanToIncome: 0.68 },
  'Energy': { avgFICO: 710, approvalRate: 72, avgLoanToIncome: 0.62 },
  'Real Estate': { avgFICO: 705, approvalRate: 65, avgLoanToIncome: 0.72 },
  'Legal': { avgFICO: 745, approvalRate: 84, avgLoanToIncome: 0.52 },
  'Consulting': { avgFICO: 725, approvalRate: 76, avgLoanToIncome: 0.60 },
  'Non-Profit': { avgFICO: 715, approvalRate: 75, avgLoanToIncome: 0.58 },
  'Other': { avgFICO: 700, approvalRate: 68, avgLoanToIncome: 0.65 },
};

function calculatePercentile(value: number, mean: number, stdDev: number = 50): number {
  // Approximate percentile using normal distribution
  const zScore = (value - mean) / stdDev;
  // Use sigmoid approximation for CDF
  const percentile = 100 / (1 + Math.exp(-1.7 * zScore));
  return Math.round(Math.min(99, Math.max(1, percentile)));
}

export function calculateIndustryAnalysis(
  application: LoanApplication,
  preliminaryFICO: number
): IndustryAnalysis {
  const industryData = INDUSTRY_RISK[application.industry] || INDUSTRY_RISK['Other'];
  const benchmark = INDUSTRY_BENCHMARKS[application.industry] || INDUSTRY_BENCHMARKS['Other'];
  
  // Apply industry risk coefficient to FICO
  // Higher risk industries get a penalty, lower risk get a bonus
  const adjustmentFactor = 1 - (industryData.coefficient - 1) * 0.5;
  const adjustedFICO = Math.round(preliminaryFICO * adjustmentFactor);
  
  // Calculate percentile within industry
  const industryPercentile = calculatePercentile(preliminaryFICO, benchmark.avgFICO);
  
  // Generate benchmark comparison
  const loanToIncome = application.requestedAmount / application.annualIncome;
  const loanToIncomePercentile = calculatePercentile(
    benchmark.avgLoanToIncome - loanToIncome, // Inverted: lower is better
    0,
    0.3
  );
  
  let benchmarkComparison = '';
  if (industryPercentile >= 75) {
    benchmarkComparison = `Excellent: This profile ranks in the ${industryPercentile}th percentile for ${application.industry} workers. FICO exceeds industry average of ${benchmark.avgFICO} by ${preliminaryFICO - benchmark.avgFICO} points.`;
  } else if (industryPercentile >= 50) {
    benchmarkComparison = `Above Average: This profile is at the ${industryPercentile}th percentile for ${application.industry}. Close to industry average FICO of ${benchmark.avgFICO}.`;
  } else if (industryPercentile >= 25) {
    benchmarkComparison = `Below Average: At ${industryPercentile}th percentile for ${application.industry}. FICO is ${benchmark.avgFICO - preliminaryFICO} points below industry average.`;
  } else {
    benchmarkComparison = `Weak: This profile is in the bottom ${industryPercentile}% of ${application.industry} applicants. Industry approval rate is ${benchmark.approvalRate}%, this profile may face challenges.`;
  }
  
  // Add loan-to-income context
  if (loanToIncome > benchmark.avgLoanToIncome * 1.2) {
    benchmarkComparison += ` Loan request is ${Math.round((loanToIncome / benchmark.avgLoanToIncome - 1) * 100)}% higher than typical for this industry.`;
  } else if (loanToIncome < benchmark.avgLoanToIncome * 0.8) {
    benchmarkComparison += ` Conservative loan request, ${Math.round((1 - loanToIncome / benchmark.avgLoanToIncome) * 100)}% below industry average.`;
  }
  
  return {
    industry: application.industry,
    riskCoefficient: industryData.coefficient,
    stability: industryData.stability,
    layoffRisk: industryData.layoffRisk,
    adjustedFICO,
    industryPercentile,
    benchmarkComparison,
  };
}
