
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SaveBudgetDialogProps {
  income: {
    amount: number;
    frequency: string;
    currency: string;
  };
  expenses: any[];
  onBudgetSaved: () => void;
}

const SaveBudgetDialog = ({ income, expenses, onBudgetSaved }: SaveBudgetDialogProps) => {
  const [budgetName, setBudgetName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const saveBudget = async () => {
    if (!budgetName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a budget name",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    console.log('Saving budget with data:', {
      name: budgetName.trim(),
      income_amount: income.amount,
      income_frequency: income.frequency,
      income_currency: income.currency,
      expenses: expenses,
      user_id: null
    });

    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          name: budgetName.trim(),
          income_amount: income.amount,
          income_frequency: income.frequency,
          income_currency: income.currency,
          expenses: expenses,
          user_id: null
        })
        .select();

      console.log('Supabase insert response:', { data, error });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      toast({
        title: "Budget Saved",
        description: `"${budgetName}" has been saved to your budget history`
      });

      setBudgetName('');
      setIsOpen(false);
      onBudgetSaved();
    } catch (error) {
      console.error('Error saving budget:', error);
      toast({
        title: "Error",
        description: `Failed to save budget: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const isValidBudget = income.amount > 0 || expenses.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          disabled={!isValidBudget}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Current Budget
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="budget-name">Budget Name</Label>
            <Input
              id="budget-name"
              placeholder="e.g., Monthly Budget 2024, Vacation Fund, etc."
              value={budgetName}
              onChange={(e) => setBudgetName(e.target.value)}
              className="mt-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveBudget();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={saveBudget}
              disabled={saving || !budgetName.trim()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {saving ? 'Saving...' : 'Save Budget'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveBudgetDialog;
