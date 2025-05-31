"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileInputIcon } from 'lucide-react';
import { TransactionList } from '@/components/transactions/transaction-list';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import type { Transaction } from '@/types';
import { mockTransactions } from '@/lib/mock-data';
import Link from 'next/link';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    // Check for URL hash to open dialog
    if (window.location.hash === '#add') {
      setIsAddDialogOpen(true);
    }
  }, []);

  const addTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [{ ...newTransaction, id: String(Date.now()) }, ...prev]);
  };
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };


  return (
    <div className="space-y-8">
      <PageHeader
        title="Transactions"
        description="Manage your income and expenses."
        actions={
          <>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
            </Button>
            <Link href="/import" passHref>
              <Button variant="outline">
                <FileInputIcon className="mr-2 h-4 w-4" /> Import CSV
              </Button>
            </Link>
          </>
        }
      />
      <TransactionList 
        transactions={transactions} 
        onEditTransaction={updateTransaction} 
        onDeleteTransaction={deleteTransaction} 
      />
      <AddTransactionDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onTransactionAdded={addTransaction}
      />
    </div>
  );
}
