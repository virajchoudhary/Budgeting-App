
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Brain, Loader2 } from 'lucide-react';
import { generateSpendingInsights } from '@/ai/flows/spending-insights';
import { mockTransactions } from '@/lib/mock-data'; // For demo purposes when not logged in
import { ScrollFadeIn } from '@/components/shared/scroll-fade-in';
import { useAuth } from '@/contexts/auth-context';
import { getTransactions } from '@/actions/transactions';
import type { Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function InsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [insights, setInsights] = useState<string>('');
  const [userRules, setUserRules] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false); // For AI generation
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true); // For initial data load
  const [error, setError] = useState<string | null>(null);
  const [currentTransactions, setCurrentTransactions] = useState<Transaction[]>(mockTransactions);


  const fetchUserTransactionsForInsights = useCallback(async () => {
    if (!user) {
      setCurrentTransactions(mockTransactions);
      setIsFetchingData(false);
      return;
    }
    setIsFetchingData(true);
    try {
      const fetchedTransactions = await getTransactions(); // Get all user transactions
      setCurrentTransactions(fetchedTransactions.length > 0 ? fetchedTransactions : mockTransactions); // Use mock if user has no transactions yet for demo
    } catch (err) {
      console.error("Error fetching transactions for insights:", err);
      toast({ variant: "destructive", title: "Error", description: "Could not load transaction data for insights." });
      setCurrentTransactions(mockTransactions); // Fallback to mock
    } finally {
      setIsFetchingData(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchUserTransactionsForInsights();
    }
  }, [authLoading, fetchUserTransactionsForInsights]);


  const handleGenerateInsights = async () => {
    if (!user && currentTransactions === mockTransactions) {
        toast({variant: "destructive", title: "Login Required", description: "Please log in to generate personalized insights."});
        return;
    }
    if (currentTransactions.length === 0) {
        toast({title: "No Data", description: "No transaction data available to generate insights."});
        return;
    }

    setIsLoading(true);
    setError(null);
    setInsights('');

    const transactionHistoryCSV = "Date,Description,Amount,Category,Type\n" + 
      currentTransactions.map(t => 
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
       toast({variant: "destructive", title: "AI Error", description: "Could not generate insights at this time."});
    } finally {
      setIsLoading(false);
    }
  };
  
  const pageLoading = authLoading || isFetchingData;

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Spending Insights"
        description="Get AI-powered insights into your spending habits."
      />
      <ScrollFadeIn>
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
                disabled={!user}
              />
            </div>
            <Button onClick={handleGenerateInsights} disabled={isLoading || !user || currentTransactions.length === 0}>
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
      </ScrollFadeIn>
    </div>
  );
}
