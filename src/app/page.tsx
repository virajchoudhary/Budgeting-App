
"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload } from 'lucide-react';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { BudgetOverview } from '@/components/dashboard/budget-overview';
import { SpendingCategoryChart } from '@/components/dashboard/spending-category-chart';
import type { Transaction, Budget } from '@/types';
import { mockTransactions, mockBudgets } from '@/lib/mock-data';
import Link from 'next/link';

interface CategorySpending {
  name: string;
  value: number;
  fill: string; 
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);

  useEffect(() => {
    setTransactions(mockTransactions.slice(0, 5)); 
    setBudgets(mockBudgets.slice(0,3)); 

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

    const formattedSpendingData = Object.entries(spendingByCat)
      .map(([name, value]) => ({
        name,
        value,
        fill: '', 
      }))
      .sort((a, b) => b.value - a.value) 
      .slice(0, 6); 

    setCategorySpending(formattedSpendingData);

  }, []);

  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="space-y-10"> {/* Increased overall spacing */}
      <PageHeader
        title="Overview"
        description="Your financial snapshot at a glance." 
        actions={
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
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"> 
        <SummaryCard title="Total Income" amount={totalIncome} period="This Month" type="income" />
        <SummaryCard title="Total Expenses" amount={totalExpenses} period="This Month" type="expense" />
        <SummaryCard title="Net Balance" amount={netBalance} period="This Month" type={netBalance >= 0 ? "income" : "expense"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2"> 
        <RecentTransactions transactions={transactions} />
        <SpendingCategoryChart data={categorySpending} /> 
      </div>
      
      <div className="grid gap-6 lg:grid-cols-1"> 
         <BudgetOverview budgets={budgets} />
      </div>
    </div>
  );
}
