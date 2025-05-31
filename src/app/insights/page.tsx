"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Brain, Loader2 } from 'lucide-react';
import { generateSpendingInsights } from '@/ai/flows/spending-insights';
import { mockTransactions } from '@/lib/mock-data'; // For demo purposes

export default function InsightsPage() {
  const [insights, setInsights] = useState<string>('');
  const [userRules, setUserRules] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setError(null);
    setInsights('');

    // Convert mock transactions to CSV string for the AI
    // In a real app, you'd fetch actual user transactions
    const transactionHistoryCSV = "Date,Description,Amount,Category,Type\n" + 
      mockTransactions.map(t => 
        `${t.date},"${t.description.replace(/"/g, '""')}",${t.amount},${t.category},${t.type}`
      ).join("\n");

    try {
      const result = await generateSpendingInsights({
        transactionHistory: transactionHistoryCSV,
        userRules: userRules || undefined,
      });
      setInsights(result.insights);
    } catch (err) {
      console.error("Error generating insights:", err);
      setError("Failed to generate insights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Spending Insights"
        description="Get AI-powered insights into your spending habits."
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Generate Personalized Insights</CardTitle>
          <CardDescription>
            Our AI will analyze your transaction history to provide you with valuable spending trends and suggestions.
            You can add custom rules to guide the analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="userRules">Custom Rules (Optional)</Label>
            <Textarea
              id="userRules"
              value={userRules}
              onChange={(e) => setUserRules(e.target.value)}
              placeholder="e.g., 'Flag any spending over $100 on Dining Out.' or 'Highlight subscriptions.'"
              className="min-h-[100px]"
            />
          </div>
          <Button onClick={handleGenerateInsights} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
            Generate Insights
          </Button>
        </CardContent>
        {(insights || error) && (
          <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
            <h3 className="text-lg font-medium">Generated Insights:</h3>
            {error && <p className="text-red-400">{error}</p>}
            {insights && <pre className="whitespace-pre-wrap text-sm p-4 bg-muted/50 rounded-md w-full">{insights}</pre>}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
