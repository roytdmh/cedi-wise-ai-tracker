
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, TrendingDown, ArrowLeftRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ExchangeRate {
  currency: string;
  rate: number;
  change: number;
  flag: string;
}

const ExchangeRates = () => {
  const { toast } = useToast();
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('GHS');
  const [amount, setAmount] = useState('100');
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const currencies = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'GHS', name: 'Ghana Cedi', flag: '🇬🇭' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  ];

  // Mock exchange rates (in a real app, you'd fetch from an API like exchangerate-api.com)
  const mockRates = {
    USD: { GHS: 12.45, EUR: 0.85, GBP: 0.73, NGN: 461.50, CAD: 1.25, JPY: 110.25, AUD: 1.35 },
    GHS: { USD: 0.080, EUR: 0.068, GBP: 0.059, NGN: 37.08, CAD: 0.10, JPY: 8.86, AUD: 0.108 },
    EUR: { USD: 1.18, GHS: 14.65, GBP: 0.86, NGN: 543.77, CAD: 1.47, JPY: 130.10, AUD: 1.59 },
    GBP: { USD: 1.37, GHS: 17.05, EUR: 1.16, NGN: 632.46, CAD: 1.71, JPY: 151.24, AUD: 1.85 },
    NGN: { USD: 0.0022, GHS: 0.027, EUR: 0.0018, GBP: 0.0016, CAD: 0.0027, JPY: 0.24, AUD: 0.0029 },
  };

  const fetchExchangeRates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-exchange-rates', {
        body: { base: baseCurrency }
      });

      if (error) throw error;

      if (data.success) {
        const ratesData: ExchangeRate[] = data.rates.map((rate: any) => ({
          currency: rate.currency,
          rate: rate.rate,
          change: rate.change,
          flag: currencies.find(c => c.code === rate.currency)?.flag || '🏳️'
        }));

        setRates(ratesData);
        setLastUpdated(new Date(data.lastUpdated));
        
        toast({
          title: "Live Rates Updated",
          description: "Exchange rates refreshed from live API"
        });
      } else {
        throw new Error(data.error || 'Failed to fetch rates');
      }
    } catch (error) {
      console.error('Exchange rates error:', error);
      // Fallback to mock data
      const baseRates = mockRates[baseCurrency as keyof typeof mockRates] || {};
      const ratesData: ExchangeRate[] = Object.entries(baseRates).map(([currency, rate]) => ({
        currency,
        rate: rate as number,
        change: (Math.random() - 0.5) * 2,
        flag: currencies.find(c => c.code === currency)?.flag || '🏳️'
      }));

      setRates(ratesData);
      setLastUpdated(new Date());
      
      toast({
        title: "Using Cached Rates",
        description: "Live data unavailable, showing cached rates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, [baseCurrency]);

  const convertedAmount = () => {
    const rate = rates.find(r => r.currency === targetCurrency)?.rate || 1;
    return (parseFloat(amount) * rate).toFixed(2);
  };

  const getTargetCurrency = () => {
    return currencies.find(c => c.code === targetCurrency);
  };

  return (
    <div className="space-y-6">
      {/* Currency Converter */}
      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <ArrowLeftRight className="h-5 w-5" />
            Currency Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="from">From</Label>
              <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.flag} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="to">To</Label>
              <Select value={targetCurrency} onValueChange={setTargetCurrency}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.flag} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fetchExchangeRates} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Update
              </Button>
            </div>
          </div>
          
          {/* Conversion Result */}
          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Conversion Result</p>
              <p className="text-3xl font-bold text-emerald-600">
                {amount} {baseCurrency} = {convertedAmount()} {targetCurrency}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {getTargetCurrency()?.flag} {getTargetCurrency()?.name}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rates Table */}
      <Card className="border-teal-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-teal-700">
              Live Exchange Rates (Base: {baseCurrency})
            </CardTitle>
            {lastUpdated && (
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rates.map((rate) => (
              <Card key={rate.currency} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{rate.flag}</span>
                      <div>
                        <p className="font-semibold">{rate.currency}</p>
                        <p className="text-sm text-gray-600">
                          {currencies.find(c => c.code === rate.currency)?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{rate.rate.toFixed(4)}</p>
                      <div className={`flex items-center gap-1 text-sm ${
                        rate.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {rate.change >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(rate.change).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeRates;
