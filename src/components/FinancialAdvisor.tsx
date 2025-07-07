import { useFinancialAdvisor } from '@/hooks/useFinancialAdvisor';
import HealthScoreCard from './financial-advisor/HealthScoreCard';
import FinancialAdvisorChat from './financial-advisor/FinancialAdvisorChat';
import SavedBudgetsList from './financial-advisor/SavedBudgetsList';
import RecommendationsList from './financial-advisor/RecommendationsList';
import SuggestedQuestions from './financial-advisor/SuggestedQuestions';

interface FinancialAdvisorProps {
  budgetData?: any; // Keep for backward compatibility but not used anymore
}

const FinancialAdvisor = ({ budgetData }: FinancialAdvisorProps) => {
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