import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';

interface HealthScoreCardProps {
  healthScore: number | null;
}

const HealthScoreCard = ({ healthScore }: HealthScoreCardProps) => {
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getHealthScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-4 w-4" />;
    if (score >= 60) return <BarChart3 className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <Card className="border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Brain className="h-5 w-5" />
          CediWise Financial Advisor
        </CardTitle>
        {healthScore !== null && (
          <div className="flex items-center gap-4 mt-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full animate-scale-in ${getHealthScoreColor(healthScore)}`}>
              {getHealthScoreIcon(healthScore)}
              <span className="font-semibold">Health Score: {healthScore}/100</span>
            </div>
          </div>
        )}
      </CardHeader>
    </Card>
  );
};

export default HealthScoreCard;