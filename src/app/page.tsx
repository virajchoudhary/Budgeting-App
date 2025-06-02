
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
import Link from 'next/link';
import { ScrollFadeIn } from '@/components/shared/scroll-fade-in';
import { useAuth } from '@/contexts/auth-context';
import { getTransactions } from '@/actions/transactions';
import { getBudgets } from '@/actions/budgets'; // Import budget action
import { useToast } from '@/hooks/use-toast';

interface CategorySpending {
  name: string;
  value: number;
  fill: string; // This will be populated by the chart component
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  
  const [isLoadingData, setIsLoadingData] = useState(true); // Combined loading state for data fetching

  const calculateSummary = (dataToProcess: Transaction[]) => {
    let income = 0;
    let expenses = 0;
    const spendingByCat: Record<string, number> = {};

    dataToProcess.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expenses += Math.abs(t.amount); // Ensure expenses are positive for calculation
        // Only include actual expense categories in the spending chart
        if (t.category && t.category !== 'Income' && t.category !== 'Uncategorized') {
          spendingByCat[t.category] = (spendingByCat[t.category] || 0) + Math.abs(t.amount);
        }
      }
    });
    setTotalIncome(income);
    setTotalExpenses(expenses);
    setRecentTransactions(dataToProcess.slice(0, 5));

    const formattedSpendingData = Object.entries(spendingByCat)
      .map(([name, value]) => ({ name, value, fill: '' })) // fill will be set by chart component
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories
    setCategorySpending(formattedSpendingData);
  };

  const fetchDashboardData = useCallback(async () => {
    setIsLoadingData(true);
    if (!user) {
      // Setup for unauthenticated view with mock data
      setTransactions(mockTransactions);
      calculateSummary(mockTransactions);
      setBudgets(mockBudgets.slice(0, 3)); // Use mock budgets for unauthenticated users
      setIsLoadingData(false);
      return;
    }

    try {
      const [userTransactions, userBudgets] = await Promise.all([
        getTransactions(), // Fetches all transactions for summary, recent is sliced later
        getBudgets()
      ]);
      
      setTransactions(userTransactions);
      calculateSummary(userTransactions);
      setBudgets(userBudgets.length > 0 ? userBudgets.slice(0,3) : mockBudgets.slice(0,3)); // Show user's budgets or mock if none

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load dashboard data." });
      // Fallback to mock data on error for authenticated user as well
      setTransactions(mockTransactions);
      calculateSummary(mockTransactions);
      setBudgets(mockBudgets.slice(0, 3));
    } finally {
      setIsLoadingData(false);
    }
  }, [user, toast]);


  useEffect(() => {
    if (!authLoading) { // Only fetch when auth state is resolved
      fetchDashboardData();
    }
  }, [authLoading, fetchDashboardData]);

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
    <div className="space-y-10">
      <PageHeader
        title="Overview"
        description="Your financial snapshot at a glance."
        actions={
          user ? (
            <div className="flex gap-3">
              <Link href="/transactions#add" passHref>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
                </Button>
              </Link>
              <Link href="/import" passHref>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" /> Import
                </Button>
              </Link>
            </div>
          ) : null
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ScrollFadeIn>
          <SummaryCard title="Total Income" amount={totalIncome} period="All Time" type="income" />
        </ScrollFadeIn>
        <ScrollFadeIn>
          <SummaryCard title="Total Expenses" amount={totalExpenses} period="All Time" type="expense" />
        </ScrollFadeIn>
        <ScrollFadeIn>
          <SummaryCard title="Net Balance" amount={netBalance} period="All Time" type={netBalance >= 0 ? "income" : "expense"} />
        </ScrollFadeIn>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ScrollFadeIn>
          <RecentTransactions transactions={recentTransactions} />
        </ScrollFadeIn>
        <ScrollFadeIn>
          <SpendingCategoryChart data={categorySpending} />
        </ScrollFadeIn>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <ScrollFadeIn>
           <BudgetOverview budgets={budgets} />
        </ScrollFadeIn>
      </div>
    </div>
  );
}
