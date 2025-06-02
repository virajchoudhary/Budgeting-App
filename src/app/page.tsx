
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
import { mockBudgets, mockTransactions } from '@/lib/mock-data'; // Budgets and transactions from mock
import Link from 'next/link';
import { ScrollFadeIn } from '@/components/shared/scroll-fade-in';
import { useAuth } from '@/contexts/auth-context';
import { getTransactions } from '@/actions/transactions';
import { useToast } from '@/hooks/use-toast';

interface CategorySpending {
  name: string;
  value: number;
  fill: string;
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
  const [isLoading, setIsLoading] = useState(true);

  const calculateMockDataSummary = () => {
    let income = 0;
    let expenses = 0;
    const spendingByCat: Record<string, number> = {};

    mockTransactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expenses += Math.abs(t.amount);
        if (t.category !== 'Income' && t.category !== 'Uncategorized') {
          spendingByCat[t.category] = (spendingByCat[t.category] || 0) + Math.abs(t.amount);
        }
      }
    });
    setTotalIncome(income);
    setTotalExpenses(expenses);
    setRecentTransactions(mockTransactions.slice(0, 5));

    const formattedSpendingData = Object.entries(spendingByCat)
      .map(([name, value]) => ({ name, value, fill: '' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    setCategorySpending(formattedSpendingData);
  };


  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    if (!user) {
      // Setup for unauthenticated view with mock data
      setTransactions(mockTransactions);
      calculateMockDataSummary();
      setBudgets(mockBudgets.slice(0, 3));
      setIsLoading(false);
      return;
    }

    try {
      const userTransactions = await getTransactions();
      setTransactions(userTransactions);
      setRecentTransactions(userTransactions.slice(0, 5));

      let income = 0;
      let expenses = 0;
      const spendingByCat: Record<string, number> = {};

      userTransactions.forEach(t => {
        if (t.type === 'income') {
          income += t.amount;
        } else {
          expenses += Math.abs(t.amount);
          if (t.category !== 'Income' && t.category !== 'Uncategorized') {
            spendingByCat[t.category] = (spendingByCat[t.category] || 0) + Math.abs(t.amount);
          }
        }
      });
      setTotalIncome(income);
      setTotalExpenses(expenses);

      const formattedSpendingData = Object.entries(spendingByCat)
        .map(([name, value]) => ({ name, value, fill: '' }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
      setCategorySpending(formattedSpendingData);
      
      // Still using mock budgets for authenticated users as per previous setup
      setBudgets(mockBudgets.slice(0, 3));

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load dashboard data." });
      // Fallback to mock data on error for authenticated user as well
      setTransactions(mockTransactions);
      calculateMockDataSummary();
      setBudgets(mockBudgets.slice(0, 3));
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);


  useEffect(() => {
    if (!authLoading) { // Only fetch when auth state is resolved
      fetchDashboardData();
    }
  }, [authLoading, fetchDashboardData]);


  // Combined loading state check
  if (isLoading || authLoading) {
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
            <>
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
            </>
          ) : null
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ScrollFadeIn>
          <SummaryCard title="Total Income" amount={totalIncome} period="This Month" type="income" />
        </ScrollFadeIn>
        <ScrollFadeIn delay="delay-100">
          <SummaryCard title="Total Expenses" amount={totalExpenses} period="This Month" type="expense" />
        </ScrollFadeIn>
        <ScrollFadeIn delay="delay-200">
          <SummaryCard title="Net Balance" amount={netBalance} period="This Month" type={netBalance >= 0 ? "income" : "expense"} />
        </ScrollFadeIn>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ScrollFadeIn>
          <RecentTransactions transactions={recentTransactions} />
        </ScrollFadeIn>
        <ScrollFadeIn delay="delay-100">
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
