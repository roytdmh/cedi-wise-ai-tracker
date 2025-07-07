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

  let requestBody: any = {};
  
  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      console.error('GROQ_API_KEY environment variable not found');
      throw new Error('Groq API key not configured');
    }
    console.log('Groq API key found, length:', groqApiKey.length);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse request body with error handling
    try {
      requestBody = await req.json();
      console.log('Request body parsed successfully:', { 
        hasMessage: !!requestBody.message, 
        hasBudgetData: !!requestBody.budgetData, 
        hasSessionId: !!requestBody.sessionId 
      });
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, budgetData, sessionId } = requestBody;

    // Handle connection test requests
    if (message === '__TEST_CONNECTION__') {
      console.log('Processing connection test request');
      
      // Quick health check - test Groq API key
      try {
        const testResponse = await fetch('https://api.groq.com/openai/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!testResponse.ok) {
          const errorText = await testResponse.text();
          console.error('Groq API health check failed:', testResponse.status, errorText);
          throw new Error(`Groq API health check failed: ${testResponse.status}`);
        }
        
        console.log('Connection test successful - Groq API accessible');
        return new Response(JSON.stringify({
          success: true,
          response: 'Connection test successful. AI advisor is working properly.',
          healthCheck: {
            groqApiAvailable: true,
            timestamp: new Date().toISOString()
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Connection test failed:', error);
        return new Response(JSON.stringify({
          success: false,
          error: `Connection test failed: ${error.message}`,
          healthCheck: {
            groqApiAvailable: false,
            timestamp: new Date().toISOString(),
            error: error.message
          }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Validate required message parameter
    if (!message || typeof message !== 'string') {
      console.error('Invalid message parameter:', { message, type: typeof message });
      return new Response(JSON.stringify({
        success: false,
        error: 'Message parameter is required and must be a string'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    // Fetch local data for intelligent analysis
    console.log('Fetching local data for AI context...');
    
    // Get recent price history (last 30 days)
    const { data: priceData } = await supabase
      .from('price_history')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })
      .limit(100);

    // Get recent exchange rates (last 7 days)
    const { data: exchangeData } = await supabase
      .from('exchange_rate_history')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })
      .limit(50);

    console.log('Local data fetched:', {
      priceDataCount: priceData?.length || 0,
      exchangeDataCount: exchangeData?.length || 0
    });

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
    const systemPrompt = `You are CediWise Financial Advisor, an expert financial consultant specializing in West African markets (Ghana, Nigeria) and international finance. 

CORE CAPABILITIES:
- Advanced budget analysis using real financial data
- Real-time market price intelligence and cost optimization 
- Exchange rate analysis and currency strategy
- Data-driven financial health assessment
- Investment and savings strategies for West African contexts

DATA SOURCES AVAILABLE:
- Current user budget data with income and expense breakdown
- Historical price data for essential goods and commodities
- Real-time exchange rate trends and analysis
- Financial health scoring with quantified factors

ANALYSIS APPROACH:
1. Use actual data to provide specific, quantified recommendations
2. Compare user expenses against market prices for optimization opportunities
3. Analyze exchange rate trends for currency decisions
4. Calculate precise financial ratios and health metrics
5. Provide concrete action steps with specific amounts and timelines

RESPONSE STYLE:
- Always reference specific data points in your analysis
- Provide quantified recommendations (exact amounts, percentages, timelines)
- Use comparative analysis against market trends
- Include risk assessments based on data patterns
- Focus on actionable, measurable steps

Remember: Base all advice on the actual data provided - never give generic responses.`;

    // Analyze local data for intelligent insights
    let marketInsights = '';
    let exchangeInsights = '';
    
    if (priceData && priceData.length > 0) {
      // Analyze price trends
      const recentPrices = priceData.slice(0, 20);
      const categories = [...new Set(recentPrices.map(item => item.category))];
      const priceAnalysis = categories.map(cat => {
        const catItems = recentPrices.filter(item => item.category === cat);
        const avgPrice = catItems.reduce((sum, item) => sum + item.price, 0) / catItems.length;
        const recentChanges = catItems.filter(item => item.change_percent !== null);
        const avgChange = recentChanges.length > 0 ? 
          recentChanges.reduce((sum, item) => sum + item.change_percent, 0) / recentChanges.length : 0;
        return { category: cat, avgPrice: avgPrice.toFixed(2), avgChange: avgChange.toFixed(1), count: catItems.length };
      });
      
      marketInsights = `\n\nMARKET PRICE INTELLIGENCE (Last 30 Days):
${priceAnalysis.map(cat => 
`• ${cat.category}: Avg price trend ${cat.avgChange > 0 ? '+' : ''}${cat.avgChange}% (${cat.count} items tracked)`
).join('\n')}`;
    }
    
    if (exchangeData && exchangeData.length > 0) {
      // Analyze exchange rate trends
      const currencies = [...new Set(exchangeData.map(rate => `${rate.base_currency}/${rate.target_currency}`))];
      const rateAnalysis = currencies.slice(0, 5).map(pair => {
        const rates = exchangeData.filter(rate => `${rate.base_currency}/${rate.target_currency}` === pair);
        const latestRate = rates[0]?.rate || 0;
        const avgChange = rates.filter(r => r.change_percent !== null)
          .reduce((sum, r) => sum + r.change_percent, 0) / rates.length || 0;
        return { pair, latestRate: latestRate.toFixed(4), avgChange: avgChange.toFixed(2) };
      });
      
      exchangeInsights = `\n\nEXCHANGE RATE INTELLIGENCE (Last 7 Days):
${rateAnalysis.map(rate => 
`• ${rate.pair}: ${rate.latestRate} (${rate.avgChange > 0 ? '+' : ''}${rate.avgChange}% trend)`
).join('\n')}`;
    }

    let contextMessage = '';
    if (budgetData) {
      const totalExpenses = budgetData.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
      const monthlyIncome = budgetData.income?.amount || 0;
      
      contextMessage = `\n\nCURRENT FINANCIAL CONTEXT:
- Monthly Income: ${budgetData.income?.currency} ${monthlyIncome}
- Total Monthly Expenses: ${budgetData.income?.currency} ${totalExpenses}
- Remaining Budget: ${budgetData.income?.currency} ${monthlyIncome - totalExpenses}
- Financial Health Score: ${healthScore}/100
- Score Factors: Income Utilization ${scoreFactors.income_utilization}%, Savings Rate ${scoreFactors.savings_rate}%
- Budget Categories: ${budgetData.expenses?.map((e: any) => `${e.category}: ${budgetData.income?.currency} ${e.amount}`).join(', ')}${marketInsights}${exchangeInsights}`;
    } else {
      // Include market data even without budget data
      contextMessage = marketInsights + exchangeInsights;
    }

    // Prepare messages for Groq
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message + contextMessage }
    ];

    console.log('Sending request to Groq with', messages.length, 'messages');
    console.log('Using model: llama-3.1-70b-versatile');
    console.log('Request details:', {
      messageCount: messages.length,
      model: 'llama-3.1-70b-versatile',
      temperature: 0.7,
      maxTokens: 1500
    });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500,
        stream: false
      }),
    });

    console.log('Groq API response status:', response.status);
    console.log('Groq API response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Groq response structure:', data);
      throw new Error('Invalid response from Groq API');
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
      error: `AI advisor error: ${error.message}. Please try again or check your connection.`
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
});