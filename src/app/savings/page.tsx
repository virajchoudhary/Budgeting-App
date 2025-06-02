
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit2, Trash2, PiggyBank, Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { SavingsGoal } from '@/types';
import { mockSavingsGoals } from '@/lib/mock-data';
import { AddSavingsGoalDialog } from '@/components/savings/add-savings-goal-dialog';
import { format } from 'date-fns';
import { useSettings } from '@/contexts/settings-context';
import { generateSavingsGoalTips } from '@/ai/flows/savings-goal-tips-flow';
import { useToast } from '@/hooks/use-toast';
import { ScrollFadeIn } from '@/components/shared/scroll-fade-in';
import { useAuth } from '@/contexts/auth-context';
import { getSavingsGoals, addSavingsGoal as addGoalAction, updateSavingsGoal as updateGoalAction, deleteSavingsGoal as deleteGoalAction, updateSavingsGoalAITips } from '@/actions/savingsGoals';


interface GoalLoadingState {
  [goalId: string]: boolean; // For AI tips loading
}

export default function SavingsPage() {
  const { currency } = useSettings();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [loadingTips, setLoadingTips] = useState<GoalLoadingState>({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isMutating, setIsMutating] = useState(false); // For add/edit/delete operations

  const fetchUserSavingsGoals = useCallback(async () => {
    if (!user) {
      setGoals(mockSavingsGoals);
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    try {
      const userGoals = await getSavingsGoals();
      setGoals(userGoals);
    } catch (error) {
      console.error("Failed to fetch savings goals:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not fetch savings goals." });
      setGoals(mockSavingsGoals); // Fallback
    } finally {
      setIsLoadingData(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchUserSavingsGoals();
    }
  }, [authLoading, fetchUserSavingsGoals]);

  const handleAddGoal = async (newGoalData: Omit<SavingsGoal, 'id' | 'userId' | 'aiTips'>) => {
    if (!user) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "Please log in to add goals." });
      return;
    }
    setIsMutating(true);
    try {
      await addGoalAction(newGoalData);
      toast({ title: "Savings Goal Added", description: "Your new goal has been saved." });
      fetchUserSavingsGoals();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not add goal." });
    } finally {
      setIsMutating(false);
      setIsAddDialogOpen(false); // Close dialog
    }
  };

  const handleUpdateGoal = async (updatedGoalData: Omit<SavingsGoal, 'id' | 'userId' | 'aiTips'>) => {
    if (!editingGoal || !user) {
      toast({ variant: "destructive", title: "Error", description: "Cannot update goal." });
      return;
    }
    setIsMutating(true);
    try {
      await updateGoalAction(editingGoal.id, updatedGoalData);
      toast({ title: "Savings Goal Updated", description: "Your goal has been updated." });
      fetchUserSavingsGoals();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not update goal." });
    } finally {
      setEditingGoal(null);
      setIsMutating(false);
      setIsAddDialogOpen(false); // Close dialog
    }
  };
  
  const handleDeleteGoal = async (goalId: string) => {
    if (!user) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "Please log in to delete goals." });
      return;
    }
    setIsMutating(true);
    try {
      await deleteGoalAction(goalId);
      toast({ title: "Savings Goal Deleted", description: "Your goal has been removed." });
      fetchUserSavingsGoals();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not delete goal." });
    } finally {
      setIsMutating(false);
    }
  };

  const handleFetchAiTips = async (goal: SavingsGoal) => {
    if (!user) {
        toast({ variant: "destructive", title: "Login Required", description: "Please log in to get AI tips." });
        return;
    }
    setLoadingTips(prev => ({ ...prev, [goal.id]: true }));
    try {
      const result = await generateSavingsGoalTips({
        goalName: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: goal.deadline,
      });
      await updateSavingsGoalAITips(goal.id, result.tips); // Save tips to Firestore
      setGoals(prevGoals => 
        prevGoals.map(g => 
          g.id === goal.id ? { ...g, aiTips: result.tips } : g
        )
      );
      toast({ title: "AI Tips Generated!", description: "Your personalized tips are ready."});
    } catch (error) {
      console.error("Error fetching AI tips:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch AI tips. Please try again.",
      });
    } finally {
      setLoadingTips(prev => ({ ...prev, [goal.id]: false }));
    }
  };

  const pageIsLoading = authLoading || isLoadingData;

  if (pageIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Savings Goals"
        description="Set and track your financial savings goals. Get AI-powered tips!"
        actions={
          <Button onClick={() => { setEditingGoal(null); setIsAddDialogOpen(true); }} disabled={!user || (isMutating && !editingGoal)}>
            {(isMutating && !editingGoal) ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2 h-4 w-4" />}
             Add Savings Goal
          </Button>
        }
      />

      {goals.length === 0 ? (
        <ScrollFadeIn>
         <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            {user ? "No savings goals set yet. Click 'Add Savings Goal' to get started." : "Log in to manage your savings goals."}
          </CardContent>
        </Card>
        </ScrollFadeIn>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const isAITipsLoading = loadingTips[goal.id];
            
            return (
              <ScrollFadeIn key={goal.id}>
                <Card className="flex flex-col h-full"> {/* Removed hover scale/shadow */}
                  <CardHeader>
                     <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <PiggyBank className="h-8 w-8 text-primary" />
                        <div>
                          <CardTitle className="text-xl">{goal.name}</CardTitle>
                          {goal.deadline && <CardDescription>Deadline: {format(new Date(goal.deadline), "MMM dd, yyyy")}</CardDescription>}
                        </div>
                      </div>
                       {user && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingGoal(goal); setIsAddDialogOpen(true);}} disabled={(isMutating && editingGoal?.id === goal.id) || isAITipsLoading}>
                             {(isMutating && editingGoal?.id === goal.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit2 className="h-4 w-4" />}
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500" onClick={() => handleDeleteGoal(goal.id)} disabled={isMutating || isAITipsLoading}>
                            {isMutating && editingGoal?.id !== goal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                       )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <div>
                      <Progress value={progress} className="h-3 mb-2" />
                      <div className="flex justify-between text-sm">
                        <span>Saved: {goal.currentAmount.toLocaleString('en-US', { style: 'currency', currency: currency })}</span>
                        <span>Target: {goal.targetAmount.toLocaleString('en-US', { style: 'currency', currency: currency })}</span>
                      </div>
                    </div>
                    {goal.aiTips ? (
                      <div className="space-y-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                          <Sparkles className="h-4 w-4" />
                          <span>AI Coach Tips:</span>
                        </div>
                        <pre className="whitespace-pre-wrap text-xs p-3 bg-muted/30 rounded-md text-muted-foreground leading-relaxed">
                          {goal.aiTips}
                        </pre>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleFetchAiTips(goal)} 
                        disabled={!user || isAITipsLoading || isMutating}
                      >
                        {isAITipsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4 text-yellow-400" />}
                        {isAITipsLoading ? 'Getting Tips...' : 'Get AI Tips'}
                      </Button>
                    )}
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-primary">{progress.toFixed(1)}% Complete</p>
                  </CardFooter>
                </Card>
              </ScrollFadeIn>
            );
          })}
        </div>
      )}

      {user && (
        <AddSavingsGoalDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onGoalSaved={editingGoal ? handleUpdateGoal : handleAddGoal}
            existingGoal={editingGoal ?? undefined}
            isSubmitting={isMutating && (editingGoal ? editingGoal.id === editingGoal?.id : !editingGoal)}
        />
      )}
    </div>
  );
}
