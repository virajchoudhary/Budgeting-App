
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Brain, Loader2, MessageSquareQuestion } from 'lucide-react';
import { generateSpendingInsights } from '@/ai/flows/spending-insights';
import { queryFinancialData } from '@/ai/flows/financial-query-flow'; // New AI flow
import { mockTransactions } from '@/lib/mock-data'; 
import { ScrollFadeIn } from '@/components/shared/scroll-fade-in';
import { useAuth } from '@/contexts/auth-context';
import { getTransactions } from '@/actions/transactions';
import type { Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function InsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // State for Spending Insights
  const [insights, setInsights] = useState<string>('');
  const [userRules, setUserRules] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // State for Financial Q&A
  const [userQuery, setUserQuery] = useState<string>('');
  const [queryResponse, setQueryResponse] = useState<string>('');
  const [isLoadingQuery, setIsLoadingQuery] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  
  // Common state
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const [currentTransactions, setCurrentTransactions] = useState<Transaction[]>(mockTransactions);


  const fetchUserTransactionsForInsights = useCallback(async () => {
    if (!user) {
      setCurrentTransactions(mockTransactions);
      setIsFetchingData(false);
      return;
    }
    setIsFetchingData(true);
    try {
      const fetchedTransactions = await getTransactions(); 
      setCurrentTransactions(fetchedTransactions.length > 0 ? fetchedTransactions : mockTransactions);
    } catch (err) {
      console.error("Error fetching transactions for insights:", err);
      toast({ variant: "destructive", title: "Error", description: "Could not load transaction data for insights." });
      setCurrentTransactions(mockTransactions); 
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

    setIsLoadingInsights(true);
    setInsightsError(null);
    setInsights('');

    const transactionHistoryCSV = "Date,Description,Amount,Category,Type\n" + 
      currentTransactions.map(t => 
        `${new Date(t.date).toLocaleDateString()},"${t.description.replace(/"/g, '""')}",${t.amount},${t.category},${t.type}`
      ).join("\n");

    try {
      const result = await generateSpendingInsights({
        transactionHistory: transactionHistoryCSV,
        userRules: userRules || undefined,
      });
      setInsights(result.insights);
    } catch (err) {
      console.error("Error generating insights:", err);
      setInsightsError("Failed to generate insights. Please try again.");
      toast({variant: "destructive", title: "AI Error", description: "Could not generate insights at this time."});
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleFinancialQuery = async () => {
    if (!user && currentTransactions === mockTransactions) {
        toast({variant: "destructive", title: "Login Required", description: "Please log in to ask financial questions."});
        return;
    }
     if (currentTransactions.length === 0) {
        toast({title: "No Data", description: "No transaction data available to query."});
        return;
    }
    if (!userQuery.trim()) {
        toast({variant: "destructive", title: "Empty Question", description: "Please enter a question."});
        return;
    }

    setIsLoadingQuery(true);
    setQueryError(null);
    setQueryResponse('');

    const transactionHistoryCSV = "Date,Description,Amount,Category,Type\n" + 
      currentTransactions.map(t => 
        `${new Date(t.date).toLocaleDateString()},"${t.description.replace(/"/g, '""')}",${t.amount},${t.category},${t.type}`
      ).join("\n");

    try {
      const result = await queryFinancialData({
        userQuery,
        transactionHistoryCsv: transactionHistoryCSV,
      });
      setQueryResponse(result.answer);
    } catch (err) {
      console.error("Error processing financial query:", err);
      setQueryError("Failed to get an answer. Please try again.");
      toast({variant: "destructive", title: "AI Error", description: "Could not process your question at this time."});
    } finally {
      setIsLoadingQuery(false);
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
    <div className="space-y-12"> {/* Increased spacing between cards */}
      <PageHeader
        title="AI Financial Assistant"
        description="Get AI-powered insights and answers about your spending habits."
      />
      
      <ScrollFadeIn>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="h-6 w-6 text-primary" /> Spending Insights</CardTitle>
            <CardDescription>
              Our AI will analyze your transaction history to provide you with valuable spending trends and suggestions.
              You can add custom rules to guide the analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userRules">Custom Rules for Insights (Optional)</Label>
              <Textarea
                id="userRules"
                value={userRules}
                onChange={(e) => setUserRules(e.target.value)}
                placeholder="e.g., 'Flag any spending over $100 on Dining Out.' or 'Highlight subscriptions.'"
                className="min-h-[80px]"
                disabled={!user || isLoadingInsights}
              />
            </div>
            <Button onClick={handleGenerateInsights} disabled={isLoadingInsights || !user || currentTransactions.length === 0}>
              {isLoadingInsights ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
              Generate Insights
            </Button>
          </CardContent>
          {(insights || insightsError) && (
            <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
              <h3 className="text-lg font-medium">Generated Insights:</h3>
              {insightsError && <p className="text-red-400">{insightsError}</p>}
              {insights && <pre className="whitespace-pre-wrap text-sm p-4 bg-muted/50 rounded-md w-full">{insights}</pre>}
            </CardFooter>
          )}
        </Card>
      </ScrollFadeIn>

      <ScrollFadeIn delay="delay-200">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquareQuestion className="h-6 w-6 text-primary" /> Financial Q&amp;A</CardTitle>
            <CardDescription>
              Ask questions about your financial data. The AI will analyze your transactions to find answers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userQuery">Your Question</Label>
              <Textarea
                id="userQuery"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="e.g., 'How much did I spend on groceries last week?' or 'What are my top 3 spending categories this month?'"
                className="min-h-[80px]"
                disabled={!user || isLoadingQuery}
              />
            </div>
            <Button onClick={handleFinancialQuery} disabled={isLoadingQuery || !user || currentTransactions.length === 0}>
              {isLoadingQuery ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquareQuestion className="mr-2 h-4 w-4" />}
              Ask Question
            </Button>
          </CardContent>
          {(queryResponse || queryError) && (
            <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
              <h3 className="text-lg font-medium">AI Response:</h3>
              {queryError && <p className="text-red-400">{queryError}</p>}
              {queryResponse && <pre className="whitespace-pre-wrap text-sm p-4 bg-muted/50 rounded-md w-full">{queryResponse}</pre>}
            </CardFooter>
          )}
        </Card>
      </ScrollFadeIn>
    </div>
  );
}
