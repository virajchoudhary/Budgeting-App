
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { SavingsGoal } from '@/types';

interface AddSavingsGoalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onGoalSaved: (goal: Omit<SavingsGoal, 'id' | 'userId' | 'aiTips'>) => void;
  existingGoal?: SavingsGoal;
  isSubmitting?: boolean;
}

export function AddSavingsGoalDialog({ isOpen, onOpenChange, onGoalSaved, existingGoal, isSubmitting }: AddSavingsGoalDialogProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>();

  useEffect(() => {
    if (existingGoal) {
      setName(existingGoal.name);
      setTargetAmount(String(existingGoal.targetAmount));
      setCurrentAmount(String(existingGoal.currentAmount));
      setDeadline(existingGoal.deadline ? new Date(existingGoal.deadline) : undefined);
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0'); 
      setDeadline(undefined);
    }
  }, [existingGoal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) {
      alert("Please fill in Goal Name and Target Amount.");
      return;
    }
    onGoalSaved({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount || '0'), // Ensure currentAmount is a number
      deadline: deadline?.toISOString(),
    });
     if (!isSubmitting) {
        onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onOpenChange(open)}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{existingGoal ? 'Edit Savings Goal' : 'Add New Savings Goal'}</DialogTitle>
          <DialogDescription>
            Define your financial goal and track your progress.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Goal Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g., Vacation Fund" disabled={isSubmitting} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetAmount" className="text-right">Target Amount</Label>
            <Input id="targetAmount" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="col-span-3" placeholder="e.g., 2000" step="0.01" disabled={isSubmitting} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currentAmount" className="text-right">Current Amount</Label>
            <Input id="currentAmount" type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} className="col-span-3" placeholder="e.g., 500" step="0.01" disabled={isSubmitting} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deadline" className="text-right">Deadline (Opt.)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("col-span-3 justify-start text-left font-normal", !deadline && "text-muted-foreground")} disabled={isSubmitting}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : <span>Pick a deadline</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={deadline} onSelect={setDeadline} disabled={isSubmitting} /></PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (existingGoal ? 'Save Changes' : 'Add Goal')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
