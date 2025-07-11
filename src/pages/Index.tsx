
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccess } from '@/contexts/AccessContext';
import BudgetTracker from '@/components/BudgetTracker';
import ExchangeRates from '@/components/ExchangeRates';
import PriceTracker from '@/components/PriceTracker';
import FinancialAdvisor from '@/components/FinancialAdvisor';
import { Wallet, TrendingUp, ShoppingCart, Brain } from 'lucide-react';

interface Income {
  amount: number;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  currency: string;
}

interface Expense {
  id: string;
  category: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
}

const Index = () => {
  const [income, setIncome] = useState<Income>({ amount: 0, frequency: 'monthly', currency: 'USD' });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { setAccessLevel, hasFullAccess, hasDemoAccess } = useAccess();

  // Handle access level from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessParam = params.get('access');
    if (accessParam === 'demo' || accessParam === 'full') {
      setAccessLevel(accessParam);
    }
  }, [setAccessLevel]);

  // Create current budget data for AI advisor
  const currentBudget = {
    income,
    expenses: expenses.map(expense => ({
      category: expense.category,
      amount: expense.amount * (expense.frequency === 'daily' ? 30 : expense.frequency === 'weekly' ? 4.33 : expense.frequency === 'bi-weekly' ? 2.17 : 1)
    }))
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Demo Mode Banner */}
        {hasDemoAccess && !hasFullAccess && (
          <div className="mb-6 p-4 bg-amber-100 border border-amber-300 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-amber-600" />
                <span className="text-amber-800 font-medium">Demo Mode</span>
              </div>
              <div className="text-sm text-amber-700">
                Some features are limited. 
                <button 
                  onClick={() => window.location.href = '/'} 
                  className="ml-2 underline hover:no-underline"
                >
                  Get full access
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-3 rounded-xl shadow-lg">
              <Wallet className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            CediWise
          </h1>
          <p className="text-gray-600 text-lg">
            Master your finances with intelligent budgeting and real-time market insights
          </p>
        </div>

        {/* Main Content */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <Tabs defaultValue="budget" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-gradient-to-r from-blue-100 to-teal-100 p-1 rounded-xl">
              <TabsTrigger 
                value="budget" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <Wallet className="h-4 w-4" />
                Budget Tracker
              </TabsTrigger>
              <TabsTrigger 
                value="exchange" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <TrendingUp className="h-4 w-4" />
                Exchange Rates
              </TabsTrigger>
              <TabsTrigger 
                value="prices" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <ShoppingCart className="h-4 w-4" />
                Price Tracker
              </TabsTrigger>
              <TabsTrigger 
                value="advisor" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <Brain className="h-4 w-4" />
                AI Advisor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="budget" className="mt-0">
              <BudgetTracker 
                income={income}
                expenses={expenses}
                onIncomeChange={setIncome}
                onExpensesChange={setExpenses}
              />
            </TabsContent>

            <TabsContent value="exchange" className="mt-0">
              <ExchangeRates />
            </TabsContent>

            <TabsContent value="prices" className="mt-0">
              <PriceTracker />
            </TabsContent>

            <TabsContent value="advisor" className="mt-0">
              <FinancialAdvisor budgetData={currentBudget} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Index;
