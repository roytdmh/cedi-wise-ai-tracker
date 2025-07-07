import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface RecommendationsListProps {
  recommendations: string[];
}

const RecommendationsList = ({ recommendations }: RecommendationsListProps) => {
  if (recommendations.length === 0) return null;

  return (
    <Card className="shadow-lg border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-700">
          <TrendingUp className="h-5 w-5" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <div 
              key={index} 
              className="flex items-start gap-2 p-2 bg-emerald-50 rounded-lg animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-emerald-700">{rec}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationsList;