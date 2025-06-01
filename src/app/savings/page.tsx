
"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit2, Trash2, PiggyBank, Lightbulb, Loader2, Sparkles } from 'lucide-react'; // Added Lightbulb, Loader2, Sparkles
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { SavingsGoal } from '@/types';
import { mockSavingsGoals } from '@/lib/mock-data';
import { AddSavingsGoalDialog } from '@/components/savings/add-savings-goal-dialog';
import { format } from 'date-fns';
import { useSettings } from '@/contexts/settings-context';
import { generateSavingsGoalTips } from '@/ai/flows/savings-goal-tips-flow'; // Import the new flow
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface GoalLoadingState {
  [goalId: string]: boolean;
}

export default function SavingsPage() {
  const { currency } = useSettings();
  const [goals, setGoals] = useState<SavingsGoal[]>(mockSavingsGoals);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [loadingTips, setLoadingTips] = useState<GoalLoadingState>({});
  const { toast } = useToast();

  const addGoal = (newGoal: Omit<SavingsGoal, 'id'>) => {
    setGoals(prev => [{ ...newGoal, id: String(Date.now()) }, ...prev]);
  };

  const updateGoal = (updatedGoalData: Omit<SavingsGoal, 'id'>) => {
     if (editingGoal) {
      setGoals(prev => prev.map(g => g.id === editingGoal.id ? { ...editingGoal, ...updatedGoalData } : g));
    }
    setEditingGoal(null);
  };
  
  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const handleFetchAiTips = async (goal: SavingsGoal) => {
    setLoadingTips(prev => ({ ...prev, [goal.id]: true }));
    try {
      const result = await generateSavingsGoalTips({
        goalName: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: goal.deadline,
      });
      setGoals(prevGoals => 
        prevGoals.map(g => 
          g.id === goal.id ? { ...g, aiTips: result.tips } : g
        )
      );
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Savings Goals"
        description="Set and track your financial savings goals. Get AI-powered tips!"
        actions={
          <Button onClick={() => { setEditingGoal(null); setIsAddDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Savings Goal
          </Button>
        }
      />

      {goals.length === 0 ? (
         <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No savings goals set yet. Click "Add Savings Goal" to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const isLoading = loadingTips[goal.id];
            return (
              <Card key={goal.id} className="flex flex-col hover:shadow-xl transition-shadow duration-300 hover:scale-[1.01] transform transition-transform duration-300">
                <CardHeader>
                   <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <PiggyBank className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle className="text-xl">{goal.name}</CardTitle>
                        {goal.deadline && <CardDescription>Deadline: {format(new Date(goal.deadline), "MMM dd, yyyy")}</CardDescription>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                       <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-transparent" onClick={() => { setEditingGoal(goal); setIsAddDialogOpen(true);}}>
                        <Edit2 className="h-4 w-4" />
                         <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-transparent" onClick={() => deleteGoal(goal.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
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
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4 text-yellow-400" />}
                      {isLoading ? 'Getting Tips...' : 'Get AI Tips'}
                    </Button>
                  )}
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-primary">{progress.toFixed(1)}% Complete</p>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <AddSavingsGoalDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onGoalSaved={editingGoal ? updateGoal : addGoal}
        existingGoal={editingGoal ?? undefined}
      />
    </div>
  );
}
