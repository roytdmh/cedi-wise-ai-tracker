import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface MarketData {
  priceData: any[] | null;
  exchangeData: any[] | null;
}

interface DataInsights {
  marketInsights: string;
  exchangeInsights: string;
}

export async function fetchLocalData(supabase: any): Promise<MarketData> {
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

  return { priceData, exchangeData };
}

export function analyzeMarketData(priceData: any[] | null, exchangeData: any[] | null): DataInsights {
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

  return { marketInsights, exchangeInsights };
}

export function buildContextMessage(budgetData: any, healthScore: number | null, scoreFactors: any, marketInsights: string, exchangeInsights: string): string {
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

  return contextMessage;
}