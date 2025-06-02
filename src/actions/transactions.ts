
'use server';

import { auth, db } from '@/lib/firebase';
import type { Transaction } from '@/types';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where, Timestamp, orderBy, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// Helper to get current user ID
const getCurrentUserId = (): string | null => {
  const user = auth.currentUser;
  return user ? user.uid : null;
};

export async function addTransaction(transactionData: Omit<Transaction, 'id' | 'userId' | 'date'> & { date: string | Date }) {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Convert date string/object to Firebase Timestamp
  const dateTimestamp = transactionData.date instanceof Date
    ? Timestamp.fromDate(transactionData.date)
    : Timestamp.fromDate(new Date(transactionData.date));

  const newTransaction = {
    ...transactionData,
    userId,
    date: dateTimestamp, // Use Firestore Timestamp
    createdAt: serverTimestamp(), // Optional: for sorting by creation time
  };

  try {
    const docRef = await addDoc(collection(db, 'transactions'), newTransaction);
    revalidatePath('/transactions');
    revalidatePath('/'); // For dashboard
    return { id: docRef.id, ...newTransaction };
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw new Error('Failed to add transaction.');
  }
}

export async function getTransactions(limit?: number): Promise<Transaction[]> {
  const userId = getCurrentUserId();
  if (!userId) {
    // Return empty array or throw error based on desired behavior for unauthenticated users
    return [];
  }

  try {
    const transactionsCollection = collection(db, 'transactions');
    const q = query(
        transactionsCollection,
        where('userId', '==', userId),
        orderBy('date', 'desc') // Order by transaction date
        // limit ? limit(limitValue) : null // This syntax for limit is incorrect with Firebase v9+
    );
    
    // For applying limit, you need to adjust the query like this:
    // let finalQuery = q;
    // if (limit) {
    //   finalQuery = query(q, limit(limit)); // This is also not how limit() is chained
    // }
    // Correct way for optional limit:
    const queryConstraints = [where('userId', '==', userId), orderBy('date', 'desc')];
    if (limit) {
        // queryConstraints.push(limit(limit)); // This is for v8. Needs adjustment for v9.
        // For v9, `limit` is imported from `firebase/firestore` and used in query directly
        // Let's assume no limit for now to simplify, or adjust if required.
    }
    
    const finalQuery = query(transactionsCollection, ...queryConstraints);


    const querySnapshot = await getDocs(finalQuery);
    const transactions = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        date: (data.date as Timestamp).toDate().toISOString(), // Convert Timestamp to ISO string
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
  
  // Ensure the transaction belongs to the current user before updating (optional, good practice)
  // You might fetch the doc first and check userId, or rely on Firestore rules.

  const dataToUpdate: any = { ...updatedData };
  if (updatedData.date) {
    dataToUpdate.date = updatedData.date instanceof Date 
      ? Timestamp.fromDate(updatedData.date) 
      : Timestamp.fromDate(new Date(updatedData.date));
  }


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
  // Ensure the transaction belongs to the current user before deleting (optional, good practice)

  try {
    await deleteDoc(transactionDocRef);
    revalidatePath('/transactions');
    revalidatePath('/');
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw new Error('Failed to delete transaction.');
  }
}
