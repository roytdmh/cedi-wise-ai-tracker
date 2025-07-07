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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get base currency from request body (default to USD)
    const requestBody = await req.json();
    const baseCurrency = requestBody.base || 'USD';

    // Using exchangerate-api.com (free tier: 1500 requests/month)
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;
    
    console.log(`Fetching exchange rates for base currency: ${baseCurrency}`);
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Store data in database
    const exchangeData = [];
    const targetCurrencies = ['USD', 'GHS', 'EUR', 'GBP', 'NGN', 'CAD', 'JPY', 'AUD'];
    
    for (const currency of targetCurrencies) {
      if (currency !== baseCurrency && data.rates[currency]) {
        exchangeData.push({
          base_currency: baseCurrency,
          target_currency: currency,
          rate: data.rates[currency],
          source: 'exchangerate-api.com'
        });
      }
    }

    // Insert into database
    if (exchangeData.length > 0) {
      const { error: insertError } = await supabase
        .from('exchange_rates')
        .insert(exchangeData);
      
      if (insertError) {
        console.error('Error inserting exchange rate history:', insertError);
      } else {
        console.log(`Inserted ${exchangeData.length} exchange rate records`);
      }
    }

    // Return processed data
    const processedRates = targetCurrencies
      .filter(currency => currency !== baseCurrency && data.rates[currency])
      .map(currency => ({
        currency,
        rate: data.rates[currency],
        change: (Math.random() - 0.5) * 4, // Mock change for demo
        timestamp: data.date
      }));

    return new Response(JSON.stringify({
      success: true,
      baseCurrency,
      rates: processedRates,
      lastUpdated: data.date
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-exchange-rates function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});