import { IndustryAnalysis } from '@/types/loan';
import { cn } from '@/lib/utils';
import { Building2, TrendingUp, TrendingDown, Shield, AlertTriangle } from 'lucide-react';

interface IndustryAnalysisViewProps {
  data: IndustryAnalysis;
}

const stabilityColors: Record<string, string> = {
  'Very Stable': 'text-status-approved bg-status-approved/10',
  'Stable': 'text-agent-credit bg-agent-credit/10',
  'Moderate': 'text-agent-risk bg-agent-risk/10',
  'Cyclical': 'text-agent-risk bg-agent-risk/10',
  'Volatile': 'text-status-rejected bg-status-rejected/10',
  'Unknown': 'text-muted-foreground bg-secondary',
};

const layoffRiskColors: Record<string, string> = {
  'Very Low': 'text-status-approved',
  'Low': 'text-agent-credit',
  'Moderate': 'text-agent-risk',
  'High': 'text-status-rejected',
  'Very High': 'text-status-rejected',
  'Unknown': 'text-muted-foreground',
};

export function IndustryAnalysisView({ data }: IndustryAnalysisViewProps) {
  const getRiskIcon = () => {
    if (data.riskCoefficient <= 0.9) return <Shield className="w-4 h-4 text-status-approved" />;
    if (data.riskCoefficient <= 1.1) return <TrendingUp className="w-4 h-4 text-agent-risk" />;
    return <AlertTriangle className="w-4 h-4 text-status-rejected" />;
  };

  const getPercentileColor = () => {
    if (data.industryPercentile >= 75) return 'text-status-approved';
    if (data.industryPercentile >= 50) return 'text-agent-credit';
    if (data.industryPercentile >= 25) return 'text-agent-risk';
    return 'text-status-rejected';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-4 h-4 text-agent-compliance" />
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Industry Risk Profile
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-secondary/30">
          <span className="text-xs text-muted-foreground">Industry</span>
          <p className="font-medium text-sm">{data.industry}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/30">
          <span className="text-xs text-muted-foreground">Risk Coefficient</span>
          <div className="flex items-center gap-2">
            {getRiskIcon()}
            <span className={cn(
              'font-mono font-medium',
              data.riskCoefficient <= 0.9 ? 'text-status-approved' :
              data.riskCoefficient <= 1.1 ? 'text-agent-risk' : 'text-status-rejected'
            )}>
              {data.riskCoefficient}x
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-secondary/30">
          <span className="text-xs text-muted-foreground">Stability</span>
          <span className={cn(
            'inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1',
            stabilityColors[data.stability]
          )}>
            {data.stability}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-secondary/30">
          <span className="text-xs text-muted-foreground">Layoff Risk</span>
          <p className={cn('font-medium text-sm', layoffRiskColors[data.layoffRisk])}>
            {data.layoffRisk}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-secondary/30">
          <span className="text-xs text-muted-foreground">Adjusted FICO</span>
          <p className="font-mono font-semibold">{data.adjustedFICO}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/30">
          <span className="text-xs text-muted-foreground">Industry Percentile</span>
          <p className={cn('font-mono font-semibold', getPercentileColor())}>
            {data.industryPercentile}th
          </p>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-secondary/20 border border-border/50">
        <span className="text-xs text-muted-foreground block mb-1">Benchmark Analysis</span>
        <p className="text-xs leading-relaxed">{data.benchmarkComparison}</p>
      </div>
    </div>
  );
}
