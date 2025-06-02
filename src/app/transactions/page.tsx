
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileInputIcon, Loader2 } from 'lucide-react';
import { TransactionList } from '@/components/transactions/transaction-list';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import type { Transaction } from '@/types';
import { mockTransactions } from '@/lib/mock-data';
import Link from 'next/link';
import { ScrollFadeIn } from '@/components/shared/scroll-fade-in';
import { useAuth } from '@/contexts/auth-context';
import { getTransactions, addTransaction as addTransactionAction, updateTransaction as updateTransactionAction, deleteTransaction as deleteTransactionAction } from '@/actions/transactions';
import { useToast } from '@/hooks/use-toast';


export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const fetchUserTransactions = useCallback(async () => {
    if (!user && !authLoading) { // Show mock data if not logged in and auth check is complete
      setTransactions(mockTransactions);
      setIsLoadingData(false);
      return;
    }
    if (!user && authLoading) { // Still loading auth state, don't fetch yet
        setIsLoadingData(true);
        return;
    }
    // If user is present, proceed to fetch their data
    setIsLoadingData(true);
    try {
      const userTransactions = await getTransactions();
      setTransactions(userTransactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not fetch transactions." });
      setTransactions(mockTransactions);
    } finally {
      setIsLoadingData(false);
    }
  }, [user, authLoading, toast]);

  useEffect(() => {
    fetchUserTransactions();
  }, [fetchUserTransactions]);


  useEffect(() => {
    const openDialogIfHashPresent = () => {
      if (window.location.hash === '#add') {
        if (user) {
          setIsAddDialogOpen(true);
        } else if (!authLoading) {
          toast({ title: "Authentication Required", description: "Please log in to add a transaction."});
          router.push('/login');
          window.location.hash = '';
        }
      }
    };
    openDialogIfHashPresent();
    
    window.addEventListener('hashchange', openDialogIfHashPresent);
    return () => window.removeEventListener('hashchange', openDialogIfHashPresent);

  }, [user, authLoading, router, toast]);


  const handleOpenAddDialog = () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to add a transaction." });
      router.push('/login');
      return;
    }
    setIsAddDialogOpen(true);
  };
  
  const handleOpenImportPage = () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to import transactions." });
      router.push('/login');
      return;
    }
    router.push('/import');
  };

  const handleAddTransaction = async (newTransactionData: Omit<Transaction, 'id' | 'userId' | 'date' | 'createdAt'> & { date: string | Date }) => {
    if(!user) return; // Should be caught by button logic, but safety check
    try {
      await addTransactionAction(newTransactionData);
      toast({ title: "Transaction Added", description: "Your transaction has been saved." });
      fetchUserTransactions(); 
      setIsAddDialogOpen(false); 
    } catch (error: any) {
      console.error("Failed to add transaction:", error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not add transaction." });
    }
  };
  
  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
     if(!user) return;
    try {
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
    if(!user) return;
     try {
      await deleteTransactionAction(transactionId);
      toast({ title: "Transaction Deleted", description: "Your transaction has been removed." });
      fetchUserTransactions();
    } catch (error: any) {
      console.error("Failed to delete transaction:", error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not delete transaction." });
    }
  };
  
  const pageIsLoading = authLoading || isLoadingData;

  if (pageIsLoading && !transactions.length) { // Show loader if truly loading and no data yet (prevents flash if mock data shown first)
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
            <Button onClick={handleOpenAddDialog} disabled={authLoading && !user}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
            </Button>
            <Button variant="outline" onClick={handleOpenImportPage} disabled={authLoading && !user}>
              <FileInputIcon className="mr-2 h-4 w-4" /> Import CSV
            </Button>
          </>
        }
      />
      <ScrollFadeIn>
        <TransactionList 
          transactions={transactions} 
          onEditTransaction={handleUpdateTransaction} 
          onDeleteTransaction={handleDeleteTransaction}
          canEditDelete={!!user} 
        />
      </ScrollFadeIn>
     
      <AddTransactionDialog
          isOpen={isAddDialogOpen && !!user} 
          onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              if(window.location.hash === '#add') window.location.hash = ''; 
            } else if (user) { 
                 setIsAddDialogOpen(true);
            } else if (!authLoading) { 
                toast({ title: "Authentication Required", description: "Please log in to add a transaction."});
                router.push('/login');
            }
          }}
          onTransactionAdded={handleAddTransaction}
        />
    </div>
  );
}
