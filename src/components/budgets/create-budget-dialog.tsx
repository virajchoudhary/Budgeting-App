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
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Budget, TransactionCategory } from '@/types';
import { transactionCategories } from '@/types'; // Use the same categories as transactions

interface CreateBudgetDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onBudgetSaved: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  existingBudget?: Budget;
}

export function CreateBudgetDialog({ isOpen, onOpenChange, onBudgetSaved, existingBudget }: CreateBudgetDialogProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory | ''>('');
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()));

  useEffect(() => {
    if (existingBudget) {
      setName(existingBudget.name);
      setAmount(String(existingBudget.amount));
      setCategory(existingBudget.category as TransactionCategory);
      setStartDate(new Date(existingBudget.startDate));
      setEndDate(new Date(existingBudget.endDate));
    } else {
      // Reset for new budget
      setName('');
      setAmount('');
      setCategory('');
      setStartDate(startOfMonth(new Date()));
      setEndDate(endOfMonth(new Date()));
    }
  }, [existingBudget, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!name || !amount || !category || !startDate || !endDate) {
      alert("Please fill all fields.");
      return;
    }
    onBudgetSaved({
      name,
      amount: parseFloat(amount),
      category,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    onOpenChange(false); // Close dialog
  };
  
  const budgetCategories = transactionCategories.filter(cat => cat !== 'Income' && cat !== 'Uncategorized');


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{existingBudget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
          <DialogDescription>
            Set up a budget to track your spending in a specific category.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Budget Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g., Monthly Groceries" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">Amount</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" placeholder="e.g., 400" step="0.01" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <Select value={category} onValueChange={(value: TransactionCategory) => setCategory(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {budgetCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
                 <SelectItem value="Overall">Overall</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("col-span-3 justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("col-span-3 justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus /></PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{existingBudget ? 'Save Changes' : 'Create Budget'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
