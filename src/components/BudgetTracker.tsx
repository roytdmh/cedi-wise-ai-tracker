
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, History } from 'lucide-react';
import SaveBudgetDialog from './SaveBudgetDialog';
import BudgetHistory from './BudgetHistory';
import IncomeSetup from './budget/IncomeSetup';
import FinancialOverview from './budget/FinancialOverview';
import FinancialHealthCard from './budget/FinancialHealthCard';
import ExpenseForm from './budget/ExpenseForm';
import ExpensesList from './budget/ExpensesList';

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

const BudgetTracker = () => {
  const [income, setIncome] = useState<Income>({ amount: 0, frequency: 'monthly', currency: 'USD' });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'GHS', name: 'Ghana Cedi', symbol: '₵' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  ];

  const getMonthlyIncome = () => {
    const multipliers = { daily: 30, weekly: 4.33, 'bi-weekly': 2.17, monthly: 1 };
    return income.amount * multipliers[income.frequency];
  };

  const getMonthlyExpenseAmount = (expense: Expense) => {
    const multipliers = { daily: 30, weekly: 4.33, 'bi-weekly': 2.17, monthly: 1 };
    return expense.amount * multipliers[expense.frequency];
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + getMonthlyExpenseAmount(expense), 0);
  const monthlyIncome = getMonthlyIncome();
  const surplus = monthlyIncome - totalExpenses;
  const savingsRate = monthlyIncome > 0 ? (surplus / monthlyIncome) * 100 : 0;

  const addExpense = (expense: Expense) => {
    setExpenses([...expenses, expense]);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const getCurrencySymbol = () => {
    return currencies.find(c => c.code === income.currency)?.symbol || '$';
  };

  const handleRestoreBudget = (savedBudget: any) => {
    setIncome({
      amount: savedBudget.income_amount,
      frequency: savedBudget.income_frequency,
      currency: savedBudget.income_currency
    });
    setExpenses(savedBudget.expenses);
  };

  const handleBudgetSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Tabs defaultValue="tracker" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="tracker" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Budget Tracker
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Budget History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tracker" className="space-y-6">
        {/* Save Budget Button */}
        <div className="flex justify-end">
          <SaveBudgetDialog 
            income={income}
            expenses={expenses}
            onBudgetSaved={handleBudgetSaved}
          />
        </div>

        {/* Income Setup */}
        <IncomeSetup income={income} onIncomeChange={setIncome} />

        {/* Financial Overview */}
        <FinancialOverview 
          monthlyIncome={monthlyIncome}
          totalExpenses={totalExpenses}
          surplus={surplus}
          currencySymbol={getCurrencySymbol()}
        />

        {/* Financial Health */}
        <FinancialHealthCard savingsRate={savingsRate} />

        {/* Add Expense */}
        <ExpenseForm 
          onAddExpense={addExpense}
          currencySymbol={getCurrencySymbol()}
        />

        {/* Expenses List */}
        <ExpensesList 
          expenses={expenses}
          onRemoveExpense={removeExpense}
          currencySymbol={getCurrencySymbol()}
        />
      </TabsContent>

      <TabsContent value="history">
        <BudgetHistory 
          onRestoreBudget={handleRestoreBudget} 
          refreshTrigger={refreshTrigger}
        />
      </TabsContent>
    </Tabs>
  );
};

export default BudgetTracker;
