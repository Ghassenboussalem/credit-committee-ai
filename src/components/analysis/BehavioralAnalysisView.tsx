import { BehavioralAnalysis } from '@/types/loan';
import { cn } from '@/lib/utils';
import { Brain, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

interface BehavioralAnalysisViewProps {
  data: BehavioralAnalysis;
}

const severityConfig = {
  high: {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    bgColor: 'bg-status-rejected/10',
    borderColor: 'border-status-rejected/30',
    textColor: 'text-status-rejected',
    label: 'HIGH',
  },
  medium: {
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    bgColor: 'bg-agent-risk/10',
    borderColor: 'border-agent-risk/30',
    textColor: 'text-agent-risk',
    label: 'MEDIUM',
  },
  low: {
    icon: <Info className="w-3.5 h-3.5" />,
    bgColor: 'bg-agent-credit/10',
    borderColor: 'border-agent-credit/30',
    textColor: 'text-agent-credit',
    label: 'LOW',
  },
};

export function BehavioralAnalysisView({ data }: BehavioralAnalysisViewProps) {
  const getRiskScoreColor = () => {
    if (data.psychologicalRiskScore >= 60) return 'text-status-rejected';
    if (data.psychologicalRiskScore >= 30) return 'text-agent-risk';
    return 'text-status-approved';
  };

  const getRiskScoreBg = () => {
    if (data.psychologicalRiskScore >= 60) return 'bg-status-rejected/10 border-status-rejected/30';
    if (data.psychologicalRiskScore >= 30) return 'bg-agent-risk/10 border-agent-risk/30';
    return 'bg-status-approved/10 border-status-approved/30';
  };

  const detectedFlags = data.redFlags.filter(f => f.detected);
  const totalFlagsDetected = detectedFlags.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-agent-chair" />
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Behavioral Red Flag Analysis
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={cn('p-3 rounded-lg border', getRiskScoreBg())}>
          <span className="text-xs text-muted-foreground">Psychological Risk Score</span>
          <p className={cn('font-mono text-xl font-bold', getRiskScoreColor())}>
            {data.psychologicalRiskScore}<span className="text-xs font-normal text-muted-foreground">/100</span>
          </p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/30">
          <span className="text-xs text-muted-foreground">Flags Detected</span>
          <div className="flex items-center gap-2 mt-1">
            {data.flagCount.high > 0 && (
              <span className="text-xs font-medium text-status-rejected">
                {data.flagCount.high} High
              </span>
            )}
            {data.flagCount.medium > 0 && (
              <span className="text-xs font-medium text-agent-risk">
                {data.flagCount.medium} Med
              </span>
            )}
            {data.flagCount.low > 0 && (
              <span className="text-xs font-medium text-agent-credit">
                {data.flagCount.low} Low
              </span>
            )}
            {totalFlagsDetected === 0 && (
              <span className="text-xs font-medium text-status-approved flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Clean
              </span>
            )}
          </div>
        </div>
      </div>

      {detectedFlags.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Detected Patterns</span>
          {detectedFlags.map((flag, index) => {
            const config = severityConfig[flag.severity];
            return (
              <div 
                key={index}
                className={cn(
                  'p-2.5 rounded-lg border',
                  config.bgColor,
                  config.borderColor
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={config.textColor}>{config.icon}</span>
                  <span className={cn('text-xs font-semibold', config.textColor)}>
                    {config.label}
                  </span>
                  <span className="text-xs font-medium">{flag.flag}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {flag.description}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className={cn(
        'p-3 rounded-lg border',
        data.psychologicalRiskScore >= 60 ? 'bg-status-rejected/5 border-status-rejected/20' :
        data.psychologicalRiskScore >= 30 ? 'bg-agent-risk/5 border-agent-risk/20' :
        'bg-status-approved/5 border-status-approved/20'
      )}>
        <span className="text-xs text-muted-foreground block mb-1">Overall Assessment</span>
        <p className="text-xs leading-relaxed">{data.overallAssessment}</p>
      </div>
    </div>
  );
}
