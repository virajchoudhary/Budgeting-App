
'use server';

import { auth, db } from '@/lib/firebase';
import type { SavingsGoal } from '@/types';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where, serverTimestamp, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// Helper to get current user ID
const getCurrentUserId = (): string | null => {
  const user = auth.currentUser;
  return user ? user.uid : null;
};

export async function addSavingsGoal(goalData: Omit<SavingsGoal, 'id' | 'userId' | 'aiTips' | 'createdAt' | 'updatedAt'>) {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const newGoal: any = {
    ...goalData,
    userId,
    aiTips: goalData.aiTips || '', 
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (goalData.deadline) {
    newGoal.deadline = Timestamp.fromDate(new Date(goalData.deadline));
  } else {
    newGoal.deadline = null; // Ensure deadline is explicitly null if not provided
  }


  try {
    const docRef = await addDoc(collection(db, 'savingsGoals'), newGoal);
    revalidatePath('/savings');
    return { 
      id: docRef.id, 
      ...goalData, // Return original data shape for dates
      userId,
      aiTips: newGoal.aiTips,
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(), 
    } as SavingsGoal;
  } catch (error) {
    console.error('Error adding savings goal:', error);
    throw new Error('Failed to add savings goal.');
  }
}

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  const userId = getCurrentUserId();
  if (!userId) {
    return [];
  }

  try {
    const goalsCollection = collection(db, 'savingsGoals');
    const q = query(goalsCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const goals = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        deadline: data.deadline ? (data.deadline as Timestamp).toDate().toISOString() : undefined,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : undefined,
        updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate().toISOString() : undefined,
      } as SavingsGoal;
    });
    return goals;
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    throw new Error('Failed to fetch savings goals.');
  }
}

export async function updateSavingsGoal(goalId: string, updatedData: Partial<Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const goalDocRef = doc(db, 'savingsGoals', goalId);
  const dataToUpdate: any = { ...updatedData, updatedAt: serverTimestamp() };
  
  if (updatedData.hasOwnProperty('deadline')) { // Check if deadline is explicitly being updated
    if (updatedData.deadline && typeof updatedData.deadline === 'string') {
        dataToUpdate.deadline = Timestamp.fromDate(new Date(updatedData.deadline));
    } else if (updatedData.deadline instanceof Date) {
        dataToUpdate.deadline = Timestamp.fromDate(updatedData.deadline);
    } else { // Handles null or undefined if deadline is being cleared
        dataToUpdate.deadline = null;
    }
  }


  try {
    await updateDoc(goalDocRef, dataToUpdate);
    revalidatePath('/savings');
  } catch (error) {
    console.error('Error updating savings goal:', error);
    throw new Error('Failed to update savings goal.');
  }
}

export async function deleteSavingsGoal(goalId: string) {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const goalDocRef = doc(db, 'savingsGoals', goalId);

  try {
    await deleteDoc(goalDocRef);
    revalidatePath('/savings');
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    throw new Error('Failed to delete savings goal.');
  }
}

export async function updateSavingsGoalAITips(goalId: string, aiTips: string) {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated to update AI tips.');
  }
  const goalDocRef = doc(db, 'savingsGoals', goalId);
  try {
    await updateDoc(goalDocRef, {
      aiTips: aiTips,
      updatedAt: serverTimestamp()
    });
    revalidatePath('/savings'); // Revalidate to show new tips
  } catch (error) {
    console.error('Error updating AI tips for savings goal:', error);
    throw new Error('Failed to update AI tips for savings goal.');
  }
}

