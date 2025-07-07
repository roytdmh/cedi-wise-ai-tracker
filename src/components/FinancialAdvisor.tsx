import { useFinancialAdvisor } from '@/hooks/useFinancialAdvisor';
import { useAccess } from '@/contexts/AccessContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Lock } from 'lucide-react';
import HealthScoreCard from './financial-advisor/HealthScoreCard';
import FinancialAdvisorChat from './financial-advisor/FinancialAdvisorChat';
import SavedBudgetsList from './financial-advisor/SavedBudgetsList';
import RecommendationsList from './financial-advisor/RecommendationsList';
import SuggestedQuestions from './financial-advisor/SuggestedQuestions';

interface FinancialAdvisorProps {
  budgetData?: any; // Keep for backward compatibility but not used anymore
}

const FinancialAdvisor = ({ budgetData }: FinancialAdvisorProps) => {
  const { hasFullAccess } = useAccess();
  const {
    messages,
    loading,
    healthScore,
    recommendations,
    savedBudgets,
    selectedBudget,
    loadingBudgets,
    sendMessage,
    analyzeBudget
  } = useFinancialAdvisor();

  // Show upgrade prompt for demo users
  if (!hasFullAccess) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-amber-100">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-amber-800">AI Financial Advisor - Premium Feature</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-amber-700">
              Get personalized financial advice and insights with our AI-powered advisor. 
              This premium feature requires full access to CediWise.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-amber-600 font-medium">Premium features include:</p>
              <ul className="text-sm text-amber-600 space-y-1">
                <li>• Personalized financial health scoring</li>
                <li>• AI-powered budget recommendations</li>
                <li>• Interactive chat with financial advisor</li>
                <li>• Budget analysis and insights</li>
              </ul>
            </div>
            <Button 
              onClick={() => window.location.href = '/'} 
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Sign Up for Full Access
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Health Score */}
      <HealthScoreCard healthScore={healthScore} />


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <FinancialAdvisorChat 
          messages={messages}
          onSendMessage={sendMessage}
          loading={loading}
        />

        {/* Sidebar with Tools and Information */}
        <div className="space-y-6">
          {/* Suggested Questions */}
          <SuggestedQuestions 
            onSelectQuestion={sendMessage}
            loading={loading}
          />

          {/* AI Recommendations */}
          <RecommendationsList recommendations={recommendations} />

          {/* Saved Budgets */}
          <SavedBudgetsList 
            savedBudgets={savedBudgets}
            selectedBudget={selectedBudget}
            loadingBudgets={loadingBudgets}
            loading={loading}
            onAnalyzeBudget={analyzeBudget}
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialAdvisor;