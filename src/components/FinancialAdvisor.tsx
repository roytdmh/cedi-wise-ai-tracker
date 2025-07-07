import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useFinancialAdvisor } from '@/hooks/useFinancialAdvisor';
import HealthScoreCard from './financial-advisor/HealthScoreCard';
import FinancialAdvisorChat from './financial-advisor/FinancialAdvisorChat';
import ConnectionStatus from './financial-advisor/ConnectionStatus';
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
    retryCount,
    lastError,
    isTestingConnection,
    connectionStatus,
    savedBudgets,
    selectedBudget,
    loadingBudgets,
    sendMessage,
    testConnection,
    analyzeBudget
  } = useFinancialAdvisor();

  return (
    <div className="space-y-6">
      {/* Header with Health Score */}
      <HealthScoreCard healthScore={healthScore} />

          {/* Service Status Alert - Enhanced */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Intelligent Fallback Mode Active:</strong> While our full AI advisor is temporarily 
              unavailable, you're getting comprehensive financial guidance using built-in logic and real 
              market data. The system can still analyze budgets, provide recommendations, and offer 
              personalized financial advice.
            </AlertDescription>
          </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <FinancialAdvisorChat 
          messages={messages}
          onSendMessage={sendMessage}
          loading={loading}
        />

        {/* Sidebar with Tools and Information */}
        <div className="space-y-6">
          {/* Connection Status */}
          <ConnectionStatus 
            connectionStatus={connectionStatus}
            isTestingConnection={isTestingConnection}
            retryCount={retryCount}
            onTestConnection={testConnection}
          />

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