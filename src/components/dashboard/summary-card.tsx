
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
  const iconColor = type === "income" ? "text-green-500" : "text-red-500";

  return (
    <Card>
      <CardHeader className="relative space-y-0 py-3 px-4"> {/* Removed flex, adjusted padding */}
        <CardTitle className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <Icon className={`absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 ${iconColor}`} />
      </CardHeader>
      <CardContent className="pb-4 pt-0 text-center">
        <div className={`text-3xl font-semibold ${amountColor}`}>
          {amount.toLocaleString('en-US', { style: 'currency', currency: currency })}
        </div>
      </CardContent>
    </Card>
  );
}

