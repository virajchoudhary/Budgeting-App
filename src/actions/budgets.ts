
'use server';

import { auth, db } from '@/lib/firebase';
import type { Budget } from '@/types';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where, serverTimestamp, Timestamp, limit as limitConstraint, orderBy } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// Helper to get current user ID
const getCurrentUserId = (): string | null => {
  const user = auth.currentUser;
  return user ? user.uid : null;
};

// Note: The 'spent' field in the Budget type now represents the client-calculated spent amount.
// When adding a budget, 'spent' is initialized to 0 as a placeholder or if needed for Firestore structure,
// but its primary source of truth for display will be client-side calculations.
export async function addBudget(budgetData: Omit<Budget, 'id' | 'userId' | 'spent' | 'createdAt' | 'updatedAt'>) {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const newBudget = {
    ...budgetData,
    userId,
    spent: 0, // Initialize spent to 0; actual spent amount will be calculated client-side
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    startDate: Timestamp.fromDate(new Date(budgetData.startDate)),
    endDate: Timestamp.fromDate(new Date(budgetData.endDate)),
  };

  try {
    const docRef = await addDoc(collection(db, 'budgets'), newBudget);
    revalidatePath('/budgets');
    revalidatePath('/'); // For dashboard budget overview
    return {
      id: docRef.id,
      ...budgetData, // Return the original data shape for dates
      userId,
      spent: 0, // UI will calculate this
      createdAt: new Date().toISOString(), // Approximate client-side representation
      updatedAt: new Date().toISOString(), // Approximate client-side representation
    } as Budget;
  } catch (error) {
    console.error('Error adding budget:', error);
    throw new Error('Failed to add budget.');
  }
}

export async function getBudgets(fetchLimit?: number): Promise<Budget[]> {
  const userId = getCurrentUserId();
  if (!userId) {
    return [];
  }

  try {
    const budgetsCollection = collection(db, 'budgets');
    const queryConstraints: any[] = [
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    ];

    if (fetchLimit && fetchLimit > 0) {
        queryConstraints.push(limitConstraint(fetchLimit));
    }

    const finalQuery = query(budgetsCollection, ...queryConstraints);
    const querySnapshot = await getDocs(finalQuery);
    const budgets = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        // 'spent' field will be populated/overridden by client-side calculations based on transactions
        spent: data.spent || 0, // Use Firestore 'spent' as a fallback/initial value if needed
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

// Updated to exclude 'spent' from direct updates via this action.
// 'spent' is now primarily a calculated value on the client.
export async function updateBudget(budgetId: string, updatedData: Partial<Omit<Budget, 'id' | 'userId' | 'spent' | 'createdAt' | 'updatedAt'>>) {
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
