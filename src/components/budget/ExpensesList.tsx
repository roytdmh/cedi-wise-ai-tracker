
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Expense {
  id: string;
  category: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
}

interface ExpensesListProps {
  expenses: Expense[];
  onRemoveExpense: (id: string) => void;
  currencySymbol: string;
}

const ExpensesList = ({ expenses, onRemoveExpense, currencySymbol }: ExpensesListProps) => {
  const { toast } = useToast();

  const removeExpense = (id: string) => {
    onRemoveExpense(id);
    toast({
      title: "Expense Removed",
      description: "Expense has been deleted from your budget"
    });
  };

  if (expenses.length === 0) {
    return null;
  }

  return (
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
                  <span className="font-medium">{currencySymbol}{expense.amount.toFixed(2)}</span>
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
  );
};

export default ExpensesList;
