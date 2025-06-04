
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, Loader2 } from 'lucide-react';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { BudgetOverview } from '@/components/dashboard/budget-overview';
import { SpendingCategoryChart } from '@/components/dashboard/spending-category-chart';
import type { Transaction, Budget } from '@/types';
import { mockBudgets, mockTransactions } from '@/lib/mock-data';
import { ScrollFadeIn } from '@/components/shared/scroll-fade-in';
import { useAuth } from '@/contexts/auth-context';
import { getTransactions } from '@/actions/transactions';
import { getBudgets } from '@/actions/budgets';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CategorySpending {
  name: string;
  value: number;
  fill: string;
}

const DASHBOARD_BUDGET_LIMIT = 3;
const DASHBOARD_TRANSACTION_LIMIT = 5;

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [allUserTransactions, setAllUserTransactions] = useState<Transaction[]>([]);
  const [recentTransactionsList, setRecentTransactionsList] = useState<Transaction[]>([]);
  const [dashboardBudgets, setDashboardBudgets] = useState<Budget[]>([]);

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(true);

  const calculateSummariesAndBudgets = useCallback((transactionsToProcess: Transaction[], budgetsToProcess: Budget[]) => {
    let income = 0;
    let expenses = 0;
    const spendingByCat: Record<string, number> = {};

    transactionsToProcess.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expenses += Math.abs(t.amount);
        if (t.category && t.category !== 'Income' && t.category !== 'Uncategorized') {
          spendingByCat[t.category] = (spendingByCat[t.category] || 0) + Math.abs(t.amount);
        }
      }
    });
    setTotalIncome(income);
    setTotalExpenses(expenses);

    const sortedTransactions = [...transactionsToProcess].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecentTransactionsList(sortedTransactions.slice(0, DASHBOARD_TRANSACTION_LIMIT));

    const formattedSpendingData = Object.entries(spendingByCat)
      .map(([name, value]) => ({ name, value, fill: '' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    setCategorySpending(formattedSpendingData);

    const calculatedDashboardBudgets = budgetsToProcess.map(budget => {
        let spent = 0;
        const budgetStartDate = startOfDay(parseISO(budget.startDate));
        const budgetEndDate = endOfDay(parseISO(budget.endDate));

        transactionsToProcess.forEach(transaction => {
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
    setDashboardBudgets(calculatedDashboardBudgets);

  }, []);


  const fetchDashboardData = useCallback(async () => {
    setIsLoadingData(true);
    if (!user) {
      const mockCalculatedBudgets = mockBudgets.slice(0, DASHBOARD_BUDGET_LIMIT).map(b => {
        const spent = mockTransactions.filter(t => t.category === b.category && t.type === 'expense' && isWithinInterval(parseISO(t.date), {start: parseISO(b.startDate), end: parseISO(b.endDate)})).reduce((acc, curr) => acc + Math.abs(curr.amount),0)
        return {...b, spent}
      })
      setAllUserTransactions(mockTransactions);
      calculateSummariesAndBudgets(mockTransactions, mockCalculatedBudgets);
      setIsLoadingData(false);
      return;
    }

    try {
      const [userTransactions, userLimitedBudgets] = await Promise.all([
        getTransactions(),
        getBudgets(DASHBOARD_BUDGET_LIMIT)
      ]);

      setAllUserTransactions(userTransactions);
      const budgetsForCalc = userLimitedBudgets.length > 0 ? userLimitedBudgets : mockBudgets.slice(0, DASHBOARD_BUDGET_LIMIT);
      calculateSummariesAndBudgets(userTransactions, budgetsForCalc);

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load dashboard data." });
      const mockCalculatedBudgets = mockBudgets.slice(0, DASHBOARD_BUDGET_LIMIT).map(b => {
        const spent = mockTransactions.filter(t => t.category === b.category && t.type === 'expense' && isWithinInterval(parseISO(t.date), {start: parseISO(b.startDate), end: parseISO(b.endDate)})).reduce((acc, curr) => acc + Math.abs(curr.amount),0)
        return {...b, spent}
      })
      setAllUserTransactions(mockTransactions);
      calculateSummariesAndBudgets(mockTransactions, mockCalculatedBudgets);
    } finally {
      setIsLoadingData(false);
    }
  }, [user, toast, calculateSummariesAndBudgets]);


  useEffect(() => {
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [authLoading, fetchDashboardData]);

  const handleAddTransactionClick = () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to add a transaction." });
      router.push('/auth');
      return;
    }
    router.push('/transactions#add');
  };

  const handleImportClick = () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to import transactions." });
      router.push('/auth');
      return;
    }
    router.push('/import');
  };

  const pageIsLoading = authLoading || isLoadingData;

  if (pageIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const netBalance = totalIncome - totalExpenses;

  return (
    <div>
      <PageHeader
        title="Home"
        description="Your financial command center."
        actions={
          <div className="flex gap-3">
            <Button onClick={handleAddTransactionClick}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
            </Button>
            <Button variant="outline" onClick={handleImportClick}>
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
          </div>
        }
      />

      <div
        className="scroll-smooth space-y-10" 
        style={{
          scrollSnapType: 'y proximity',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 150px)', 
          paddingBottom: '5vh'
        }}
      >

        {/* Overall Financial Snapshot Section */}
        <div style={{ scrollSnapAlign: 'start' }} className="flex justify-center">
          <ScrollFadeIn>
            <Card className="border-primary/20 shadow-xl bg-card/80 backdrop-blur-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-foreground tracking-tight">Financial Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center">
                <div className="grid gap-6 md:grid-cols-3">
                  <SummaryCard title="Total Income" amount={totalIncome} type="income" />
                  <SummaryCard title="Total Expenses" amount={totalExpenses} type="expense" />
                  <SummaryCard title="Net Balance" amount={netBalance} type={netBalance >= 0 ? "income" : "expense"} />
                </div>
              </CardContent>
            </Card>
          </ScrollFadeIn>
        </div>

        {/* Subsequent Sections */}
        <div style={{ scrollSnapAlign: 'start' }}>
          <div className="grid gap-6 lg:grid-cols-2">
            <ScrollFadeIn>
              <RecentTransactions transactions={recentTransactionsList} />
            </ScrollFadeIn>
            <ScrollFadeIn>
              <SpendingCategoryChart data={categorySpending} />
            </ScrollFadeIn>
          </div>
        </div>

        <div style={{ scrollSnapAlign: 'start' }}>
          <div className="grid gap-6 lg:grid-cols-1">
            <ScrollFadeIn>
              <BudgetOverview budgets={dashboardBudgets} />
            </ScrollFadeIn>
          </div>
        </div>

      </div>
    </div>
  );
}

