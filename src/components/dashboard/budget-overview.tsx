
"use client";

import type { Budget } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowRight } from "lucide-react";
import { useSettings } from '@/contexts/settings-context';

interface BudgetOverviewProps {
  budgets: Budget[];
}

export function BudgetOverview({ budgets }: BudgetOverviewProps) {
  const { currency } = useSettings();
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Budget Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.length > 0 ? budgets.slice(0,3).map((budget) => { // Show top 3
          const progress = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
          const remaining = budget.amount - budget.spent;
          return (
            <div key={budget.id}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{budget.name} ({budget.category})</span>
                <span className={`text-sm font-medium ${progress > 100 ? 'text-red-400' : 'text-muted-foreground'}`}>
                  {budget.spent.toLocaleString('en-US', { style: 'currency', currency: currency })} / {budget.amount.toLocaleString('en-US', { style: 'currency', currency: currency })}
                </span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-3" 
                indicatorClassName={progress > 100 ? 'bg-red-500' : progress > 80 ? 'bg-yellow-500' : 'bg-primary'}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {remaining >=0 ? `${remaining.toLocaleString('en-US', { style: 'currency', currency: currency })} remaining` : `${Math.abs(remaining).toLocaleString('en-US', { style: 'currency', currency: currency })} overspent`}
              </p>
            </div>
          );
        }) : (
           <p className="text-muted-foreground text-center py-4">No budgets set up yet.</p>
        )}
      </CardContent>
      <CardFooter className="justify-end">
         <Link href="/budgets" passHref>
          <Button variant="ghost" size="sm">
            View All Budgets <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
