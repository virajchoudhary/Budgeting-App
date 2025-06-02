
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
import { CalendarIcon, Sparkles, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Transaction, TransactionCategory } from '@/types';
import { transactionCategories } from '@/types';
import { categorizeTransaction } from '@/ai/flows/categorize-transaction';

interface AddTransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // Accepts data for new transaction (userId handled by action) or full existing transaction for updates
  onTransactionAdded: (transactionData: Omit<Transaction, 'id' | 'userId' | 'date'> & { date: string | Date }) => void;
  existingTransaction?: Transaction; // Full transaction for editing
}

export function AddTransactionDialog({
  isOpen,
  onOpenChange,
  onTransactionAdded,
  existingTransaction
}: AddTransactionDialogProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState<TransactionCategory | ''>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [userRules, setUserRules] = useState('');

  useEffect(() => {
    if (existingTransaction) {
      setDescription(existingTransaction.description);
      setAmount(String(Math.abs(existingTransaction.amount)));
      setDate(new Date(existingTransaction.date)); // existingTransaction.date is ISO string
      setCategory(existingTransaction.category as TransactionCategory);
      setType(existingTransaction.type);
    } else {
      setDescription('');
      setAmount('');
      setDate(new Date());
      setCategory('');
      setType('expense');
      setUserRules('');
    }
  }, [existingTransaction, isOpen]);


  const handleSuggestCategory = async () => {
    if (!description) {
      alert("Please enter a description to suggest a category.");
      return;
    }
    setIsCategorizing(true);
    try {
      const result = await categorizeTransaction({ transactionDescription: description, userRules });
      if (result.suggestedCategory && transactionCategories.includes(result.suggestedCategory as TransactionCategory)) {
        setCategory(result.suggestedCategory as TransactionCategory);
      } else {
        setCategory('Uncategorized');
      }
    } catch (error) {
      console.error("Error suggesting category:", error);
      setCategory('Uncategorized');
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !description || !amount || !category) {
      alert("Please fill all required fields.");
      return;
    }
    const numericAmount = parseFloat(amount);
    
    // Data for server action. `id` and `userId` are handled by the action or not needed for new.
    const transactionData = {
      date: date.toISOString(), // Server action expects date string or Date object
      description,
      amount: type === 'expense' ? -numericAmount : numericAmount,
      category,
      type,
    };

    onTransactionAdded(transactionData);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{existingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
          <DialogDescription>
            {existingTransaction ? 'Update the details of your transaction.' : 'Enter the details of your new income or expense.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="e.g., Coffee with friend" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">Amount</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" placeholder="e.g., 15.50" step="0.01" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Type</Label>
            <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <div className="col-span-3 flex gap-2">
              <Select value={category} onValueChange={(value: TransactionCategory) => setCategory(value)}>
                <SelectTrigger className="flex-grow">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {transactionCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="icon" onClick={handleSuggestCategory} disabled={isCategorizing} title="Suggest Category with AI">
                {isCategorizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="userRules" className="text-right">AI Rules (Opt.)</Label>
            <Input id="userRules" value={userRules} onChange={(e) => setUserRules(e.target.value)} className="col-span-3" placeholder="e.g., 'Amazon' is 'Shopping'" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{existingTransaction ? 'Save Changes' : 'Add Transaction'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
