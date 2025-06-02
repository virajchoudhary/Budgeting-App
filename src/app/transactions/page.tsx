
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileInputIcon } from 'lucide-react';
import { TransactionList } from '@/components/transactions/transaction-list';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import type { Transaction } from '@/types';
// import { mockTransactions } from '@/lib/mock-data'; // No longer using mock data here
import Link from 'next/link';
import { ScrollFadeIn } from '@/components/shared/scroll-fade-in';
import { useAuth } from '@/contexts/auth-context';
import { getTransactions, addTransaction as addTransactionAction, updateTransaction as updateTransactionAction, deleteTransaction as deleteTransactionAction } from '@/actions/transactions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const userTransactions = await getTransactions();
      setTransactions(userTransactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not fetch transactions." });
      setTransactions([]); // Clear transactions on error
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchUserTransactions();
  }, [fetchUserTransactions]);

  useEffect(() => {
    if (window.location.hash === '#add' && user) {
      setIsAddDialogOpen(true);
    }
  }, [user]);

  const handleAddTransaction = async (newTransactionData: Omit<Transaction, 'id' | 'userId' | 'date'> & { date: string | Date }) => {
    if (!user) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to add transactions." });
      return;
    }
    try {
      // The server action `addTransactionAction` will handle associating the userId
      await addTransactionAction(newTransactionData);
      toast({ title: "Transaction Added", description: "Your transaction has been saved." });
      fetchUserTransactions(); // Re-fetch to update list
    } catch (error: any) {
      console.error("Failed to add transaction:", error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not add transaction." });
    }
  };
  
  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
     if (!user) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to update transactions." });
      return;
    }
    try {
      // Prepare data for server action, excluding id and userId as they are handled by action/doc ref
      const { id, userId: uId, ...dataToUpdate } = updatedTransaction;
      await updateTransactionAction(id, dataToUpdate);
      toast({ title: "Transaction Updated", description: "Your transaction has been updated." });
      fetchUserTransactions();
    } catch (error: any) {
      console.error("Failed to update transaction:", error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not update transaction." });
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to delete transactions." });
      return;
    }
     try {
      await deleteTransactionAction(transactionId);
      toast({ title: "Transaction Deleted", description: "Your transaction has been removed." });
      fetchUserTransactions();
    } catch (error: any) {
      console.error("Failed to delete transaction:", error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not delete transaction." });
    }
  };

  if (!user && !isLoading) {
    return (
      <div className="space-y-8 text-center">
        <PageHeader title="Transactions" description="Please log in to manage your transactions." />
        <Link href="/login">
          <Button>Log In</Button>
        </Link>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Transactions"
        description="Manage your income and expenses."
        actions={
          <>
            <Button onClick={() => setIsAddDialogOpen(true)} disabled={!user}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
            </Button>
            <Link href="/import" passHref>
              <Button variant="outline" disabled={!user}>
                <FileInputIcon className="mr-2 h-4 w-4" /> Import CSV
              </Button>
            </Link>
          </>
        }
      />
      <ScrollFadeIn>
        <TransactionList 
          transactions={transactions} 
          onEditTransaction={handleUpdateTransaction} 
          onDeleteTransaction={handleDeleteTransaction} 
        />
      </ScrollFadeIn>
      <AddTransactionDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onTransactionAdded={handleAddTransaction}
      />
    </div>
  );
}
