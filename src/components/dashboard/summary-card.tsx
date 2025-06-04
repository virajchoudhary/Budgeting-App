
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useSettings } from '@/contexts/settings-context';

interface SummaryCardProps {
  title: string;
  amount: number;
  type: "income" | "expense";
  period?: string; // Period is kept for potential future use but not displayed by default
}

export function SummaryCard({ title, amount, type }: SummaryCardProps) {
  const { currency } = useSettings();
  const Icon = type === "income" ? ArrowUpCircle : ArrowDownCircle;
  const amountColor = type === "income" ? "text-green-400" : "text-red-400";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex-1 text-center">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${type === "income" ? "text-green-500" : "text-red-500"}`} />
      </CardHeader>
      <CardContent className="pb-4 pt-0 text-center"> {/* Adjusted top padding and added text-center */}
        <div className={`text-3xl font-semibold ${amountColor}`}>
          {amount.toLocaleString('en-US', { style: 'currency', currency: currency })}
        </div>
        {/* The period text is removed from here as per user request for the top summary cards */}
        {/* <p className="text-xs text-muted-foreground pt-1">{period}</p> */}
      </CardContent>
    </Card>
  );
}
