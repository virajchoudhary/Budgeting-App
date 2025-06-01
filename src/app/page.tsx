
"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload } from 'lucide-react';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { BudgetOverview } from '@/components/dashboard/budget-overview';
import { SpendingCategoryChart } from '@/components/dashboard/spending-category-chart'; // Import new chart
import type { Transaction, Budget } from '@/types';
import { mockTransactions, mockBudgets } from '@/lib/mock-data';
import Link from 'next/link';

interface CategorySpending {
  name: string;
  value: number;
  fill: string; // Placeholder, will be assigned in the chart component
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);

  useEffect(() => {
    // Simulate fetching data
    setTransactions(mockTransactions.slice(0, 5)); // Show recent 5
    setBudgets(mockBudgets.slice(0,3)); // Show top 3

    let income = 0;
    let expenses = 0;
    const spendingByCat: Record<string, number> = {};

    mockTransactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expenses += Math.abs(t.amount);
        if (t.category !== 'Income' && t.category !== 'Uncategorized') { // Exclude non-expense categories from chart
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
        fill: '', // Color will be assigned by the chart component
      }))
      .sort((a, b) => b.value - a.value) // Sort by most spent
      .slice(0, 6); // Take top 6 categories for chart readability

    setCategorySpending(formattedSpendingData);

  }, []);

  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6"> {/* Reduced space */}
      <PageHeader
        title="Overview"
        description="Your financial snapshot." /* Shorter description */
        actions={
          <>
            <Link href="/transactions#add" passHref>
              <Button size="sm"> {/* Smaller button */}
                <PlusCircle className="mr-1.5 h-4 w-4" /> Add Transaction
              </Button>
            </Link>
            <Link href="/import" passHref>
              <Button variant="outline" size="sm"> {/* Smaller button */}
                <Upload className="mr-1.5 h-4 w-4" /> Import
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> {/* Reduced gap */}
        <SummaryCard title="Total Income" amount={totalIncome} period="This Month" type="income" />
        <SummaryCard title="Total Expenses" amount={totalExpenses} period="This Month" type="expense" />
        <SummaryCard title="Net Balance" amount={netBalance} period="This Month" type={netBalance >= 0 ? "income" : "expense"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2"> {/* Reduced gap */}
        <RecentTransactions transactions={transactions} />
        <SpendingCategoryChart data={categorySpending} /> {/* Add the new chart */}
      </div>
      
      <div className="grid gap-4 lg:grid-cols-1"> {/* Budget overview can span full width if it's the only item in its row */}
         <BudgetOverview budgets={budgets} />
      </div>
    </div>
  );
}
