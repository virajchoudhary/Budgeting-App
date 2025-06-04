
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useSettings } from '@/contexts/settings-context';

interface SummaryCardProps {
  title: string;
  amount: number;
  type: "income" | "expense";
}

export function SummaryCard({ title, amount, type }: SummaryCardProps) {
  const { currency } = useSettings();
  const Icon = type === "income" ? ArrowUpCircle : ArrowDownCircle;
  const amountColor = type === "income" ? "text-green-400" : "text-red-400";

  return (
    <Card>
      <CardHeader className="relative flex items-center space-y-0 py-3 px-6"> {/* Adjusted padding */}
        <CardTitle className="w-full text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <Icon className={`absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 ${type === "income" ? "text-green-500" : "text-red-500"}`} />
      </CardHeader>
      <CardContent className="pb-4 pt-0 text-center">
        <div className={`text-3xl font-semibold ${amountColor}`}>
          {amount.toLocaleString('en-US', { style: 'currency', currency: currency })}
        </div>
      </CardContent>
    </Card>
  );
}
