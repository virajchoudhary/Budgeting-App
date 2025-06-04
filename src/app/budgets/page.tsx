
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit2, Trash2, Loader2, Info, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Budget, Transaction } from '@/types';
import { mockBudgets, mockTransactions } from '@/lib/mock-data';
import { CreateBudgetDialog } from '@/components/budgets/create-budget-dialog';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, getYear, getMonth } from 'date-fns';
import { useSettings } from '@/contexts/settings-context';
import { ScrollFadeIn } from '@/components/shared/scroll-fade-in';
import { useAuth } from '@/contexts/auth-context';
import { getBudgets, addBudget as addBudgetAction, updateBudget as updateBudgetAction, deleteBudget as deleteBudgetAction } from '@/actions/budgets';
import { getTransactions } from '@/actions/transactions';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function BudgetsPage() {
  const { currency } = useSettings();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetsWithCalculatedSpent, setBudgetsWithCalculatedSpent] = useState<Budget[]>([]);

  const [overallBudgets, setOverallBudgets] = useState<Budget[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<Budget[]>([]);


  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  
  const [operationTargetId, setOperationTargetId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [budgetToDeleteId, setBudgetToDeleteId] = useState<string | null>(null);

  const fetchBudgetsAndTransactions = useCallback(async () => {
    if (!user && !authLoading) {
      setBudgets(mockBudgets);
      setTransactions(mockTransactions);
      setIsLoadingData(false);
      return;
    }
    if (!user && authLoading) {
      setIsLoadingData(true);
      return;
    }
    setIsLoadingData(true);
    try {
      const [userBudgets, userTransactions] = await Promise.all([
        getBudgets(),
        getTransactions()
      ]);
      setBudgets(userBudgets);
      setTransactions(userTransactions);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not fetch budget or transaction data." });
      setBudgets(mockBudgets); 
      setTransactions(mockTransactions); 
    } finally {
      setIsLoadingData(false);
    }
  }, [user, authLoading, toast]);

  useEffect(() => {
    fetchBudgetsAndTransactions();
  }, [fetchBudgetsAndTransactions]);

  useEffect(() => {
    if (budgets.length > 0 || transactions.length > 0 || !user) { 
        const calculatedBudgets = budgets.map(budget => {
            let spent = 0;
            const budgetStartDate = startOfDay(parseISO(budget.startDate));
            const budgetEndDate = endOfDay(parseISO(budget.endDate));

            transactions.forEach(transaction => {
                const transactionDate = parseISO(transaction.date);
                if (
                    transaction.type === 'expense' &&
                    (budget.category === 'Overall' || transaction.category === budget.category) &&
                    isWithinInterval(transactionDate, { start: budgetStartDate, end: budgetEndDate })
                ) {
                    spent += Math.abs(transaction.amount);
                }
            });
            return { ...budget, spent };
        });
        setBudgetsWithCalculatedSpent(calculatedBudgets);

        const overall = calculatedBudgets.filter(b => b.category === 'Overall');
        const categorySpecific = calculatedBudgets.filter(b => b.category !== 'Overall');
        setOverallBudgets(overall);
        setCategoryBudgets(categorySpecific);

    } else if (budgets.length === 0 && !user) { // Handle mock data if no user budgets
        const mockCalculatedBudgets = mockBudgets.map(budget => {
             let spent = 0;
            const budgetStartDate = startOfDay(parseISO(budget.startDate));
            const budgetEndDate = endOfDay(parseISO(budget.endDate));
             mockTransactions.forEach(transaction => {
                const transactionDate = parseISO(transaction.date);
                if (
                    transaction.type === 'expense' &&
                    (budget.category === 'Overall' || transaction.category === budget.category) &&
                    isWithinInterval(transactionDate, { start: budgetStartDate, end: budgetEndDate })
                ) {
                    spent += Math.abs(transaction.amount);
                }
            });
            return { ...budget, spent };
        });
        setOverallBudgets(mockCalculatedBudgets.filter(b => b.category === 'Overall'));
        setCategoryBudgets(mockCalculatedBudgets.filter(b => b.category !== 'Overall'));
    }


  }, [budgets, transactions, user]); 

  const [formattedPeriods, setFormattedPeriods] = useState<Record<string, string>>({});
  useEffect(() => {
    const newFormattedPeriods: Record<string, string> = {};
    const budgetsToFormat = budgetsWithCalculatedSpent.length > 0 ? budgetsWithCalculatedSpent : (user ? [] : mockBudgets);

    budgetsToFormat.forEach(budget => {
      try {
        const startDate = parseISO(budget.startDate);
        const endDate = parseISO(budget.endDate);
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          let periodString = "";
          if (getYear(startDate) === getYear(endDate)) {
            if (getMonth(startDate) === getMonth(endDate)) {
              periodString = `Period: ${format(startDate, "MMM d")}-${format(endDate, "d, yyyy")}`;
            } else {
              periodString = `Period: ${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
            }
          } else {
            periodString = `Period: ${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
          }
          newFormattedPeriods[budget.id] = periodString;
        } else {
          newFormattedPeriods[budget.id] = "Invalid date";
        }
      } catch (error) {
        console.error("Error formatting date for budget:", budget.id, error);
        newFormattedPeriods[budget.id] = "Date error";
      }
    });
    setFormattedPeriods(newFormattedPeriods);
  }, [budgetsWithCalculatedSpent, user, mockBudgets]);


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

  const attemptDeleteBudget = (budgetId: string) => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to delete budgets." });
      router.push('/auth');
      return;
    }
    setBudgetToDeleteId(budgetId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBudget = async () => {
    if (!budgetToDeleteId || !user) return;
    setIsMutating(true);
    setOperationTargetId(budgetToDeleteId);
    try {
      await deleteBudgetAction(budgetToDeleteId);
      toast({ title: "Budget Deleted", description: "Your budget has been removed." });
      fetchBudgetsAndTransactions(); 
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not delete budget." });
    } finally {
      setIsMutating(false);
      setOperationTargetId(null);
      setIsDeleteDialogOpen(false);
      setBudgetToDeleteId(null);
    }
  };

  const handleAddBudget = async (newBudgetData: Omit<Budget, 'id' | 'spent' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    setIsMutating(true);
    setIsCreating(true);
    try {
      const createdBudget = await addBudgetAction(newBudgetData);
      if (createdBudget) {
        toast({ title: "Budget Created", description: "Your new budget has been saved." });
        fetchBudgetsAndTransactions(); 
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
      fetchBudgetsAndTransactions(); 
    } catch (error: any)      {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not update budget." });
    } finally {
      setEditingBudget(null);
      setIsMutating(false);
      setOperationTargetId(null);
      setIsCreateDialogOpen(false);
    }
  };


  const pageIsLoading = authLoading || isLoadingData;
  const noBudgetsExist = overallBudgets.length === 0 && categoryBudgets.length === 0;

  const renderBudgetCard = (budget: Budget) => {
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
                  {(isCurrentBudgetMutating && editingBudget?.id === budget.id && !isDeleteDialogOpen) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit2 className="h-4 w-4" />}
                  <span className="sr-only">Edit</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-accent" onClick={() => attemptDeleteBudget(budget.id)} disabled={isCurrentBudgetMutating || (isMutating && !isCurrentBudgetMutating && !isCreating)}>
                  {(isCurrentBudgetMutating && budgetToDeleteId === budget.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
  };


  if (pageIsLoading && noBudgetsExist) {
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
          <Button onClick={handleOpenCreateDialog} disabled={isCreating || (isMutating && !operationTargetId) || (authLoading && !user)}>
            {(isCreating || (isMutating && !editingBudget && !budgetToDeleteId)) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Create Budget
          </Button>
        }
      />

      <div className="p-4 border rounded-md bg-muted/30 text-sm text-muted-foreground flex items-start gap-2">
        <Info className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
        <p><strong>Note:</strong> The 'Spent' amount for budgets is dynamically calculated based on your transactions matching the budget's category (or all expenses for 'Overall' budgets) within the specified period.</p>
      </div>

      {noBudgetsExist && !pageIsLoading ? (
        <ScrollFadeIn>
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {user ? "No budgets created yet. Click 'Create Budget' to get started." : "Log in to manage your budgets, or click 'Create Budget' to be guided to login."}
            </CardContent>
          </Card>
        </ScrollFadeIn>
      ) : (
        <div className="space-y-8">
          {overallBudgets.length > 0 && (
            <ScrollFadeIn>
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Wallet className="h-6 w-6 text-primary" />
                    Overall Budget Summary
                  </CardTitle>
                  <CardDescription>Your total spending limits at a glance.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                   {overallBudgets.map(renderBudgetCard)}
                </CardContent>
              </Card>
            </ScrollFadeIn>
          )}

          {categoryBudgets.length > 0 && (
            <div>
                {overallBudgets.length > 0 && <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-6">Category Budgets</h2>}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {categoryBudgets.map(renderBudgetCard)}
                </div>
            </div>
          )}
        </div>
      )}

      <CreateBudgetDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onBudgetSaved={editingBudget ? handleUpdateBudget : handleAddBudget}
        existingBudget={editingBudget ?? undefined}
        isSubmitting={(isCreating && !editingBudget) || (isMutating && operationTargetId === editingBudget?.id && !!editingBudget && !isDeleteDialogOpen)}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the budget
              &quot;{budgets.find(b => b.id === budgetToDeleteId)?.name || 'this budget'}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBudgetToDeleteId(null)} disabled={isMutating && operationTargetId === budgetToDeleteId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBudget}
              disabled={isMutating && operationTargetId === budgetToDeleteId}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isMutating && operationTargetId === budgetToDeleteId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
