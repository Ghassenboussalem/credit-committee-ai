import { CreditTrajectory } from '@/types/loan';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Activity, Calendar } from 'lucide-react';

interface TrajectoryViewProps {
  data: CreditTrajectory;
}

const trendColors: Record<string, string> = {
  improving: 'text-status-approved',
  stable: 'text-agent-risk',
  declining: 'text-status-rejected',
};

const trendIcons: Record<string, React.ReactNode> = {
  improving: <TrendingUp className="w-4 h-4 text-status-approved" />,
  stable: <Minus className="w-4 h-4 text-agent-risk" />,
  declining: <TrendingDown className="w-4 h-4 text-status-rejected" />,
};

export function TrajectoryView({ data }: TrajectoryViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-agent-pricing" />
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Credit Trajectory Prediction
        </h4>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-secondary/30">
          <span className="text-xs text-muted-foreground">Debt Velocity</span>
          <p className="font-mono font-medium text-sm">
            ${Math.round(data.debtVelocity).toLocaleString()}/yr
          </p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/30">
          <span className="text-xs text-muted-foreground">Income/Debt Ratio</span>
          <p className="font-mono font-medium text-sm">{data.incomeDebtRatio.toFixed(1)}x</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/30">
          <span className="text-xs text-muted-foreground">Trend</span>
          <div className="flex items-center gap-1.5">
            {trendIcons[data.trajectoryTrend]}
            <span className={cn('font-medium text-sm capitalize', trendColors[data.trajectoryTrend])}>
              {data.trajectoryTrend}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">FICO Projections</span>
        </div>
        
        {data.predictions.map((prediction) => (
          <div 
            key={prediction.months}
            className="flex items-center justify-between p-2 rounded-lg bg-secondary/20"
          >
            <span className="text-xs font-medium">{prediction.months} Months</span>
            <div className="flex items-center gap-3">
              <span className={cn(
                'font-mono text-sm font-semibold',
                trendColors[prediction.trend]
              )}>
                {prediction.projectedFICO}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                ({prediction.confidenceLow}-{prediction.confidenceHigh})
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={cn(
        'p-3 rounded-lg border',
        data.trajectoryTrend === 'declining' ? 'bg-status-rejected/5 border-status-rejected/20' :
        data.trajectoryTrend === 'improving' ? 'bg-status-approved/5 border-status-approved/20' :
        'bg-secondary/20 border-border/50'
      )}>
        <span className="text-xs text-muted-foreground block mb-1">Risk Assessment</span>
        <p className="text-xs leading-relaxed">{data.riskAssessment}</p>
      </div>
    </div>
  );
}
