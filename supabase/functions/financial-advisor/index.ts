import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { message, budgetData, sessionId } = await req.json();

    // Get chat history if sessionId provided
    let chatHistory = [];
    if (sessionId) {
      const { data: sessionData } = await supabase
        .from('chat_sessions')
        .select('messages')
        .eq('id', sessionId)
        .single();
      
      if (sessionData?.messages) {
        chatHistory = sessionData.messages;
      }
    }

    // Calculate financial health score if budget data provided
    let healthScore = null;
    let scoreFactors = {};
    let recommendations = [];

    if (budgetData) {
      healthScore = calculateFinancialHealthScore(budgetData);
      scoreFactors = getScoreFactors(budgetData);
      recommendations = generateRecommendations(budgetData, healthScore);
    }

    // Prepare context for AI
    const systemPrompt = `You are CediWise Financial Advisor, an expert financial consultant specializing in West African markets (Ghana, Nigeria) and international finance. Your role is to:

1. Analyze budgets and spending patterns
2. Provide culturally relevant financial advice for West African contexts
3. Consider local economic conditions, exchange rates, and market prices
4. Offer practical, actionable financial guidance
5. Calculate and explain financial health scores

Key expertise areas:
- Budget optimization and expense management
- Investment strategies suitable for West African markets
- Currency exchange and international money transfers
- Local market price analysis and cost-saving strategies
- Emergency fund planning and savings strategies
- Debt management and financial planning

Always provide specific, actionable advice with concrete examples and consider local economic realities.`;

    let contextMessage = '';
    if (budgetData) {
      const totalExpenses = budgetData.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
      const monthlyIncome = budgetData.income?.amount || 0;
      
      contextMessage = `\n\nCURRENT FINANCIAL CONTEXT:
- Monthly Income: ${budgetData.income?.currency} ${monthlyIncome}
- Total Monthly Expenses: ${budgetData.income?.currency} ${totalExpenses}
- Remaining Budget: ${budgetData.income?.currency} ${monthlyIncome - totalExpenses}
- Financial Health Score: ${healthScore}/100
- Budget Categories: ${budgetData.expenses?.map((e: any) => `${e.category}: ${e.amount}`).join(', ')}`;
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message + contextMessage }
    ];

    console.log('Sending request to OpenAI with', messages.length, 'messages');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error details:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI API');
    }
    
    const aiResponse = data.choices[0].message.content;

    // Update chat session
    const newMessage = { role: 'user', content: message, timestamp: new Date().toISOString() };
    const aiMessage = { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() };
    const updatedHistory = [...chatHistory, newMessage, aiMessage];

    if (sessionId) {
      await supabase
        .from('chat_sessions')
        .update({ 
          messages: updatedHistory,
          context_data: { budgetData, healthScore, scoreFactors }
        })
        .eq('id', sessionId);
    }

    // Store health score if calculated
    if (healthScore !== null && budgetData?.id) {
      await supabase
        .from('financial_health_scores')
        .insert({
          budget_id: budgetData.id,
          health_score: healthScore,
          score_factors: scoreFactors,
          recommendations: recommendations
        });
    }

    return new Response(JSON.stringify({
      success: true,
      response: aiResponse,
      healthScore,
      scoreFactors,
      recommendations,
      sessionId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in financial-advisor function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateFinancialHealthScore(budgetData: any): number {
  const income = budgetData.income?.amount || 0;
  const expenses = budgetData.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
  
  if (income === 0) return 0;
  
  const savingsRate = ((income - expenses) / income) * 100;
  const expenseRatio = (expenses / income) * 100;
  
  let score = 100;
  
  // Deduct points based on expense ratio
  if (expenseRatio > 90) score -= 40;
  else if (expenseRatio > 80) score -= 30;
  else if (expenseRatio > 70) score -= 20;
  else if (expenseRatio > 60) score -= 10;
  
  // Add points for healthy savings rate
  if (savingsRate >= 20) score += 10;
  else if (savingsRate >= 10) score += 5;
  
  // Check for emergency fund (assume 10% should be emergency savings)
  const emergencyFund = budgetData.expenses?.find((e: any) => e.category?.toLowerCase().includes('emergency') || e.category?.toLowerCase().includes('savings'));
  if (!emergencyFund) score -= 15;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getScoreFactors(budgetData: any): any {
  const income = budgetData.income?.amount || 0;
  const expenses = budgetData.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
  
  return {
    income_utilization: Math.round((expenses / income) * 100),
    savings_rate: Math.round(((income - expenses) / income) * 100),
    expense_categories: budgetData.expenses?.length || 0,
    emergency_fund_present: budgetData.expenses?.some((e: any) => 
      e.category?.toLowerCase().includes('emergency') || 
      e.category?.toLowerCase().includes('savings')
    ) || false
  };
}

function generateRecommendations(budgetData: any, healthScore: number): string[] {
  const recommendations = [];
  const income = budgetData.income?.amount || 0;
  const expenses = budgetData.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
  const savingsRate = ((income - expenses) / income) * 100;
  
  if (savingsRate < 10) {
    recommendations.push("Build an emergency fund covering 3-6 months of expenses");
    recommendations.push("Look for ways to reduce non-essential expenses");
  }
  
  if (expenses / income > 0.8) {
    recommendations.push("Your expenses are high relative to income - consider budget optimization");
  }
  
  if (healthScore < 50) {
    recommendations.push("Focus on creating a sustainable budget plan");
    recommendations.push("Consider additional income sources or expense reduction");
  }
  
  recommendations.push("Review and categorize all expenses monthly");
  recommendations.push("Set specific savings goals for the next 6 months");
  
  return recommendations;
}