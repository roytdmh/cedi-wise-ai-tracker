
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, AlertTriangle, PiggyBank } from 'lucide-react';

interface FinancialOverviewProps {
  monthlyIncome: number;
  totalExpenses: number;
  surplus: number;
  currencySymbol: string;
}

const FinancialOverview = ({ monthlyIncome, totalExpenses, surplus, currencySymbol }: FinancialOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-emerald-200 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Income</p>
              <p className="text-2xl font-bold text-emerald-600">
                {currencySymbol}{monthlyIncome.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {currencySymbol}{totalExpenses.toFixed(2)}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Surplus/Deficit</p>
              <p className={`text-2xl font-bold ${surplus >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {currencySymbol}{surplus.toFixed(2)}
              </p>
            </div>
            <PiggyBank className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialOverview;
