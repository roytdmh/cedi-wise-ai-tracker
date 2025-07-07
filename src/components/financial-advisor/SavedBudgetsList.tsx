import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type SavedBudget = Tables<'budgets'>;

interface SavedBudgetsListProps {
  savedBudgets: SavedBudget[];
  selectedBudget: SavedBudget | null;
  loadingBudgets: boolean;
  loading: boolean;
  onAnalyzeBudget: (budget: SavedBudget) => Promise<void>;
}

const SavedBudgetsList = ({ 
  savedBudgets, 
  selectedBudget, 
  loadingBudgets, 
  loading, 
  onAnalyzeBudget 
}: SavedBudgetsListProps) => {
  return (
    <Card className="shadow-lg border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-700">
          <Folder className="h-5 w-5" />
          Saved Budgets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loadingBudgets ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading budgets...</p>
          </div>
        ) : savedBudgets.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No saved budgets found</p>
            <p className="text-xs text-gray-400 mt-1">Create a budget in the Budget Tracker to get started</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {savedBudgets.map((budget) => (
              <Button
                key={budget.id}
                variant="outline"
                size="sm"
                className={`w-full text-left h-auto p-3 justify-start animate-fade-in ${
                  selectedBudget?.id === budget.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => onAnalyzeBudget(budget)}
                disabled={loading}
              >
                      <div className="flex flex-col items-start w-full">
                        <span className="font-medium text-sm">{budget.name}</span>
                        <div className="flex justify-between w-full mt-1">
                          <span className="text-xs text-gray-500">
                            {budget.income_currency} {budget.income_amount}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(budget.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
              </Button>
            ))}
          </div>
        )}
        {selectedBudget && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 animate-scale-in">
            <p className="text-sm font-medium text-blue-900">Analyzing: {selectedBudget.name}</p>
            <p className="text-xs text-blue-700 mt-1">
              Income: {selectedBudget.income_currency} {selectedBudget.income_amount} ({selectedBudget.income_frequency})
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedBudgetsList;