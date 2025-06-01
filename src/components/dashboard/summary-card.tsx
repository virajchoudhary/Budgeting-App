
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useSettings } from '@/contexts/settings-context';

interface SummaryCardProps {
  title: string;
  amount: number;
  period: string;
  type: "income" | "expense";
}

export function SummaryCard({ title, amount, period, type }: SummaryCardProps) {
  const { currency } = useSettings();
  const Icon = type === "income" ? ArrowUpCircle : ArrowDownCircle;
  const amountColor = type === "income" ? "text-green-400" : "text-red-400";

  return (
    <Card> 
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> {/* Adjusted padding */}
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle> {/* Adjusted font size and weight */}
        <Icon className={`h-5 w-5 ${type === "income" ? "text-green-500" : "text-red-500"}`} /> {/* Slightly larger icon */}
      </CardHeader>
      <CardContent className="pb-4"> 
        <div className={`text-3xl font-semibold ${amountColor}`}> {/* Larger amount text */}
          {amount.toLocaleString('en-US', { style: 'currency', currency: currency })}
        </div>
        <p className="text-xs text-muted-foreground pt-1">{period}</p> {/* Adjusted padding */}
      </CardContent>
    </Card>
  );
}
