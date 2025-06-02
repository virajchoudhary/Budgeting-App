
'use server';

import { auth, db } from '@/lib/firebase';
import type { Budget } from '@/types';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where, serverTimestamp, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// Helper to get current user ID
const getCurrentUserId = (): string | null => {
  const user = auth.currentUser;
  return user ? user.uid : null;
};

export async function addBudget(budgetData: Omit<Budget, 'id' | 'userId' | 'spent'>) {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const newBudget = {
    ...budgetData,
    userId,
    spent: 0, // Initialize spent to 0
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    startDate: Timestamp.fromDate(new Date(budgetData.startDate)),
    endDate: Timestamp.fromDate(new Date(budgetData.endDate)),
  };

  try {
    const docRef = await addDoc(collection(db, 'budgets'), newBudget);
    revalidatePath('/budgets');
    revalidatePath('/'); // For dashboard budget overview
    // Return the budget data in the same shape the client expects (dates as ISO strings)
    return { 
      id: docRef.id, 
      ...newBudget, 
      startDate: budgetData.startDate, 
      endDate: budgetData.endDate,
      createdAt: new Date().toISOString(), // Approximate client-side representation
      updatedAt: new Date().toISOString(), // Approximate client-side representation
    } as Budget;
  } catch (error) {
    console.error('Error adding budget:', error);
    throw new Error('Failed to add budget.');
  }
}

export async function getBudgets(): Promise<Budget[]> {
  const userId = getCurrentUserId();
  if (!userId) {
    return [];
  }

  try {
    const budgetsCollection = collection(db, 'budgets');
    const q = query(budgetsCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const budgets = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        startDate: (data.startDate as Timestamp).toDate().toISOString(),
        endDate: (data.endDate as Timestamp).toDate().toISOString(),
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : undefined,
        updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate().toISOString() : undefined,
      } as Budget;
    });
    return budgets;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw new Error('Failed to fetch budgets.');
  }
}

export async function updateBudget(budgetId: string, updatedData: Partial<Omit<Budget, 'id' | 'userId'>>) {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const budgetDocRef = doc(db, 'budgets', budgetId);
  
  const dataToUpdate: any = { ...updatedData, updatedAt: serverTimestamp() };

  if (updatedData.startDate && typeof updatedData.startDate === 'string') {
    dataToUpdate.startDate = Timestamp.fromDate(new Date(updatedData.startDate));
  } else if (updatedData.startDate instanceof Date) {
     dataToUpdate.startDate = Timestamp.fromDate(updatedData.startDate);
  }

  if (updatedData.endDate && typeof updatedData.endDate === 'string') {
    dataToUpdate.endDate = Timestamp.fromDate(new Date(updatedData.endDate));
  } else if (updatedData.endDate instanceof Date) {
    dataToUpdate.endDate = Timestamp.fromDate(updatedData.endDate);
  }

  try {
    await updateDoc(budgetDocRef, dataToUpdate);
    revalidatePath('/budgets');
    revalidatePath('/');
  } catch (error) {
    console.error('Error updating budget:', error);
    throw new Error('Failed to update budget.');
  }
}

export async function deleteBudget(budgetId: string) {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const budgetDocRef = doc(db, 'budgets', budgetId);

  try {
    await deleteDoc(budgetDocRef);
    revalidatePath('/budgets');
    revalidatePath('/');
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw new Error('Failed to delete budget.');
  }
}
