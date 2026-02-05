import { LoanApplicationForm } from '@/components/LoanApplicationForm';
import { AgentCard } from '@/components/AgentCard';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { StrategySelector } from '@/components/StrategySelector';
import { WorkflowTimeline } from '@/components/WorkflowTimeline';
import { useLoanCommittee } from '@/hooks/useLoanCommittee';
import { Landmark, Cpu } from 'lucide-react';

export default function Index() {
  const {
    agents,
    currentAgentIndex,
    isProcessing,
    currentStrategy,
    currentApplication,
    setCurrentStrategy,
    processApplication,
  } = useLoanCommittee();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-agent-chair/20 border border-primary/30">
                <Landmark className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">Loan Committee</h1>
                <p className="text-xs text-muted-foreground">Multi-Agent Credit Decisioning</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Cpu className="w-4 h-4" />
              <span className="font-mono">5 AI Agents Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Form & Strategy */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <LoanApplicationForm 
              onSubmit={processApplication}
              isProcessing={isProcessing}
            />
            
            <StrategySelector
              currentStrategy={currentStrategy}
              onStrategyChange={setCurrentStrategy}
            />
            
            {currentAgentIndex >= 0 && (
              <WorkflowTimeline
                agents={agents}
                currentAgentIndex={currentAgentIndex}
              />
            )}
          </div>

          {/* Center Column - Agent Cards */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-muted-foreground">Agent Panel</h2>
              {isProcessing && (
                <span className="status-badge status-processing">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  Processing
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {agents.map((agent, index) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isActive={index === currentAgentIndex}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Analysis Results */}
          <div className="col-span-12 lg:col-span-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground">Analysis Results</h2>
              {currentApplication && (
                <span className="text-xs font-mono text-muted-foreground">
                  {currentApplication.id}
                </span>
              )}
            </div>
            
            <AnalysisPanel agents={agents} />
          </div>
        </div>
      </main>

      {/* Background Glow Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div 
          className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(173 80% 50% / 0.3) 0%, transparent 70%)',
          }}
        />
        <div 
          className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(217 91% 60% / 0.3) 0%, transparent 70%)',
          }}
        />
      </div>
    </div>
  );
}
