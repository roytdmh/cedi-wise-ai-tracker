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

      {/* Service Status Alert */}
      {lastError && retryCount > 1 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {lastError.includes('quota') ? (
              <>
                <strong>Service temporarily at capacity.</strong> The AI advisor is experiencing high demand. 
                Basic financial guidance is still available through our fallback system.
              </>
            ) : lastError.includes('rate_limit') ? (
              <>
                <strong>Rate limit reached.</strong> Please wait a minute before sending another message.
              </>
            ) : (
              <>
                <strong>Connection issues detected.</strong> Please check your internet connection. 
                If the problem persists, try refreshing the page.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

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