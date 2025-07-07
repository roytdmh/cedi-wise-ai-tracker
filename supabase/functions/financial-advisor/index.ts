import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { calculateFinancialHealthScore, getScoreFactors, generateRecommendations } from './health-score.ts';
import { fetchLocalData, analyzeMarketData, buildContextMessage } from './data-analysis.ts';

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
    const { priceData, exchangeData } = await fetchLocalData(supabase);

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
    const { marketInsights, exchangeInsights } = analyzeMarketData(priceData, exchangeData);
    
    // Build context message
    const contextMessage = buildContextMessage(budgetData, healthScore, scoreFactors, marketInsights, exchangeInsights);

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

    let aiResponse = '';
    let usedFallback = false;

    try {
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
      
      aiResponse = data.choices[0].message.content;
      console.log('Successfully received AI response');

    } catch (aiError) {
      console.error('AI API failed, using fallback mode:', aiError.message);
      usedFallback = true;
      
      // Generate intelligent fallback response
      aiResponse = generateFallbackResponse(message, budgetData, healthScore, recommendations, marketInsights, exchangeInsights);
    }

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
      sessionId,
      fallback: usedFallback
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

// Intelligent fallback response generator
function generateFallbackResponse(message: string, budgetData: any, healthScore: number | null, recommendations: string[], marketInsights: string, exchangeInsights: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Budget Analysis Response
  if (budgetData && (lowerMessage.includes('analysis') || lowerMessage.includes('budget') || lowerMessage.includes('comprehensive'))) {
    const income = budgetData.income?.amount || 0;
    const expenses = budgetData.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
    const surplus = income - expenses;
    const savingsRate = income > 0 ? ((surplus / income) * 100).toFixed(1) : '0';
    
    let analysis = `📊 **COMPREHENSIVE BUDGET ANALYSIS**\n\n`;
    analysis += `**Financial Overview:**\n`;
    analysis += `• Monthly Income: ${budgetData.income?.currency} ${income}\n`;
    analysis += `• Total Expenses: ${budgetData.income?.currency} ${expenses}\n`;
    analysis += `• Net Surplus/Deficit: ${budgetData.income?.currency} ${surplus}\n`;
    analysis += `• Savings Rate: ${savingsRate}%\n\n`;
    
    if (healthScore !== null) {
      analysis += `**Health Score: ${healthScore}/100**\n`;
      if (healthScore >= 80) analysis += `🟢 Excellent financial health! You're managing money very well.\n\n`;
      else if (healthScore >= 60) analysis += `🟡 Good financial health with room for improvement.\n\n`;
      else if (healthScore >= 40) analysis += `🟠 Moderate financial health - focus on key improvements.\n\n`;
      else analysis += `🔴 Financial health needs attention - prioritize essential changes.\n\n`;
    }
    
    analysis += `**Expense Breakdown:**\n`;
    if (budgetData.expenses && budgetData.expenses.length > 0) {
      budgetData.expenses.forEach((exp: any) => {
        const percentage = income > 0 ? ((exp.amount / income) * 100).toFixed(1) : '0';
        analysis += `• ${exp.category}: ${budgetData.income?.currency} ${exp.amount} (${percentage}%)\n`;
      });
    } else {
      analysis += `• No expense categories found\n`;
    }
    
    analysis += `\n**Key Recommendations:**\n`;
    if (recommendations.length > 0) {
      recommendations.forEach(rec => analysis += `• ${rec}\n`);
    } else {
      // Generate basic recommendations based on budget data
      if (surplus < 0) {
        analysis += `• **Urgent:** Reduce expenses or increase income - you're spending more than you earn\n`;
        analysis += `• Review and cut non-essential expenses immediately\n`;
        analysis += `• Consider additional income sources\n`;
      } else if (parseFloat(savingsRate) < 10) {
        analysis += `• Aim to save at least 10-20% of your income\n`;
        analysis += `• Build an emergency fund covering 3-6 months of expenses\n`;
        analysis += `• Look for opportunities to reduce discretionary spending\n`;
      } else {
        analysis += `• Great job maintaining a positive savings rate!\n`;
        analysis += `• Consider investing your surplus for long-term growth\n`;
        analysis += `• Review insurance coverage to protect your assets\n`;
      }
    }
    
    if (marketInsights) {
      analysis += `\n**Market Insights:**${marketInsights}`;
    }
    
    if (exchangeInsights) {
      analysis += `\n**Currency Trends:**${exchangeInsights}`;
    }
    
    analysis += `\n\n*Note: This analysis is generated using built-in financial logic while our AI advisor is temporarily unavailable.*`;
    
    return analysis;
  }
  
  // Savings advice
  if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
    return `💰 **SAVINGS STRATEGIES**\n\n` +
           `**Emergency Fund Priority:**\n` +
           `• Build 3-6 months of expenses as emergency fund\n` +
           `• Keep emergency funds in easily accessible accounts\n\n` +
           `**Savings Rate Guidelines:**\n` +
           `• Aim for 20% savings rate (50/30/20 rule)\n` +
           `• Start with at least 10% if 20% seems difficult\n` +
           `• Automate savings to make it consistent\n\n` +
           `**High-Impact Saving Tips:**\n` +
           `• Track expenses for 30 days to identify spending patterns\n` +
           `• Reduce subscription services and memberships you don't use\n` +
           `• Cook at home more often - can save 20-30% on food costs\n` +
           `• Use price comparison apps when shopping\n` +
           `• Consider generic brands for non-essential items\n\n` +
           `*Built-in financial guidance while AI advisor is unavailable.*`;
  }
  
  // Investment advice
  if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
    return `📈 **INVESTMENT GUIDANCE**\n\n` +
           `**Before Investing:**\n` +
           `• Ensure you have 3-6 months emergency fund\n` +
           `• Pay off high-interest debt (>8% interest rates)\n` +
           `• Have stable income and budget surplus\n\n` +
           `**Investment Basics:**\n` +
           `• Start with low-cost index funds for diversification\n` +
           `• Consider your risk tolerance and time horizon\n` +
           `• Don't invest money you'll need within 5 years\n\n` +
           `**For Ghana/West Africa:**\n` +
           `• Consider local stock exchanges and government bonds\n` +
           `• Research mutual funds from reputable local institutions\n` +
           `• Dollar-cost averaging can reduce volatility risk\n` +
           `• Consider inflation-protected investments\n\n` +
           `*Built-in investment guidance while AI advisor is unavailable.*`;
  }
  
  // Health score improvement
  if (lowerMessage.includes('health score') || lowerMessage.includes('improve')) {
    let response = `🏥 **FINANCIAL HEALTH IMPROVEMENT**\n\n`;
    
    if (healthScore !== null) {
      response += `**Current Score: ${healthScore}/100**\n\n`;
      
      if (healthScore < 50) {
        response += `**Priority Actions (Score <50):**\n` +
                   `• Create and stick to a monthly budget\n` +
                   `• Reduce expenses to match or be below income\n` +
                   `• Build even a small emergency fund ($100-500 to start)\n` +
                   `• Track all spending for better awareness\n\n`;
      } else if (healthScore < 70) {
        response += `**Improvement Actions (Score 50-70):**\n` +
                   `• Increase savings rate to 15-20% of income\n` +
                   `• Build emergency fund to 3+ months of expenses\n` +
                   `• Optimize expense categories for better efficiency\n` +
                   `• Consider additional income streams\n\n`;
      } else {
        response += `**Optimization Actions (Score 70+):**\n` +
                   `• Fine-tune investment allocation\n` +
                   `• Consider tax-advantaged accounts\n` +
                   `• Explore passive income opportunities\n` +
                   `• Review and optimize insurance coverage\n\n`;
      }
    }
    
    response += `**Universal Health Boosters:**\n` +
               `• Maintain 6+ months emergency fund\n` +
               `• Keep housing costs under 30% of income\n` +
               `• Save at least 20% of income consistently\n` +
               `• Avoid high-interest debt\n` +
               `• Regular financial reviews and adjustments\n\n` +
               `*Built-in financial guidance while AI advisor is unavailable.*`;
    
    return response;
  }
  
  // Currency and exchange rate advice
  if (lowerMessage.includes('currency') || lowerMessage.includes('exchange') || lowerMessage.includes('dollar')) {
    let response = `💱 **CURRENCY & EXCHANGE GUIDANCE**\n\n`;
    
    response += `**Currency Strategy for Ghana:**\n` +
               `• Diversify between local (GHS) and stable foreign currency (USD)\n` +
               `• Keep emergency fund in local currency for immediate access\n` +
               `• Consider USD savings for long-term goals and inflation protection\n\n` +
               `**Exchange Rate Considerations:**\n` +
               `• Monitor trends but don't try to time the market perfectly\n` +
               `• Use dollar-cost averaging for foreign currency accumulation\n` +
               `• Avoid frequent currency switching due to transaction costs\n\n`;
    
    if (exchangeInsights) {
      response += `**Current Market Data:**${exchangeInsights}\n\n`;
    }
    
    response += `**Risk Management:**\n` +
               `• Never put all savings in one currency\n` +
               `• Consider currency impact on major purchases\n` +
               `• Use official exchange platforms for better rates\n\n` +
               `*Built-in currency guidance while AI advisor is unavailable.*`;
    
    return response;
  }
  
  // Budget optimization
  if (lowerMessage.includes('optimize') || lowerMessage.includes('budget')) {
    return `⚡ **BUDGET OPTIMIZATION**\n\n` +
           `**50/30/20 Budget Rule:**\n` +
           `• 50% - Needs (housing, utilities, groceries, transport)\n` +
           `• 30% - Wants (entertainment, dining out, hobbies)\n` +
           `• 20% - Savings and debt repayment\n\n` +
           `**Optimization Strategies:**\n` +
           `• Review subscriptions monthly - cancel unused services\n` +
           `• Negotiate better rates for utilities and services\n` +
           `• Use the envelope method for discretionary spending\n` +
           `• Automate bill payments to avoid late fees\n\n` +
           `**Cost Reduction Areas:**\n` +
           `• Transportation: Use public transport, carpool, or walk when possible\n` +
           `• Food: Meal planning and bulk buying can save 20-30%\n` +
           `• Utilities: Energy-efficient appliances and habits\n` +
           `• Entertainment: Free/low-cost activities and community events\n\n` +
           `*Built-in budget guidance while AI advisor is unavailable.*`;
  }
  
  // General financial advice
  return `🤖 **FINANCIAL GUIDANCE (FALLBACK MODE)**\n\n` +
         `I'm currently operating in simplified mode while our full AI advisor is temporarily unavailable. Here's some general financial guidance:\n\n` +
         `**Key Financial Principles:**\n` +
         `• Track your income and expenses monthly\n` +
         `• Build an emergency fund (3-6 months of expenses)\n` +
         `• Save at least 10-20% of your income\n` +
         `• Avoid high-interest debt when possible\n` +
         `• Diversify your savings and investments\n\n` +
         `**For Specific Questions:**\n` +
         `• Budget analysis: Ask about "comprehensive budget analysis"\n` +
         `• Savings help: Ask about "saving strategies"\n` +
         `• Investment guidance: Ask about "investment advice"\n` +
         `• Health score: Ask "how to improve financial health score"\n\n` +
         `Please try again later for full AI-powered analysis, or ask a specific question for more detailed guidance!\n\n` +
         `*Fallback mode active - AI advisor temporarily unavailable*`;
}