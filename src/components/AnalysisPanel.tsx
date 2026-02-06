import { 
  CreditAnalysis, 
  RiskAnalysis, 
  ComplianceCheck, 
  PricingAnalysis, 
  CommitteeDecision,
  AgentState 
} from '@/types/loan';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { CreditAnalysisView } from './analysis/CreditAnalysisView';

interface AnalysisPanelProps {
  agents: AgentState[];
}

function RiskAnalysisView({ data }: { data: RiskAnalysis }) {
  const riskColors: Record<string, string> = {
    low: 'text-status-approved',
    medium: 'text-agent-risk',
    high: 'text-status-rejected',
    'very-high': 'text-status-rejected',
  };

  const RiskIcon = () => {
    if (data.riskRating === 'low') return <TrendingDown className="w-4 h-4 text-status-approved" />;
    if (data.riskRating === 'medium') return <Minus className="w-4 h-4 text-agent-risk" />;
    return <TrendingUp className="w-4 h-4 text-status-rejected" />;
  };

  return (
    <div className="space-y-4 slide-in">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <span className="data-label">PD</span>
          <p className="data-value text-lg">{data.probabilityOfDefault}%</p>
        </div>
        <div>
          <span className="data-label">LGD</span>
          <p className="data-value text-lg">{data.lossGivenDefault}%</p>
        </div>
        <div>
          <span className="data-label">Expected Loss</span>
          <p className="data-value text-lg">${data.expectedLoss.toLocaleString()}</p>
        </div>
      </div>
      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
        <span className="text-sm font-medium">Risk Rating</span>
        <div className="flex items-center gap-2">
          <RiskIcon />
          <span className={cn('font-semibold uppercase', riskColors[data.riskRating])}>
            {data.riskRating}
          </span>
        </div>
      </div>
      <div className="pt-2 border-t border-border">
        <span className="data-label">Recommendation</span>
        <p className="text-sm mt-1 text-agent-risk">{data.recommendation}</p>
      </div>
    </div>
  );
}

function ComplianceCheckView({ data }: { data: ComplianceCheck }) {
  const CheckItem = ({ label, passed }: { label: string; passed: boolean }) => (
    <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
      <span className="text-sm">{label}</span>
      {passed ? (
        <CheckCircle2 className="w-5 h-5 text-status-approved" />
      ) : (
        <XCircle className="w-5 h-5 text-status-rejected" />
      )}
    </div>
  );

  return (
    <div className="space-y-4 slide-in">
      <div className="space-y-2">
        <CheckItem label="KYC Verification" passed={data.kycVerified} />
        <CheckItem label="AML Screening" passed={data.amlCleared} />
        <CheckItem label="Sanctions Check" passed={data.sanctionsCleared} />
      </div>
      <div>
        <span className="data-label">Document Verification</span>
        <p className="text-sm text-muted-foreground mt-1">{data.documentVerification}</p>
      </div>
      <div className="pt-2 border-t border-border">
        <span className="data-label">Recommendation</span>
        <p className="text-sm mt-1 text-agent-compliance">{data.recommendation}</p>
      </div>
    </div>
  );
}

function PricingAnalysisView({ data }: { data: PricingAnalysis }) {
  return (
    <div className="space-y-4 slide-in">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <span className="data-label">Base Rate</span>
          <p className="data-value text-lg">{data.baseRate}%</p>
        </div>
        <div>
          <span className="data-label">Risk Premium</span>
          <p className="data-value text-lg text-agent-risk">+{data.riskPremium}%</p>
        </div>
        <div>
          <span className="data-label">Final Rate</span>
          <p className="data-value text-lg text-agent-pricing">{data.finalRate}%</p>
        </div>
      </div>
      <div className="p-4 rounded-lg bg-agent-pricing/10 border border-agent-pricing/20">
        <span className="data-label">Monthly Payment</span>
        <p className="data-value text-2xl text-agent-pricing">${data.monthlyPayment.toLocaleString()}</p>
      </div>
      <div className="pt-2 border-t border-border">
        <span className="data-label">Recommendation</span>
        <p className="text-sm mt-1 text-agent-pricing">{data.recommendation}</p>
      </div>
    </div>
  );
}

function CommitteeDecisionView({ data }: { data: CommitteeDecision }) {
  const decisionColors: Record<string, string> = {
    approved: 'bg-status-approved/10 border-status-approved/30 text-status-approved',
    rejected: 'bg-status-rejected/10 border-status-rejected/30 text-status-rejected',
    pending: 'bg-status-pending/10 border-status-pending/30 text-status-pending',
    review: 'bg-status-processing/10 border-status-processing/30 text-status-processing',
  };

  const DecisionIcon = () => {
    switch (data.finalDecision) {
      case 'approved':
        return <CheckCircle2 className="w-6 h-6" />;
      case 'rejected':
        return <XCircle className="w-6 h-6" />;
      case 'review':
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 slide-in">
      <div className={cn(
        'p-4 rounded-xl border-2 flex items-center gap-4',
        decisionColors[data.finalDecision]
      )}>
        <DecisionIcon />
        <div>
          <p className="text-lg font-bold uppercase">{data.finalDecision}</p>
          {data.approvedAmount && (
            <p className="text-sm opacity-80">
              Approved: ${data.approvedAmount.toLocaleString()}
            </p>
          )}
        </div>
      </div>
      
      {data.conditions.length > 0 && (
        <div>
          <span className="data-label">Conditions</span>
          <ul className="mt-2 space-y-1">
            {data.conditions.map((condition, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-agent-chair mt-0.5">•</span>
                {condition}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="pt-2 border-t border-border">
        <span className="data-label">Committee Summary</span>
        <p className="text-sm mt-1">{data.summary}</p>
      </div>
    </div>
  );
}

export function AnalysisPanel({ agents }: AnalysisPanelProps) {
  const completedAgents = agents.filter(a => a.status === 'complete' && a.analysis);

  if (completedAgents.length === 0) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-full">
        <p className="text-muted-foreground text-center">
          Submit a loan application to begin committee analysis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
      {completedAgents.map(agent => (
        <div key={agent.id} className="glass-card p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span className={cn(
              'w-2 h-2 rounded-full',
              agent.color === 'credit' && 'bg-agent-credit',
              agent.color === 'risk' && 'bg-agent-risk',
              agent.color === 'compliance' && 'bg-agent-compliance',
              agent.color === 'pricing' && 'bg-agent-pricing',
              agent.color === 'chair' && 'bg-agent-chair',
            )} />
            {agent.name}
          </h3>
          
          {agent.id === 'credit' && agent.analysis && (
            <CreditAnalysisView data={agent.analysis as CreditAnalysis} />
          )}
          {agent.id === 'risk' && agent.analysis && (
            <RiskAnalysisView data={agent.analysis as RiskAnalysis} />
          )}
          {agent.id === 'compliance' && agent.analysis && (
            <ComplianceCheckView data={agent.analysis as ComplianceCheck} />
          )}
          {agent.id === 'pricing' && agent.analysis && (
            <PricingAnalysisView data={agent.analysis as PricingAnalysis} />
          )}
          {agent.id === 'chair' && agent.analysis && (
            <CommitteeDecisionView data={agent.analysis as CommitteeDecision} />
          )}
        </div>
      ))}
    </div>
  );
}
