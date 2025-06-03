
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Expense {
  id: string;
  category: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
}

interface ExpenseFormProps {
  onAddExpense: (expense: Expense) => void;
  currencySymbol: string;
}

const ExpenseForm = ({ onAddExpense, currencySymbol }: ExpenseFormProps) => {
  const { toast } = useToast();
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', frequency: 'monthly' });

  const expenseCategories = [
    'Housing', 'Food & Dining', 'Transportation', 'Healthcare', 
    'Entertainment', 'Shopping', 'Education', 'Utilities', 'Insurance', 'Other'
  ];

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

    onAddExpense(expense);
    setNewExpense({ category: '', amount: '', frequency: 'monthly' });
    
    toast({
      title: "Expense Added",
      description: `Added ${currencySymbol}${expense.amount} ${expense.frequency} for ${expense.category}`
    });
  };

  return (
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
  );
};

export default ExpenseForm;
