
'use server';

import { auth, db } from '@/lib/firebase';
import type { Transaction } from '@/types';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where, Timestamp, orderBy, serverTimestamp, limit as limitConstraint } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// Helper to get current user ID
const getCurrentUserId = (): string | null => {
  const user = auth.currentUser;
  return user ? user.uid : null;
};

export async function addTransaction(transactionData: Omit<Transaction, 'id' | 'userId' | 'date' | 'createdAt'> & { date: string | Date }) {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const dateTimestamp = transactionData.date instanceof Date
    ? Timestamp.fromDate(transactionData.date)
    : Timestamp.fromDate(new Date(transactionData.date));

  const newTransaction = {
    ...transactionData,
    userId,
    date: dateTimestamp,
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, 'transactions'), newTransaction);
    revalidatePath('/transactions');
    revalidatePath('/'); // For dashboard
    return { 
      id: docRef.id, 
      ...newTransaction, 
      date: dateTimestamp.toDate().toISOString(),
      createdAt: new Date().toISOString(), // Approximate client representation
    } as Transaction;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw new Error('Failed to add transaction.');
  }
}

export async function getTransactions(fetchLimit?: number): Promise<Transaction[]> {
  const userId = getCurrentUserId();
  if (!userId) {
    return [];
  }

  try {
    const transactionsCollection = collection(db, 'transactions');
    const queryConstraints: any[] = [ // Use any[] to allow pushing limitConstraint conditionally
        where('userId', '==', userId),
        orderBy('date', 'desc')
    ];

    if (fetchLimit && fetchLimit > 0) {
        queryConstraints.push(limitConstraint(fetchLimit));
    }
    
    const finalQuery = query(transactionsCollection, ...queryConstraints);

    const querySnapshot = await getDocs(finalQuery);
    const transactions = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        date: (data.date as Timestamp).toDate().toISOString(),
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : undefined,
      } as Transaction;
    });
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions.');
  }
}


export async function updateTransaction(transactionId: string, updatedData: Partial<Omit<Transaction, 'id' | 'userId'>>) {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const transactionDocRef = doc(db, 'transactions', transactionId);
  
  const dataToUpdate: any = { ...updatedData };
  if (updatedData.date && typeof updatedData.date === 'string') {
    dataToUpdate.date = Timestamp.fromDate(new Date(updatedData.date));
  } else if (updatedData.date instanceof Date) {
    dataToUpdate.date = Timestamp.fromDate(updatedData.date);
  }
  // Note: createdAt is not updated. If updatedAt is desired, add here with serverTimestamp().


  try {
    await updateDoc(transactionDocRef, dataToUpdate);
    revalidatePath('/transactions');
    revalidatePath('/');
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw new Error('Failed to update transaction.');
  }
}

export async function deleteTransaction(transactionId: string) {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const transactionDocRef = doc(db, 'transactions', transactionId);

  try {
    await deleteDoc(transactionDocRef);
    revalidatePath('/transactions');
    revalidatePath('/');
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw new Error('Failed to delete transaction.');
  }
}

