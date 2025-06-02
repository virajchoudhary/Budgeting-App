
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Budget } from '@/types';
import { mockBudgets } from '@/lib/mock-data';
import { CreateBudgetDialog } from '@/components/budgets/create-budget-dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useSettings } from '@/contexts/settings-context';
import { ScrollFadeIn } from '@/components/shared/scroll-fade-in';
import { useAuth } from '@/contexts/auth-context';
import { getBudgets, addBudget as addBudgetAction, updateBudget as updateBudgetAction, deleteBudget as deleteBudgetAction } from '@/actions/budgets';
import { useToast } from '@/hooks/use-toast';

export default function BudgetsPage() {
  const { currency } = useSettings();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [operationTargetId, setOperationTargetId] = useState<string | null>(null); 
  const [isCreating, setIsCreating] = useState(false); 

  const fetchUserBudgets = useCallback(async () => {
    if (!user && !authLoading) {
      setBudgets(mockBudgets);
      setIsLoadingData(false);
      return;
    }
    if (!user && authLoading) {
        setIsLoadingData(true);
        return;
    }
    setIsLoadingData(true);
    try {
      const userBudgets = await getBudgets();
      setBudgets(userBudgets);
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not fetch budgets." });
      setBudgets(mockBudgets);
    } finally {
      setIsLoadingData(false);
    }
  }, [user, authLoading, toast]);

  useEffect(() => {
    fetchUserBudgets();
  }, [fetchUserBudgets]);

  const [formattedPeriods, setFormattedPeriods] = useState<Record<string, string>>({});
   useEffect(() => {
    const newFormattedPeriods: Record<string, string> = {};
    budgets.forEach(budget => {
      try {
        const startDate = new Date(budget.startDate);
        const endDate = new Date(budget.endDate);
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          newFormattedPeriods[budget.id] = `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
        } else {
          newFormattedPeriods[budget.id] = "Invalid date";
        }
      } catch (error) {
        console.error("Error formatting date for budget:", budget.id, error);
        newFormattedPeriods[budget.id] = "Date error";
      }
    });
    setFormattedPeriods(newFormattedPeriods);
  }, [budgets]);


  const handleOpenCreateDialog = () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to create a budget." });
      router.push('/auth');
      return;
    }
    setEditingBudget(null);
    setIsCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (budget: Budget) => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to edit budgets." });
      router.push('/auth');
      return;
    }
    setEditingBudget(budget);
    setIsCreateDialogOpen(true);
  };

  const handleAttemptDelete = (budgetId: string) => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to delete budgets." });
      router.push('/auth');
      return;
    }
    handleDeleteBudget(budgetId);
  };

  const handleAddBudget = async (newBudgetData: Omit<Budget, 'id' | 'spent' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if(!user) return;
    setIsMutating(true);
    setIsCreating(true);
    try {
      const createdBudget = await addBudgetAction(newBudgetData);
      if (createdBudget) {
        toast({ title: "Budget Created", description: "Your new budget has been saved." });
        fetchUserBudgets();
      } else {
        throw new Error("Budget creation returned undefined.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not create budget." });
    } finally {
      setIsMutating(false);
      setIsCreating(false);
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdateBudget = async (updatedBudgetData: Omit<Budget, 'id' | 'spent' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingBudget || !user) return;
    setIsMutating(true);
    setOperationTargetId(editingBudget.id);
    try {
      await updateBudgetAction(editingBudget.id, updatedBudgetData);
      toast({ title: "Budget Updated", description: "Your budget has been updated." });
      fetchUserBudgets();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not update budget." });
    } finally {
      setEditingBudget(null);
      setIsMutating(false);
      setOperationTargetId(null);
      setIsCreateDialogOpen(false);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if(!user) return;
    setIsMutating(true);
    setDeletingItemId(budgetId);
    setOperationTargetId(budgetId);
    try {
      await deleteBudgetAction(budgetId);
      toast({ title: "Budget Deleted", description: "Your budget has been removed." });
      fetchUserBudgets();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not delete budget." });
    } finally {
      setIsMutating(false);
      setDeletingItemId(null);
      setOperationTargetId(null);
    }
  };

  const pageIsLoading = authLoading || isLoadingData;

  if (pageIsLoading && !budgets.length && !user) { 
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <PageHeader
        title="Budgets"
        description="Create and manage your spending budgets."
        actions={
          <Button onClick={handleOpenCreateDialog} disabled={isCreating || (isMutating && !operationTargetId) || (authLoading && !user) }>
            {(isCreating || (isMutating && !editingBudget && !deletingItemId)) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
             Create Budget
          </Button>
        }
      />

      <div className="p-4 border rounded-md bg-muted/30 text-sm text-muted-foreground">
        <p><strong>Note:</strong> The 'Spent' amount for budgets reflects direct input or defaults to zero upon creation. Dynamic calculation based on your actual transactions is a feature planned for an upcoming update. For now, you can manually update the 'Spent' field when editing a budget if needed.</p>
      </div>

      {budgets.length === 0 && !pageIsLoading ? (
        <ScrollFadeIn>
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {user ? "No budgets created yet. Click 'Create Budget' to get started." : "Log in to manage your budgets, or click 'Create Budget' to be guided to login."}
            </CardContent>
          </Card>
        </ScrollFadeIn>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const progress = budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;
            const isOverspent = budget.spent > budget.amount;
            const period = formattedPeriods[budget.id] || "Loading period...";
            const isCurrentBudgetMutating = isMutating && operationTargetId === budget.id;

            return (
              <ScrollFadeIn key={budget.id}>
                <Card className="flex flex-col h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{budget.name}</CardTitle>
                         <CardDescription className="space-y-1">
                            <span>For <Badge variant="outline" className="mt-1">{budget.category}</Badge></span>
                        </CardDescription>
                      </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent" onClick={() => handleOpenEditDialog(budget)} disabled={isCurrentBudgetMutating || (isMutating && !isCurrentBudgetMutating && !isCreating)}>
                            {(isCurrentBudgetMutating && editingBudget?.id === budget.id) ? <Loader2 className="h-4 w-4 animate-spin"/> : <Edit2 className="h-4 w-4" /> }
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-accent" onClick={() => handleAttemptDelete(budget.id)} disabled={isCurrentBudgetMutating || (isMutating && !isCurrentBudgetMutating && !isCreating) }>
                            {(isCurrentBudgetMutating && deletingItemId === budget.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
              </ScrollFadeIn>
            );
          })}
        </div>
      )}

      <CreateBudgetDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onBudgetSaved={editingBudget ? handleUpdateBudget : handleAddBudget}
          existingBudget={editingBudget ?? undefined}
          isSubmitting={ (isCreating && !editingBudget) || (isMutating && operationTargetId === editingBudget?.id && !!editingBudget) }
      />
    </div>
  );
}

