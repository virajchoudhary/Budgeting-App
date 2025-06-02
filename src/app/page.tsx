
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
import { mockBudgets } from '@/lib/mock-data'; // Budgets still from mock
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setRecentTransactions([]);
      setTotalIncome(0);
      setTotalExpenses(0);
      setCategorySpending([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const userTransactions = await getTransactions(); // Fetches all, then we process
      setTransactions(userTransactions);
      setRecentTransactions(userTransactions.slice(0, 5)); // Take first 5 for recent

      let income = 0;
      let expenses = 0;
      const spendingByCat: Record<string, number> = {};

      userTransactions.forEach(t => {
        if (t.type === 'income') {
          income += t.amount;
        } else {
          expenses += Math.abs(t.amount); // amount is negative for expense
          if (t.category !== 'Income' && t.category !== 'Uncategorized') {
            spendingByCat[t.category] = (spendingByCat[t.category] || 0) + Math.abs(t.amount);
          }
        }
      });
      setTotalIncome(income);
      setTotalExpenses(expenses);

      const formattedSpendingData = Object.entries(spendingByCat)
        .map(([name, value]) => ({
          name,
          value,
          fill: '', // Will be set by chart component
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
      setCategorySpending(formattedSpendingData);

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load dashboard data." });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);


  useEffect(() => {
    setBudgets(mockBudgets.slice(0, 3)); // Budgets are still from mock data
    fetchDashboardData();
  }, [fetchDashboardData]);


  if (!user && !isLoading) {
    return (
      <div className="space-y-10 text-center">
        <PageHeader title="Welcome to Kamski" description="Your financial snapshot at a glance. Please log in to view your dashboard." />
        <Link href="/login" passHref>
          <Button size="lg">Log In to Get Started</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
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
