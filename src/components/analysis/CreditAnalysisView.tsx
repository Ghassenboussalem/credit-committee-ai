import { CreditAnalysis } from '@/types/loan';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Sparkles, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { IndustryAnalysisView } from './IndustryAnalysisView';
import { TrajectoryView } from './TrajectoryView';
import { BehavioralAnalysisView } from './BehavioralAnalysisView';

interface CreditAnalysisViewProps {
  data: CreditAnalysis;
}

function FICOComponentCard({ 
  label, 
  component 
}: { 
  label: string; 
  component: CreditAnalysis['ficoComponents']['paymentHistory'];
}) {
  const ratingColors = {
    excellent: 'text-status-approved bg-status-approved/10 border-status-approved/20',
    good: 'text-agent-credit bg-agent-credit/10 border-agent-credit/20',
    fair: 'text-agent-risk bg-agent-risk/10 border-agent-risk/20',
    poor: 'text-status-rejected bg-status-rejected/10 border-status-rejected/20',
  };

  const progressColors = {
    excellent: 'bg-status-approved',
    good: 'bg-agent-credit',
    fair: 'bg-agent-risk',
    poor: 'bg-status-rejected',
  };

  return (
    <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{label}</span>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full border uppercase font-semibold',
          ratingColors[component.rating]
        )}>
          {component.rating}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn('h-full rounded-full transition-all duration-500', progressColors[component.rating])}
            style={{ width: `${component.score}%` }}
          />
        </div>
        <span className="text-xs font-mono text-muted-foreground w-8">
          {component.score}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Weight: {component.weight}%</span>
        <span>+{component.contribution.toFixed(1)} pts</span>
      </div>
      
      <p className="text-xs text-muted-foreground leading-relaxed">
        {component.description}
      </p>
    </div>
  );
}

function WhatIfScenarioCard({ scenario }: { scenario: CreditAnalysis['whatIfScenarios'][0] }) {
  const impactColors = {
    positive: 'text-status-approved',
    negative: 'text-status-rejected',
    neutral: 'text-muted-foreground',
  };

  const ImpactIcon = () => {
    if (scenario.impact === 'positive') return <TrendingUp className="w-3 h-3" />;
    if (scenario.impact === 'negative') return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 text-xs">
      <div className="flex items-center gap-2">
        <ArrowRight className="w-3 h-3 text-muted-foreground" />
        <span>{scenario.change}</span>
      </div>
      <div className={cn('flex items-center gap-1 font-mono font-medium', impactColors[scenario.impact])}>
        <ImpactIcon />
        <span>{scenario.newFICO}</span>
        <span className="text-muted-foreground">
          ({scenario.delta > 0 ? '+' : ''}{scenario.delta})
        </span>
      </div>
    </div>
  );
}

export function CreditAnalysisView({ data }: CreditAnalysisViewProps) {
  const getFicoColor = (score: number) => {
    if (score >= 740) return 'text-status-approved';
    if (score >= 670) return 'text-agent-risk';
    return 'text-status-rejected';
  };

  return (
    <div className="space-y-5 slide-in">
      {/* Main FICO Score */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-agent-credit/10 to-agent-credit/5 border border-agent-credit/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="data-label">Final FICO Score</span>
            <p className={cn('data-value text-3xl', getFicoColor(data.ficoScore))}>
              {data.ficoScore}
            </p>
          </div>
          
          {data.aiAdjustment !== 0 && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Sparkles className="w-3 h-3 text-agent-chair" />
                <span>AI Adjustment</span>
              </div>
              <span className={cn(
                'text-sm font-mono font-semibold',
                data.aiAdjustment > 0 ? 'text-status-approved' : 'text-status-rejected'
              )}>
                {data.aiAdjustment > 0 ? '+' : ''}{data.aiAdjustment} pts
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Preliminary:</span>
            <span className="font-mono">{data.preliminaryFICO}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Payment History:</span>
            <span className="font-medium">{data.paymentHistory}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Utilization:</span>
            <span className="font-mono">{data.creditUtilization}%</span>
          </div>
        </div>
      </div>

      {/* FICO Components Breakdown */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          FICO Component Breakdown
        </h4>
        <div className="grid grid-cols-1 gap-2">
          <FICOComponentCard label="Payment History (35%)" component={data.ficoComponents.paymentHistory} />
          <FICOComponentCard label="Amounts Owed (30%)" component={data.ficoComponents.amountsOwed} />
          <FICOComponentCard label="Length of History (15%)" component={data.ficoComponents.lengthOfHistory} />
          <FICOComponentCard label="New Credit (10%)" component={data.ficoComponents.newCredit} />
          <FICOComponentCard label="Credit Mix (10%)" component={data.ficoComponents.creditMix} />
        </div>
      </div>

      {/* What-If Scenarios */}
      {data.whatIfScenarios.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            What-If Scenarios
          </h4>
          <div className="space-y-1.5">
            {data.whatIfScenarios.map((scenario, i) => (
              <WhatIfScenarioCard key={i} scenario={scenario} />
            ))}
          </div>
        </div>
      )}

      {/* Industry Analysis */}
      {data.industryAnalysis && (
        <div className="pt-4 border-t border-border">
          <IndustryAnalysisView data={data.industryAnalysis} />
        </div>
      )}

      {/* Credit Trajectory */}
      {data.creditTrajectory && (
        <div className="pt-4 border-t border-border">
          <TrajectoryView data={data.creditTrajectory} />
        </div>
      )}

      {/* Behavioral Analysis */}
      {data.behavioralAnalysis && (
        <div className="pt-4 border-t border-border">
          <BehavioralAnalysisView data={data.behavioralAnalysis} />
        </div>
      )}

      {/* Credit Analysis Summary */}
      <div className="pt-4 border-t border-border">
        <span className="data-label">Credit Analysis</span>
        <p className="text-sm text-muted-foreground mt-1">{data.creditHistory}</p>
      </div>

      {/* Recommendation */}
      <div className="pt-3 border-t border-border">
        <span className="data-label">Recommendation</span>
        <p className="text-sm mt-1 text-agent-credit">{data.recommendation}</p>
      </div>
    </div>
  );
}
