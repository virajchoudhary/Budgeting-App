
"use client";

import React, { useState } from 'react';
import type { Transaction } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddTransactionDialog } from './add-transaction-dialog'; // Re-use for editing
import { useSettings } from '@/contexts/settings-context';

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

export function TransactionList({ transactions, onEditTransaction, onDeleteTransaction }: TransactionListProps) {
  const { currency } = useSettings();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleSaveEdit = (updatedTransaction: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      onEditTransaction({ ...updatedTransaction, id: editingTransaction.id });
    }
    setEditingTransaction(null);
  };
  
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No transactions recorded yet. Add one or import a CSV file to get started.
        </CardContent>
      </Card>
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
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell><Badge variant={transaction.category === 'Income' ? 'default' : 'secondary'} className={transaction.category === 'Income' ? 'bg-green-500/20 text-green-300 border-green-500/30' : ''}>{transaction.category}</Badge></TableCell>
                  <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {transaction.type === 'expense' ? '-' : ''}
                    {Math.abs(transaction.amount).toLocaleString('en-US', { style: 'currency', currency: currency })}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-transparent">
                          <MoreVertical className="h-4 w-4" />
                           <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDeleteTransaction(transaction.id)} className="text-red-400 hover:!text-red-400 focus:!text-red-400">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {editingTransaction && (
        <AddTransactionDialog
          isOpen={!!editingTransaction}
          onOpenChange={() => setEditingTransaction(null)}
          onTransactionAdded={handleSaveEdit}
          existingTransaction={editingTransaction}
        />
      )}
    </>
  );
}
