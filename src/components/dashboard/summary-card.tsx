
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
  const amountColor = type === "income" ? "text-green-400" : "text-red-400"; // Keep colors for emphasis

  return (
    <Card className="hover:shadow-lg hover:scale-100"> {/* Explicitly set hover state to static */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5"> {/* Reduced padding bottom */}
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle> {/* Adjusted styling */}
        <Icon className={`h-4 w-4 ${type === "income" ? "text-green-500" : "text-red-500"}`} /> {/* Smaller icon */}
      </CardHeader>
      <CardContent className="pb-4"> {/* Reduced padding bottom */}
        <div className={`text-2xl font-semibold ${amountColor}`}> {/* Adjusted font size */}
          {amount.toLocaleString('en-US', { style: 'currency', currency: currency })}
        </div>
        <p className="text-xs text-muted-foreground pt-0.5">{period}</p> {/* Reduced padding top */}
      </CardContent>
    </Card>
  );
}
