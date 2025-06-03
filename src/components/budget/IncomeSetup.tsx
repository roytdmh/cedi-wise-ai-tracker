
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign } from 'lucide-react';

interface Income {
  amount: number;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  currency: string;
}

interface IncomeSetupProps {
  income: Income;
  onIncomeChange: (income: Income) => void;
}

const IncomeSetup = ({ income, onIncomeChange }: IncomeSetupProps) => {
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'GHS', name: 'Ghana Cedi', symbol: '₵' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  ];

  return (
    <Card className="border-blue-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <DollarSign className="h-5 w-5" />
          Income Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="income-amount">Income Amount</Label>
            <Input
              id="income-amount"
              type="number"
              placeholder="Enter amount"
              value={income.amount || ''}
              onChange={(e) => onIncomeChange({...income, amount: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={income.frequency} onValueChange={(value: any) => onIncomeChange({...income, frequency: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select value={income.currency} onValueChange={(value) => onIncomeChange({...income, currency: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeSetup;
