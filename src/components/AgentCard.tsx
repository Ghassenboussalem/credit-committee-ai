import { AgentState } from '@/types/loan';
import { 
  CreditCard, 
  TrendingUp, 
  Shield, 
  DollarSign, 
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: AgentState;
  isActive: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  'credit-card': <CreditCard className="w-5 h-5" />,
  'trending-up': <TrendingUp className="w-5 h-5" />,
  'shield': <Shield className="w-5 h-5" />,
  'dollar-sign': <DollarSign className="w-5 h-5" />,
  'users': <Users className="w-5 h-5" />,
};

const colorClasses: Record<string, string> = {
  credit: 'text-agent-credit border-agent-credit/30 bg-agent-credit/5',
  risk: 'text-agent-risk border-agent-risk/30 bg-agent-risk/5',
  compliance: 'text-agent-compliance border-agent-compliance/30 bg-agent-compliance/5',
  pricing: 'text-agent-pricing border-agent-pricing/30 bg-agent-pricing/5',
  chair: 'text-agent-chair border-agent-chair/30 bg-agent-chair/5',
};

const glowClasses: Record<string, string> = {
  credit: 'shadow-[0_0_30px_hsl(173_80%_50%/0.3)]',
  risk: 'shadow-[0_0_30px_hsl(38_92%_55%/0.3)]',
  compliance: 'shadow-[0_0_30px_hsl(262_83%_65%/0.3)]',
  pricing: 'shadow-[0_0_30px_hsl(142_71%_50%/0.3)]',
  chair: 'shadow-[0_0_30px_hsl(217_91%_60%/0.3)]',
};

export function AgentCard({ agent, isActive }: AgentCardProps) {
  const StatusIcon = () => {
    switch (agent.status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-status-approved" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-status-rejected" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'glass-card p-4 transition-all duration-500 border-2',
        colorClasses[agent.color],
        isActive && agent.status === 'processing' && glowClasses[agent.color],
        agent.status === 'idle' && 'opacity-50'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg border',
            colorClasses[agent.color]
          )}>
            {iconMap[agent.icon]}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{agent.name}</h3>
            <p className="text-xs text-muted-foreground">{agent.role}</p>
          </div>
        </div>
        <StatusIcon />
      </div>
      
      {agent.status === 'processing' && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Analyzing</span>
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
    </div>
  );
}
