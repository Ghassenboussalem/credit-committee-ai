import { useState, useCallback } from 'react';
import { 
  LoanApplication, 
  AgentState, 
  RISK_STRATEGIES,
} from '@/types/loan';
import {
  calculateFICOScore,
  calculateRiskMetrics,
  performKYCCheck,
  calculatePricing,
  makeCommitteeDecision,
} from '@/lib/creditTools';
import { toast } from 'sonner';

const initialAgents: AgentState[] = [
  {
    id: 'credit',
    name: 'Credit Analyst',
    role: 'FICO Scoring & Credit History',
    status: 'idle',
    color: 'credit',
    icon: 'credit-card',
  },
  {
    id: 'risk',
    name: 'Risk Modeler',
    role: 'PD/LGD Calculation',
    status: 'idle',
    color: 'risk',
    icon: 'trending-up',
  },
  {
    id: 'compliance',
    name: 'Compliance Officer',
    role: 'KYC/AML Verification',
    status: 'idle',
    color: 'compliance',
    icon: 'shield',
  },
  {
    id: 'pricing',
    name: 'Pricing Strategist',
    role: 'Risk-Adjusted Pricing',
    status: 'idle',
    color: 'pricing',
    icon: 'dollar-sign',
  },
  {
    id: 'chair',
    name: 'Committee Chair',
    role: 'Final Decision',
    status: 'idle',
    color: 'chair',
    icon: 'users',
  },
];

export function useLoanCommittee() {
  const [agents, setAgents] = useState<AgentState[]>(initialAgents);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState('moderate');
  const [currentApplication, setCurrentApplication] = useState<LoanApplication | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateAgent = useCallback((agentId: string, updates: Partial<AgentState>) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, ...updates } : agent
    ));
  }, []);

  const resetAgents = useCallback(() => {
    setAgents(initialAgents);
    setCurrentAgentIndex(-1);
    setError(null);
  }, []);

  const processApplication = useCallback(async (application: LoanApplication) => {
    resetAgents();
    setIsProcessing(true);
    setCurrentApplication(application);
    setError(null);

    const strategy = RISK_STRATEGIES[currentStrategy];
    
    try {
      // Step 1: Credit Analysis (Real AI)
      setCurrentAgentIndex(0);
      updateAgent('credit', { status: 'processing' });
      const creditAnalysis = await calculateFICOScore(application, strategy);
      updateAgent('credit', { status: 'complete', analysis: creditAnalysis });
      toast.success('Credit Analyst completed analysis');

      // Step 2: Risk Modeling (Real AI - depends on credit analysis)
      setCurrentAgentIndex(1);
      updateAgent('risk', { status: 'processing' });
      const riskAnalysis = await calculateRiskMetrics(application, creditAnalysis, strategy);
      updateAgent('risk', { status: 'complete', analysis: riskAnalysis });
      toast.success('Risk Modeler completed analysis');

      // Step 3: Compliance Check (Real AI)
      setCurrentAgentIndex(2);
      updateAgent('compliance', { status: 'processing' });
      const complianceCheck = await performKYCCheck(application, strategy);
      updateAgent('compliance', { status: 'complete', analysis: complianceCheck });
      toast.success('Compliance Officer completed verification');

      // Step 4: Pricing (Real AI - depends on risk analysis)
      setCurrentAgentIndex(3);
      updateAgent('pricing', { status: 'processing' });
      const pricingAnalysis = await calculatePricing(application, riskAnalysis, strategy);
      updateAgent('pricing', { status: 'complete', analysis: pricingAnalysis });
      toast.success('Pricing Strategist completed analysis');

      // Step 5: Committee Decision (Real AI - synthesizes all analyses)
      setCurrentAgentIndex(4);
      updateAgent('chair', { status: 'processing' });
      const decision = await makeCommitteeDecision(
        application,
        creditAnalysis,
        riskAnalysis,
        complianceCheck,
        pricingAnalysis,
        strategy
      );
      updateAgent('chair', { status: 'complete', analysis: decision });
      
      if (decision.finalDecision === 'approved') {
        toast.success('Loan APPROVED by Committee');
      } else if (decision.finalDecision === 'rejected') {
        toast.error('Loan REJECTED by Committee');
      } else {
        toast.warning('Loan requires MANUAL REVIEW');
      }

    } catch (err) {
      console.error('Error processing application:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Analysis failed: ${errorMessage}`);
      
      // Mark current agent as error
      const currentAgent = agents[currentAgentIndex];
      if (currentAgent) {
        updateAgent(currentAgent.id, { status: 'error' });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [currentStrategy, updateAgent, resetAgents, agents, currentAgentIndex]);

  return {
    agents,
    currentAgentIndex,
    isProcessing,
    currentStrategy,
    currentApplication,
    error,
    setCurrentStrategy,
    processApplication,
    resetAgents,
  };
}
