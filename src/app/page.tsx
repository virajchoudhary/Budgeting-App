
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
import { getBudgets } from '@/actions/budgets';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface CategorySpending {
  name: string;
  value: number;
  fill: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentTransactionsList, setRecentTransactionsList] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  
  const [isLoadingData, setIsLoadingData] = useState(true);

  const calculateSummary = (dataToProcess: Transaction[]) => {
    let income = 0;
    let expenses = 0;
    const spendingByCat: Record<string, number> = {};

    dataToProcess.forEach(t => {
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
    setRecentTransactionsList(dataToProcess.slice(0, 5));

    const formattedSpendingData = Object.entries(spendingByCat)
      .map(([name, value]) => ({ name, value, fill: '' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    setCategorySpending(formattedSpendingData);
  };

  const fetchDashboardData = useCallback(async () => {
    setIsLoadingData(true);
    if (!user) {
      setTransactions(mockTransactions);
      calculateSummary(mockTransactions);
      setBudgets(mockBudgets.slice(0, 3));
      setIsLoadingData(false);
      return;
    }

    try {
      const [userTransactions, userBudgets] = await Promise.all([
        getTransactions(),
        getBudgets()
      ]);
      
      setTransactions(userTransactions);
      calculateSummary(userTransactions);
      setBudgets(userBudgets.length > 0 ? userBudgets.slice(0,3) : mockBudgets.slice(0,3));

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load dashboard data." });
      setTransactions(mockTransactions);
      calculateSummary(mockTransactions);
      setBudgets(mockBudgets.slice(0, 3));
    } finally {
      setIsLoadingData(false);
    }
  }, [user, toast]);


  useEffect(() => {
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [authLoading, fetchDashboardData]);
  
  const handleAddTransactionClick = () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to add a transaction." });
      router.push('/login');
      return;
    }
    router.push('/transactions#add');
  };

  const handleImportClick = () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to import transactions." });
      router.push('/login');
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
    <div> {/* Outer container for PageHeader and scrollable content */}
      <PageHeader
        title="Overview"
        description="Your financial snapshot at a glance."
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

      {/* Scroll-snap container for dashboard sections */}
      <div 
        className="scroll-smooth" 
        style={{ 
          scrollSnapType: 'y proximity', 
          overflowY: 'auto', 
          // Approximate height: viewport height - typical header/nav - page padding
          // This might need adjustment based on your exact AppShell header height
          maxHeight: 'calc(100vh - 150px)', 
          paddingBottom: '5vh' // Add some padding at the bottom to ensure last item can snap well
        }}
      >

        {/* Section 1: Summary Cards */}
        <div className="py-10" style={{ scrollSnapAlign: 'start', minHeight: '40vh' }}>
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
        </div>

        {/* Section 2: Recent Transactions & Spending Chart */}
        <div className="py-10" style={{ scrollSnapAlign: 'start', minHeight: '65vh' }}>
          <div className="grid gap-6 lg:grid-cols-2">
            <ScrollFadeIn>
              <RecentTransactions transactions={recentTransactionsList} />
            </ScrollFadeIn>
            <ScrollFadeIn>
              <SpendingCategoryChart data={categorySpending} />
            </ScrollFadeIn>
          </div>
        </div>

        {/* Section 3: Budget Overview */}
        <div className="py-10" style={{ scrollSnapAlign: 'start', minHeight: '55vh' }}>
          <div className="grid gap-6 lg:grid-cols-1">
            <ScrollFadeIn>
               <BudgetOverview budgets={budgets} />
            </ScrollFadeIn>
          </div>
        </div>

      </div> {/* End of scroll-snap container */}
    </div>
  );
}
