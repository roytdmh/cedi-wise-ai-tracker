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
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      console.error('GROQ_API_KEY environment variable not found');
      throw new Error('Groq API key not configured');
    }
    console.log('Groq API key found, length:', groqApiKey.length);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const requestBody = await req.json();
    console.log('Request body parsed successfully:', { 
      hasMessage: !!requestBody.message, 
      hasBudgetData: !!requestBody.budgetData, 
      hasSessionId: !!requestBody.sessionId 
    });
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

    // Prepare messages for Groq
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message + contextMessage }
    ];

    console.log('Sending request to Groq with', messages.length, 'messages');
    console.log('Using model: llama-3.1-70b-versatile');

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
      }),
    });

    console.log('Groq API response status:', response.status);
    
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
    
    // Provide fallback response based on error type
    let fallbackResponse = null;
    let errorType = 'unknown';
    
    if (error.message.includes('insufficient_quota') || error.message.includes('quota')) {
      errorType = 'quota_exceeded';
      fallbackResponse = generateFallbackAdvice(budgetData, 'quota');
    } else if (error.message.includes('rate_limit')) {
      errorType = 'rate_limit';
      fallbackResponse = generateFallbackAdvice(budgetData, 'rate_limit');
    } else if (error.message.includes('Groq')) {
      errorType = 'api_error';
      fallbackResponse = generateFallbackAdvice(budgetData, 'api_error');
    }
    
    if (fallbackResponse) {
      // Update chat session with fallback response
      const newMessage = { role: 'user', content: message, timestamp: new Date().toISOString() };
      const fallbackMessage = { role: 'assistant', content: fallbackResponse, timestamp: new Date().toISOString() };
      const updatedHistory = [...chatHistory, newMessage, fallbackMessage];

      if (sessionId) {
        await supabase
          .from('chat_sessions')
          .update({ 
            messages: updatedHistory,
            context_data: { budgetData, healthScore, scoreFactors, error: errorType }
          })
          .eq('id', sessionId);
      }

      return new Response(JSON.stringify({
        success: true,
        response: fallbackResponse,
        healthScore,
        scoreFactors,
        recommendations,
        sessionId,
        fallback: true,
        errorType
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      errorType 
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

function generateFallbackAdvice(budgetData: any, errorType: string): string {
  const income = budgetData?.income?.amount || 0;
  const expenses = budgetData?.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
  const currency = budgetData?.income?.currency || 'GHS';
  const remaining = income - expenses;
  
  let fallbackMessage = '';
  
  if (errorType === 'quota') {
    fallbackMessage = '⚠️ AI service temporarily unavailable due to high demand. Here\'s some basic financial guidance:\n\n';
  } else if (errorType === 'rate_limit') {
    fallbackMessage = '⚠️ Please wait a moment before asking again. Here\'s some immediate advice:\n\n';
  } else {
    fallbackMessage = '⚠️ AI advisor temporarily unavailable. Here are some general recommendations:\n\n';
  }
  
  if (budgetData) {
    fallbackMessage += `📊 **Current Budget Analysis:**\n`;
    fallbackMessage += `• Monthly Income: ${currency} ${income.toLocaleString()}\n`;
    fallbackMessage += `• Total Expenses: ${currency} ${expenses.toLocaleString()}\n`;
    fallbackMessage += `• Remaining: ${currency} ${remaining.toLocaleString()}\n\n`;
    
    if (remaining < 0) {
      fallbackMessage += `🚨 **Urgent:** You're spending ${currency} ${Math.abs(remaining).toLocaleString()} more than you earn!\n\n`;
      fallbackMessage += `**Immediate Actions:**\n`;
      fallbackMessage += `• Review and cut non-essential expenses immediately\n`;
      fallbackMessage += `• Look for additional income sources\n`;
      fallbackMessage += `• Avoid taking on new debt\n\n`;
    } else if (remaining < income * 0.1) {
      fallbackMessage += `⚠️ **Low Savings:** You're only saving ${Math.round((remaining/income)*100)}% of your income.\n\n`;
      fallbackMessage += `**Recommendations:**\n`;
      fallbackMessage += `• Aim to save at least 10-20% of your income\n`;
      fallbackMessage += `• Build an emergency fund of 3-6 months expenses\n`;
      fallbackMessage += `• Review your expense categories for optimization\n\n`;
    } else {
      fallbackMessage += `✅ **Good News:** You're saving ${Math.round((remaining/income)*100)}% of your income!\n\n`;
      fallbackMessage += `**Keep Building:**\n`;
      fallbackMessage += `• Continue building your emergency fund\n`;
      fallbackMessage += `• Consider investment opportunities\n`;
      fallbackMessage += `• Plan for long-term financial goals\n\n`;
    }
  }
  
  fallbackMessage += `💡 **General Financial Tips for West Africa:**\n`;
  fallbackMessage += `• Diversify income sources when possible\n`;
  fallbackMessage += `• Keep some savings in stable foreign currency (USD/EUR)\n`;
  fallbackMessage += `• Take advantage of mobile money savings features\n`;
  fallbackMessage += `• Consider local investment opportunities like agriculture or real estate\n\n`;
  fallbackMessage += `• Track market prices for essential goods to optimize shopping\n`;
  fallbackMessage += `• Build relationships with local financial institutions\n\n`;
  
  fallbackMessage += `🔄 Please try again in a few minutes for personalized AI advice.`;
  
  return fallbackMessage;
}