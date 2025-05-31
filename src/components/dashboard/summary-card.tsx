"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, DollarSign } from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: number;
  period: string;
  type: "income" | "expense";
}

export function SummaryCard({ title, amount, period, type }: SummaryCardProps) {
  const Icon = type === "income" ? ArrowUpCircle : ArrowDownCircle;
  const amountColor = type === "income" ? "text-green-400" : "text-red-400";

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${type === "income" ? "text-green-500" : "text-red-500"}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${amountColor}`}>
          {amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </div>
        <p className="text-xs text-muted-foreground pt-1">{period}</p>
      </CardContent>
    </Card>
  );
}
