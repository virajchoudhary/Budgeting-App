"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit2, Trash2, PiggyBank } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { SavingsGoal } from '@/types';
import { mockSavingsGoals } from '@/lib/mock-data';
import { AddSavingsGoalDialog } from '@/components/savings/add-savings-goal-dialog';
import { format } from 'date-fns';

export default function SavingsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>(mockSavingsGoals);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Savings Goals"
        description="Set and track your financial savings goals."
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
            return (
              <Card key={goal.id} className="shadow-lg flex flex-col">
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
                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingGoal(goal); setIsAddDialogOpen(true);}}>
                        <Edit2 className="h-4 w-4" />
                         <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500" onClick={() => deleteGoal(goal.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-2">
                    <Progress value={progress} className="h-3 mb-2" />
                    <div className="flex justify-between text-sm">
                      <span>Saved: {goal.currentAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                      <span>Target: {goal.targetAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                  </div>
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
