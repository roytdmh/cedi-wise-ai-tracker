import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, PiggyBank, AlertTriangle, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [income, setIncome] = useState<Income>({ amount: 0, frequency: 'monthly', currency: 'USD' });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', frequency: 'monthly' });

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'GHS', name: 'Ghana Cedi', symbol: '₵' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  ];

  const expenseCategories = [
    'Housing', 'Food & Dining', 'Transportation', 'Healthcare', 
    'Entertainment', 'Shopping', 'Education', 'Utilities', 'Insurance', 'Other'
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

  const addExpense = () => {
    if (!newExpense.category || !newExpense.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in category and amount",
        variant: "destructive"
      });
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      frequency: newExpense.frequency as 'daily' | 'weekly' | 'bi-weekly' | 'monthly'
    };

    setExpenses([...expenses, expense]);
    setNewExpense({ category: '', amount: '', frequency: 'monthly' });
    
    toast({
      title: "Expense Added",
      description: `Added ${getCurrencySymbol()}${expense.amount} ${expense.frequency} for ${expense.category}`
    });
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
    toast({
      title: "Expense Removed",
      description: "Expense has been deleted from your budget"
    });
  };

  const getCurrencySymbol = () => {
    return currencies.find(c => c.code === income.currency)?.symbol || '$';
  };

  const getFinancialHealth = () => {
    if (savingsRate >= 20) return { status: 'Excellent', color: 'bg-emerald-500', icon: TrendingUp };
    if (savingsRate >= 10) return { status: 'Good', color: 'bg-blue-500', icon: PiggyBank };
    if (savingsRate >= 0) return { status: 'Fair', color: 'bg-yellow-500', icon: AlertTriangle };
    return { status: 'Poor', color: 'bg-red-500', icon: AlertTriangle };
  };

  const healthStatus = getFinancialHealth();

  return (
    <div className="space-y-6">
      {/* Income Setup */}
      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <DollarSign className="h-5 w-5" />
            Income Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="income-amount">Income Amount</Label>
              <Input
                id="income-amount"
                type="number"
                placeholder="Enter amount"
                value={income.amount || ''}
                onChange={(e) => setIncome({...income, amount: parseFloat(e.target.value) || 0})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={income.frequency} onValueChange={(value: any) => setIncome({...income, frequency: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={income.currency} onValueChange={(value) => setIncome({...income, currency: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {getCurrencySymbol()}{monthlyIncome.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {getCurrencySymbol()}{totalExpenses.toFixed(2)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Surplus/Deficit</p>
                <p className={`text-2xl font-bold ${surplus >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {getCurrencySymbol()}{surplus.toFixed(2)}
                </p>
              </div>
              <PiggyBank className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health */}
      <Card className="border-teal-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-teal-700">
            <healthStatus.icon className="h-5 w-5" />
            Financial Health Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Savings Rate</span>
              <Badge className={`${healthStatus.color} text-white`}>
                {healthStatus.status}
              </Badge>
            </div>
            <Progress value={Math.max(0, Math.min(100, savingsRate))} className="h-3" />
            <p className="text-sm text-gray-600">
              You're saving {savingsRate.toFixed(1)}% of your income. 
              {savingsRate >= 20 && " Excellent work! Keep it up!"}
              {savingsRate >= 10 && savingsRate < 20 && " Good progress! Try to increase your savings rate."}
              {savingsRate >= 0 && savingsRate < 10 && " Consider reducing expenses to improve your savings rate."}
              {savingsRate < 0 && " You're spending more than you earn. Review your expenses urgently."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add Expense */}
      <Card className="border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Plus className="h-5 w-5" />
            Add Expense
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={newExpense.category} onValueChange={(value) => setNewExpense({...newExpense, category: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expense-amount">Amount</Label>
              <Input
                id="expense-amount"
                type="number"
                placeholder="0.00"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="expense-frequency">Frequency</Label>
              <Select value={newExpense.frequency} onValueChange={(value) => setNewExpense({...newExpense, frequency: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addExpense} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      {expenses.length > 0 && (
        <Card className="border-orange-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-700">Your Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{expense.category}</Badge>
                      <span className="font-medium">{getCurrencySymbol()}{expense.amount.toFixed(2)}</span>
                      <Badge variant="outline">{expense.frequency}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExpense(expense.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BudgetTracker;
