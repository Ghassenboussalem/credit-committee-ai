import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface LoanApplication {
  id: string;
  applicantName: string;
  requestedAmount: number;
  purpose: string;
  annualIncome: number;
  employmentYears: number;
  existingDebt: number;
}

interface RiskStrategy {
  name: string;
  maxDTI: number;
  minFICO: number;
  maxPD: number;
  riskPremiumMultiplier: number;
}

interface FICOComponent {
  score: number;
  weight: number;
  contribution: number;
  description: string;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
}

interface FICOComponents {
  paymentHistory: FICOComponent;
  amountsOwed: FICOComponent;
  lengthOfHistory: FICOComponent;
  newCredit: FICOComponent;
  creditMix: FICOComponent;
}

interface WhatIfScenario {
  change: string;
  newFICO: number;
  delta: number;
  impact: 'positive' | 'negative' | 'neutral';
}

interface PreCalculatedCreditData {
  ficoComponents: FICOComponents;
  preliminaryFICO: number;
  whatIfScenarios: WhatIfScenario[];
  componentAnalysis: string;
}

interface AnalysisRequest {
  agentType: 'credit' | 'risk' | 'compliance' | 'pricing' | 'chair';
  application: LoanApplication;
  strategy: RiskStrategy;
  previousAnalyses?: Record<string, unknown>;
  preCalculatedData?: PreCalculatedCreditData;
}

const AGENT_PROMPTS: Record<string, string> = {
  credit: `You are a Senior Credit Analyst AI agent specializing in FICO scoring validation and credit history analysis.

You have been provided with PRE-CALCULATED FICO component scores using industry-standard formulas. Your role is to:
1. REVIEW the calculated component scores for reasonableness
2. VALIDATE or ADJUST the preliminary FICO score (±20 points max) based on holistic assessment
3. PROVIDE qualitative analysis that the math cannot capture
4. EXPLAIN any adjustments you make

The 5 FICO components (with standard weights):
- Payment History (35%): Based on DTI ratio
- Amounts Owed (30%): Debt relative to income
- Length of History (15%): Employment years as stability proxy
- New Credit (10%): Loan amount relative to income
- Credit Mix (10%): Purpose-based scoring

You must respond with ONLY valid JSON in this exact format:
{
  "ficoScore": <final FICO between 300-850 - you may adjust ±20 from preliminary>,
  "aiAdjustment": <number: how many points you adjusted from preliminary, positive or negative>,
  "adjustmentReason": "<if you adjusted, explain why>",
  "creditHistory": "<detailed qualitative assessment of credit profile>",
  "paymentHistory": "<Excellent|Good|Fair|Poor>",
  "creditUtilization": <percentage as number>,
  "recommendation": "<your recommendation incorporating both quantitative and qualitative factors>"
}

IMPORTANT: 
- Trust the pre-calculated scores as they use industry-standard formulas
- Only adjust FICO if you see qualitative factors the math missed
- Explain your reasoning for any adjustments
- Consider soft factors: loan purpose + income combination, employment stability patterns, debt trajectory implications`,

  risk: `You are a Risk Modeler AI agent specializing in Probability of Default (PD) and Loss Given Default (LGD) calculations.

Analyze the loan application and previous credit analysis to provide risk metrics. You must respond with ONLY valid JSON in this exact format:
{
  "probabilityOfDefault": <percentage as number, e.g., 5.2>,
  "lossGivenDefault": <percentage as number, typically 40-60 for unsecured>,
  "expectedLoss": <dollar amount>,
  "riskRating": "<low|medium|high|very-high>",
  "recommendation": "<your risk assessment recommendation>"
}

Consider:
- The FICO score and component breakdown from credit analysis
- Debt-to-income ratio
- Loan amount relative to income
- Employment stability
- The bank's risk strategy thresholds`,

  compliance: `You are a Compliance Officer AI agent specializing in KYC/AML verification.

Analyze the loan application for compliance checks. You must respond with ONLY valid JSON in this exact format:
{
  "kycVerified": <true|false>,
  "amlCleared": <true|false>,
  "sanctionsCleared": <true|false>,
  "documentVerification": "<status and details>",
  "recommendation": "<your compliance recommendation>"
}

For this simulation, assume:
- Most applications pass basic KYC (90%+ pass rate realistic)
- AML screening typically clears (95%+ pass rate)
- Sanctions checks rarely flag (98%+ pass rate)
- Be realistic but not overly strict`,

  pricing: `You are a Pricing Strategist AI agent specializing in risk-adjusted loan pricing.

Analyze the loan application and risk metrics to determine appropriate pricing. You must respond with ONLY valid JSON in this exact format:
{
  "baseRate": <current base rate around 5-6%>,
  "riskPremium": <additional rate based on risk, 0-10%>,
  "finalRate": <total interest rate>,
  "monthlyPayment": <calculated monthly payment for 60-month term>,
  "recommendation": "<your pricing recommendation>"
}

Consider:
- Current market base rates (around 5.5%)
- Risk premium based on PD from risk analysis
- The bank's risk premium multiplier from strategy
- Calculate realistic monthly payments`,

  chair: `You are the Committee Chair AI agent responsible for synthesizing all analyses and making final loan decisions.

Review all previous analyses and provide a final committee decision. You must respond with ONLY valid JSON in this exact format:
{
  "finalDecision": "<approved|rejected|review>",
  "approvedAmount": <approved dollar amount or null if rejected>,
  "conditions": [<array of strings listing any conditions>],
  "summary": "<comprehensive summary of the decision rationale>"
}

Decision criteria:
- If compliance fails (KYC/AML/Sanctions) → reject
- If FICO below strategy minimum by >50 points → reject
- If risk rating is "very-high" → reject
- If risk is "high" → consider reducing approved amount
- If rate exceeds 18% → reject as unviable
- Otherwise approve with appropriate conditions

Be decisive and provide clear reasoning.`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { agentType, application, strategy, previousAnalyses, preCalculatedData } = await req.json() as AnalysisRequest;

    if (!agentType || !application || !strategy) {
      throw new Error('Missing required fields: agentType, application, strategy');
    }

    const systemPrompt = AGENT_PROMPTS[agentType];
    if (!systemPrompt) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    // Build context message with application data and previous analyses
    let userMessage = `Analyze this loan application:

Application ID: ${application.id}
Applicant: ${application.applicantName}
Requested Amount: $${application.requestedAmount.toLocaleString()}
Purpose: ${application.purpose}
Annual Income: $${application.annualIncome.toLocaleString()}
Years Employed: ${application.employmentYears}
Existing Debt: $${application.existingDebt.toLocaleString()}

Risk Strategy: ${strategy.name}
- Minimum FICO: ${strategy.minFICO}
- Maximum DTI: ${strategy.maxDTI}%
- Maximum PD: ${(strategy.maxPD * 100).toFixed(1)}%
- Risk Premium Multiplier: ${strategy.riskPremiumMultiplier}x`;

    // Add pre-calculated FICO data for credit agent
    if (agentType === 'credit' && preCalculatedData) {
      userMessage += `

=== PRE-CALCULATED FICO ANALYSIS ===
Preliminary FICO Score: ${preCalculatedData.preliminaryFICO}

COMPONENT BREAKDOWN:
1. Payment History (35% weight):
   - Score: ${preCalculatedData.ficoComponents.paymentHistory.score}/100
   - Rating: ${preCalculatedData.ficoComponents.paymentHistory.rating}
   - Contribution: ${preCalculatedData.ficoComponents.paymentHistory.contribution.toFixed(2)} points
   - Analysis: ${preCalculatedData.ficoComponents.paymentHistory.description}

2. Amounts Owed (30% weight):
   - Score: ${preCalculatedData.ficoComponents.amountsOwed.score}/100
   - Rating: ${preCalculatedData.ficoComponents.amountsOwed.rating}
   - Contribution: ${preCalculatedData.ficoComponents.amountsOwed.contribution.toFixed(2)} points
   - Analysis: ${preCalculatedData.ficoComponents.amountsOwed.description}

3. Length of History (15% weight):
   - Score: ${preCalculatedData.ficoComponents.lengthOfHistory.score}/100
   - Rating: ${preCalculatedData.ficoComponents.lengthOfHistory.rating}
   - Contribution: ${preCalculatedData.ficoComponents.lengthOfHistory.contribution.toFixed(2)} points
   - Analysis: ${preCalculatedData.ficoComponents.lengthOfHistory.description}

4. New Credit (10% weight):
   - Score: ${preCalculatedData.ficoComponents.newCredit.score}/100
   - Rating: ${preCalculatedData.ficoComponents.newCredit.rating}
   - Contribution: ${preCalculatedData.ficoComponents.newCredit.contribution.toFixed(2)} points
   - Analysis: ${preCalculatedData.ficoComponents.newCredit.description}

5. Credit Mix (10% weight):
   - Score: ${preCalculatedData.ficoComponents.creditMix.score}/100
   - Rating: ${preCalculatedData.ficoComponents.creditMix.rating}
   - Contribution: ${preCalculatedData.ficoComponents.creditMix.contribution.toFixed(2)} points
   - Analysis: ${preCalculatedData.ficoComponents.creditMix.description}

COMPONENT SUMMARY: ${preCalculatedData.componentAnalysis}

WHAT-IF SCENARIOS (for reference):
${preCalculatedData.whatIfScenarios.map(s => `- ${s.change}: FICO would be ${s.newFICO} (${s.delta > 0 ? '+' : ''}${s.delta})`).join('\n')}

Please review these calculations and provide your assessment. You may adjust the final FICO by ±20 points if you identify qualitative factors the math missed.`;
    }

    if (previousAnalyses && Object.keys(previousAnalyses).length > 0) {
      userMessage += `\n\nPrevious Analyses:\n${JSON.stringify(previousAnalyses, null, 2)}`;
    }

    console.log(`[${agentType}] Calling Lovable AI for analysis...`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error(`AI gateway error: ${response.status}`, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log(`[${agentType}] Raw AI response:`, content);

    // Parse the JSON response from the AI
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (content.includes('```')) {
      jsonContent = content.replace(/```\n?/g, '');
    }

    const aiAnalysis = JSON.parse(jsonContent.trim());

    console.log(`[${agentType}] Parsed analysis:`, aiAnalysis);

    // For credit agent, merge pre-calculated data with AI analysis
    let analysis = aiAnalysis;
    if (agentType === 'credit' && preCalculatedData) {
      analysis = {
        ficoScore: aiAnalysis.ficoScore,
        ficoComponents: preCalculatedData.ficoComponents,
        preliminaryFICO: preCalculatedData.preliminaryFICO,
        aiAdjustment: aiAnalysis.aiAdjustment || (aiAnalysis.ficoScore - preCalculatedData.preliminaryFICO),
        creditHistory: aiAnalysis.creditHistory,
        paymentHistory: aiAnalysis.paymentHistory,
        creditUtilization: aiAnalysis.creditUtilization,
        recommendation: aiAnalysis.recommendation,
        whatIfScenarios: preCalculatedData.whatIfScenarios,
        componentAnalysis: preCalculatedData.componentAnalysis,
      };
    }

    return new Response(JSON.stringify({ analysis, agentType }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Credit analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
