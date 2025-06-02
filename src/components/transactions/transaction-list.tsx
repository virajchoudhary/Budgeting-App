
"use client";

import React, { useState } from 'react';
import type { Transaction } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, MoreVertical, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddTransactionDialog } from './add-transaction-dialog';
import { useSettings } from '@/contexts/settings-context';
import { ScrollFadeIn } from '@/components/shared/scroll-fade-in'; 

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => Promise<void>; 
  onDeleteTransaction: (transactionId: string) => Promise<void>; 
  canEditDelete: boolean; 
}

const staggerDelays: (`delay-${number}`)[] = ['delay-0', 'delay-75', 'delay-150', 'delay-200', 'delay-300'];


export function TransactionList({ transactions, onEditTransaction, onDeleteTransaction, canEditDelete }: TransactionListProps) {
  const { currency } = useSettings();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionedTransactionId, setActionedTransactionId] = useState<string | null>(null); 

  const handleEdit = (transaction: Transaction) => {
    if (!canEditDelete) return; 
    setEditingTransaction(transaction);
  };

  const handleSaveEdit = async (transactionData: Omit<Transaction, 'id' | 'userId' | 'date'> & { date: string | Date }) => {
    if (!editingTransaction || !canEditDelete) return;
    setActionedTransactionId(editingTransaction.id);
    setIsSubmitting(true);
    const updatedTransaction: Transaction = {
      ...editingTransaction, 
      ...transactionData,
      date: transactionData.date instanceof Date ? transactionData.date.toISOString() : new Date(transactionData.date).toISOString(),
    };
    try {
      await onEditTransaction(updatedTransaction);
    } finally {
      setEditingTransaction(null);
      setIsSubmitting(false);
      setActionedTransactionId(null);
    }
  };

  const handleDelete = async (transactionId: string) => {
    if (!canEditDelete) return;
    setActionedTransactionId(transactionId);
    setIsSubmitting(true);
    try {
      await onDeleteTransaction(transactionId);
    } finally {
      setIsSubmitting(false);
      setActionedTransactionId(null);
    }
  }
  
  if (transactions.length === 0) {
    return (
      <ScrollFadeIn>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No transactions recorded yet. Add one or import a CSV file to get started.
          </CardContent>
        </Card>
      </ScrollFadeIn>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                {canEditDelete && <TableHead className="text-center">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => {
                const delayClass = staggerDelays[Math.min(index, staggerDelays.length - 1)];
                return (
                  <ScrollFadeIn key={transaction.id} delay={delayClass as `delay-${number}` | undefined}>
                    <TableRow className="hover:bg-muted/20 transition-colors duration-150">
                      <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell><Badge variant="outline">{transaction.category}</Badge></TableCell>
                      <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.type === 'expense' ? '-' : ''}
                        {Math.abs(transaction.amount).toLocaleString('en-US', { style: 'currency', currency: currency })}
                      </TableCell>
                      {canEditDelete && (
                        <TableCell className="text-center">
                          {isSubmitting && actionedTransactionId === transaction.id ? (
                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                          ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(transaction)} disabled={isSubmitting}>
                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(transaction.id)} className="text-red-400 hover:!text-red-400 focus:!text-red-400" disabled={isSubmitting}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  </ScrollFadeIn>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {editingTransaction && canEditDelete && ( 
        <AddTransactionDialog
          isOpen={!!editingTransaction}
          onOpenChange={(open) => {
            if (!open && isSubmitting) return; 
            setEditingTransaction(null)
          }}
          onTransactionAdded={handleSaveEdit}
          existingTransaction={editingTransaction}
        />
      )}
    </>
  );
}

