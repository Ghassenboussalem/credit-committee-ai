import { RISK_STRATEGIES, RiskStrategy } from '@/types/loan';
import { cn } from '@/lib/utils';
import { Shield, Gauge, Zap } from 'lucide-react';

interface StrategySelectorProps {
  currentStrategy: string;
  onStrategyChange: (strategy: string) => void;
}

const strategyIcons: Record<string, React.ReactNode> = {
  conservative: <Shield className="w-4 h-4" />,
  moderate: <Gauge className="w-4 h-4" />,
  aggressive: <Zap className="w-4 h-4" />,
};

const strategyColors: Record<string, string> = {
  conservative: 'border-agent-credit/50 bg-agent-credit/5 hover:bg-agent-credit/10',
  moderate: 'border-agent-risk/50 bg-agent-risk/5 hover:bg-agent-risk/10',
  aggressive: 'border-status-rejected/50 bg-status-rejected/5 hover:bg-status-rejected/10',
};

const activeColors: Record<string, string> = {
  conservative: 'border-agent-credit bg-agent-credit/20 shadow-[0_0_20px_hsl(173_80%_50%/0.2)]',
  moderate: 'border-agent-risk bg-agent-risk/20 shadow-[0_0_20px_hsl(38_92%_55%/0.2)]',
  aggressive: 'border-status-rejected bg-status-rejected/20 shadow-[0_0_20px_hsl(0_84%_60%/0.2)]',
};

export function StrategySelector({ currentStrategy, onStrategyChange }: StrategySelectorProps) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Risk Strategy</h3>
        <span className="text-xs text-muted-foreground">Configuration</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(RISK_STRATEGIES).map(([key, strategy]) => (
          <button
            key={key}
            onClick={() => onStrategyChange(key)}
            className={cn(
              'p-3 rounded-lg border-2 transition-all duration-300 text-left',
              currentStrategy === key
                ? activeColors[key]
                : strategyColors[key]
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {strategyIcons[key]}
              <span className="text-xs font-semibold">{strategy.name}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Min FICO</span>
                <span className="font-mono">{strategy.minFICO}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Max PD</span>
                <span className="font-mono">{(strategy.maxPD * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Max DTI</span>
                <span className="font-mono">{strategy.maxDTI}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
