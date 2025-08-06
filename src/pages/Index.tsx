
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-3 rounded-xl">
              <Wallet className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
            CediWise
          </h1>
          <p className="text-muted-foreground text-lg">
            Master your finances with intelligent budgeting and real-time market insights
          </p>
        </div>

        {/* Main Content */}
        <Card className="bg-card/80 backdrop-blur-sm shadow-xl border">
          <Tabs defaultValue="budget" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted p-1 rounded-xl">
              <TabsTrigger 
                value="budget" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200"
              >
                <Wallet className="h-4 w-4" />
                Budget Tracker
              </TabsTrigger>
              <TabsTrigger 
                value="exchange" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200"
              >
                <TrendingUp className="h-4 w-4" />
                Exchange Rates
              </TabsTrigger>
              <TabsTrigger 
                value="prices" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200"
              >
                <ShoppingCart className="h-4 w-4" />
                Price Tracker
              </TabsTrigger>
              <TabsTrigger 
                value="advisor" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-200"
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
