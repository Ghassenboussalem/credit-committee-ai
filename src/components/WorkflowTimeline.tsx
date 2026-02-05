import { AgentState } from '@/types/loan';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

interface WorkflowTimelineProps {
  agents: AgentState[];
  currentAgentIndex: number;
}

export function WorkflowTimeline({ agents, currentAgentIndex }: WorkflowTimelineProps) {
  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold mb-4">Workflow Progress</h3>
      
      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-3 relative">
          {agents.map((agent, index) => {
            const isComplete = agent.status === 'complete';
            const isProcessing = agent.status === 'processing';
            const isPending = agent.status === 'idle';

            return (
              <div
                key={agent.id}
                className={cn(
                  'flex items-center gap-3 pl-1 transition-opacity duration-300',
                  isPending && currentAgentIndex >= 0 && 'opacity-40'
                )}
              >
                <div className={cn(
                  'relative z-10 w-5 h-5 rounded-full flex items-center justify-center',
                  isComplete && 'bg-status-approved text-background',
                  isProcessing && 'bg-status-processing text-background',
                  isPending && 'bg-secondary border border-border'
                )}>
                  {isComplete && <CheckCircle2 className="w-3 h-3" />}
                  {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                  {isPending && <Circle className="w-2 h-2" />}
                </div>
                
                <div className="flex-1">
                  <p className={cn(
                    'text-xs font-medium',
                    isProcessing && 'text-status-processing',
                    isComplete && 'text-foreground'
                  )}>
                    {agent.name}
                  </p>
                </div>
                
                {isProcessing && (
                  <div className="text-xs text-status-processing font-mono">
                    Processing...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
