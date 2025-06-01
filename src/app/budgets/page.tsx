
"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Budget } from '@/types';
import { mockBudgets } from '@/lib/mock-data';
import { CreateBudgetDialog } from '@/components/budgets/create-budget-dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useSettings } from '@/contexts/settings-context';

export default function BudgetsPage() {
  const { currency } = useSettings();
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const addBudget = (newBudget: Omit<Budget, 'id' | 'spent'>) => {
    setBudgets(prev => [{ ...newBudget, id: String(Date.now()), spent: 0 }, ...prev]);
  };

  const updateBudget = (updatedBudget: Omit<Budget, 'id' | 'spent'>) => {
    if (editingBudget) {
      setBudgets(prev => prev.map(b => b.id === editingBudget.id ? { ...editingBudget, ...updatedBudget } : b));
    }
    setEditingBudget(null);
  };

  const deleteBudget = (budgetId: string) => {
    setBudgets(prev => prev.filter(b => b.id !== budgetId));
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Budgets"
        description="Create and manage your spending budgets."
        actions={
          <Button onClick={() => { setEditingBudget(null); setIsCreateDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Budget
          </Button>
        }
      />

      {budgets.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No budgets created yet. Click "Create Budget" to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const progress = budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;
            const isOverspent = budget.spent > budget.amount;
            const period = `${format(new Date(budget.startDate), "MMM d")} - ${format(new Date(budget.endDate), "MMM d, yyyy")}`;

            return (
              <Card key={budget.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{budget.name}</CardTitle>
                      <CardDescription>For <Badge variant="outline" className="mt-1">{budget.category}</Badge></CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-transparent" onClick={() => { setEditingBudget(budget); setIsCreateDialogOpen(true); }}>
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-transparent" onClick={() => deleteBudget(budget.id)}>
                        <Trash2 className="h-4 w-4" />
                         <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Spent: {budget.spent.toLocaleString('en-US', { style: 'currency', currency: currency })}</span>
                      <span className={isOverspent ? "text-red-400" : ""}>
                        Limit: {budget.amount.toLocaleString('en-US', { style: 'currency', currency: currency })}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" indicatorClassName={isOverspent ? 'bg-red-500' : progress > 80 ? 'bg-yellow-500' : 'bg-primary'} />
                  </div>
                  <p className={`text-sm ${isOverspent ? 'text-red-400' : 'text-green-400'}`}>
                    {isOverspent 
                      ? `${(budget.spent - budget.amount).toLocaleString('en-US', { style: 'currency', currency: currency })} overspent`
                      : `${(budget.amount - budget.spent).toLocaleString('en-US', { style: 'currency', currency: currency })} remaining`}
                  </p>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">{period}</p>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <CreateBudgetDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onBudgetSaved={editingBudget ? updateBudget : addBudget}
        existingBudget={editingBudget ?? undefined}
      />
    </div>
  );
}
