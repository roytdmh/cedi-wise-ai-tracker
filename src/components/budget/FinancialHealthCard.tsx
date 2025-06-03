
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, PiggyBank, AlertTriangle } from 'lucide-react';

interface FinancialHealthCardProps {
  savingsRate: number;
}

const FinancialHealthCard = ({ savingsRate }: FinancialHealthCardProps) => {
  const getFinancialHealth = () => {
    if (savingsRate >= 20) return { status: 'Excellent', color: 'bg-emerald-500', icon: TrendingUp };
    if (savingsRate >= 10) return { status: 'Good', color: 'bg-blue-500', icon: PiggyBank };
    if (savingsRate >= 0) return { status: 'Fair', color: 'bg-yellow-500', icon: AlertTriangle };
    return { status: 'Poor', color: 'bg-red-500', icon: AlertTriangle };
  };

  const healthStatus = getFinancialHealth();

  return (
    <Card className="border-teal-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-teal-700">
          <healthStatus.icon className="h-5 w-5" />
          Financial Health Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Savings Rate</span>
            <Badge className={`${healthStatus.color} text-white`}>
              {healthStatus.status}
            </Badge>
          </div>
          <Progress value={Math.max(0, Math.min(100, savingsRate))} className="h-3" />
          <p className="text-sm text-gray-600">
            You're saving {savingsRate.toFixed(1)}% of your income. 
            {savingsRate >= 20 && " Excellent work! Keep it up!"}
            {savingsRate >= 10 && savingsRate < 20 && " Good progress! Try to increase your savings rate."}
            {savingsRate >= 0 && savingsRate < 10 && " Consider reducing expenses to improve your savings rate."}
            {savingsRate < 0 && " You're spending more than you earn. Review your expenses urgently."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialHealthCard;
