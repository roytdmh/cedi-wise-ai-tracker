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

    // Get parameters from request body
    const requestBody = await req.json();
    const country = requestBody.country || 'Ghana';
    const priceType = requestBody.type || 'retail'; // retail or wholesale

    console.log(`Fetching ${priceType} price data for: ${country}`);

    // Enhanced mock data with more realistic pricing and wholesale/retail differentiation
    const priceDataByCountry: { [key: string]: any[] } = {
      Ghana: [
        { item: 'Rice (1kg)', category: 'Food & Beverages', retail: 8.50, wholesale: 6.80, currency: 'GHS', unit: 'kg' },
        { item: 'Bread (Local)', category: 'Food & Beverages', retail: 3.00, wholesale: 2.20, currency: 'GHS', unit: 'loaf' },
        { item: 'Chicken (1kg)', category: 'Food & Beverages', retail: 25.00, wholesale: 20.00, currency: 'GHS', unit: 'kg' },
        { item: 'Tomatoes (1kg)', category: 'Food & Beverages', retail: 4.50, wholesale: 3.20, currency: 'GHS', unit: 'kg' },
        { item: 'Cooking Oil (1L)', category: 'Food & Beverages', retail: 12.00, wholesale: 9.50, currency: 'GHS', unit: 'liter' },
        { item: 'Gasoline', category: 'Transportation', retail: 13.50, wholesale: 12.80, currency: 'GHS', unit: 'liter' },
        { item: 'Taxi (Local)', category: 'Transportation', retail: 2.50, wholesale: 2.00, currency: 'GHS', unit: 'per km' },
        { item: 'Electricity', category: 'Utilities', retail: 0.95, wholesale: 0.78, currency: 'GHS', unit: 'kWh' },
        { item: 'Water', category: 'Utilities', retail: 0.45, wholesale: 0.32, currency: 'GHS', unit: 'cubic meter' },
        { item: 'Cement (50kg)', category: 'Construction', retail: 28.00, wholesale: 24.50, currency: 'GHS', unit: '50kg bag' },
      ],
      Nigeria: [
        { item: 'Rice (1kg)', category: 'Food & Beverages', retail: 450, wholesale: 380, currency: 'NGN', unit: 'kg' },
        { item: 'Bread (Local)', category: 'Food & Beverages', retail: 200, wholesale: 150, currency: 'NGN', unit: 'loaf' },
        { item: 'Chicken (1kg)', category: 'Food & Beverages', retail: 1200, wholesale: 1000, currency: 'NGN', unit: 'kg' },
        { item: 'Tomatoes (1kg)', category: 'Food & Beverages', retail: 300, wholesale: 220, currency: 'NGN', unit: 'kg' },
        { item: 'Cooking Oil (1L)', category: 'Food & Beverages', retail: 650, wholesale: 520, currency: 'NGN', unit: 'liter' },
        { item: 'Gasoline', category: 'Transportation', retail: 617, wholesale: 590, currency: 'NGN', unit: 'liter' },
        { item: 'Electricity', category: 'Utilities', retail: 45, wholesale: 38, currency: 'NGN', unit: 'kWh' },
        { item: 'Cement (50kg)', category: 'Construction', retail: 3500, wholesale: 3100, currency: 'NGN', unit: '50kg bag' },
      ],
      'United States': [
        { item: 'Rice (1kg)', category: 'Food & Beverages', retail: 3.50, wholesale: 2.80, currency: 'USD', unit: 'kg' },
        { item: 'Bread (Local)', category: 'Food & Beverages', retail: 2.80, wholesale: 2.20, currency: 'USD', unit: 'loaf' },
        { item: 'Chicken (1kg)', category: 'Food & Beverages', retail: 6.50, wholesale: 5.20, currency: 'USD', unit: 'kg' },
        { item: 'Gasoline', category: 'Transportation', retail: 3.45, wholesale: 3.20, currency: 'USD', unit: 'gallon' },
        { item: 'Electricity', category: 'Utilities', retail: 0.13, wholesale: 0.10, currency: 'USD', unit: 'kWh' },
      ],
      'United Kingdom': [
        { item: 'Rice (1kg)', category: 'Food & Beverages', retail: 2.20, wholesale: 1.80, currency: 'GBP', unit: 'kg' },
        { item: 'Bread (Local)', category: 'Food & Beverages', retail: 1.50, wholesale: 1.20, currency: 'GBP', unit: 'loaf' },
        { item: 'Chicken (1kg)', category: 'Food & Beverages', retail: 4.80, wholesale: 4.00, currency: 'GBP', unit: 'kg' },
        { item: 'Gasoline', category: 'Transportation', retail: 1.45, wholesale: 1.35, currency: 'GBP', unit: 'liter' },
        { item: 'Electricity', category: 'Utilities', retail: 0.28, wholesale: 0.24, currency: 'GBP', unit: 'kWh' },
      ]
    };

    const countryData = priceDataByCountry[country] || priceDataByCountry['Ghana'];
    
    // Process data for storage and return
    const processedData = countryData.map((item, index) => {
      const price = priceType === 'wholesale' ? item.wholesale : item.retail;
      const changePercent = (Math.random() - 0.5) * 6; // -3% to +3% change
      
      return {
        id: `${country}-${index}`,
        item: item.item,
        category: item.category,
        country,
        price,
        currency: item.currency,
        price_type: priceType,
        unit: item.unit,
        change: changePercent,
        lastUpdated: new Date().toISOString()
      };
    });

    // Store in database
    const priceData = processedData.map(item => ({
      item_name: item.item,
      category: item.category,
      price: item.price,
      currency: item.currency,
      location: item.country,
      source: 'internal-data'
    }));

    const { error: insertError } = await supabase
      .from('price_data')
      .insert(priceData);

    if (insertError) {
      console.error('Error inserting price history:', insertError);
    } else {
      console.log(`Inserted ${priceData.length} price records for ${country}`);
    }

    return new Response(JSON.stringify({
      success: true,
      country,
      priceType,
      data: processedData,
      lastUpdated: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-price-data function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});