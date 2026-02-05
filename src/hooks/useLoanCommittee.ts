import { useState, useCallback } from 'react';
import { 
  LoanApplication, 
  AgentState, 
  RISK_STRATEGIES,
  CreditAnalysis,
  RiskAnalysis,
  ComplianceCheck,
  PricingAnalysis
} from '@/types/loan';
import {
  calculateFICOScore,
  calculateRiskMetrics,
  performKYCCheck,
  calculatePricing,
  makeCommitteeDecision,
} from '@/lib/creditTools';

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

  const updateAgent = useCallback((agentId: string, updates: Partial<AgentState>) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, ...updates } : agent
    ));
  }, []);

  const resetAgents = useCallback(() => {
    setAgents(initialAgents);
    setCurrentAgentIndex(-1);
  }, []);

  const processApplication = useCallback(async (application: LoanApplication) => {
    resetAgents();
    setIsProcessing(true);
    setCurrentApplication(application);

    const strategy = RISK_STRATEGIES[currentStrategy];
    
    try {
      // Step 1: Credit Analysis
      setCurrentAgentIndex(0);
      updateAgent('credit', { status: 'processing' });
      const creditAnalysis = await calculateFICOScore(application);
      updateAgent('credit', { status: 'complete', analysis: creditAnalysis });

      // Step 2: Risk Modeling (depends on credit analysis)
      setCurrentAgentIndex(1);
      updateAgent('risk', { status: 'processing' });
      const riskAnalysis = await calculateRiskMetrics(application, creditAnalysis, strategy);
      updateAgent('risk', { status: 'complete', analysis: riskAnalysis });

      // Step 3: Compliance Check (parallel with risk, but shown sequentially for UX)
      setCurrentAgentIndex(2);
      updateAgent('compliance', { status: 'processing' });
      const complianceCheck = await performKYCCheck(application);
      updateAgent('compliance', { status: 'complete', analysis: complianceCheck });

      // Step 4: Pricing (depends on risk analysis)
      setCurrentAgentIndex(3);
      updateAgent('pricing', { status: 'processing' });
      const pricingAnalysis = await calculatePricing(application, riskAnalysis, strategy);
      updateAgent('pricing', { status: 'complete', analysis: pricingAnalysis });

      // Step 5: Committee Decision (synthesizes all analyses)
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

    } catch (error) {
      console.error('Error processing application:', error);
      // Mark current agent as error
      const currentAgent = agents[currentAgentIndex];
      if (currentAgent) {
        updateAgent(currentAgent.id, { status: 'error' });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [currentStrategy, updateAgent, resetAgents]);

  return {
    agents,
    currentAgentIndex,
    isProcessing,
    currentStrategy,
    currentApplication,
    setCurrentStrategy,
    processApplication,
    resetAgents,
  };
}
