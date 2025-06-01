
import type { Transaction, Budget, SavingsGoal } from '@/types';

// Using fixed dates to prevent hydration mismatches
const baseDate = new Date('2024-07-28T10:00:00.000Z');

export const mockTransactions: Transaction[] = [
  { id: '1', date: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: 'Grocery Store Trip', amount: -75.50, category: 'Groceries', type: 'expense' }, // 2024-07-26
  { id: '2', date: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), description: 'Monthly Salary', amount: 3000, category: 'Income', type: 'income' }, // 2024-07-27
  { id: '3', date: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), description: 'Coffee Shop', amount: -4.75, category: 'Dining Out', type: 'expense' }, // 2024-07-25
  { id: '4', date: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Online Course Subscription', amount: -29.99, category: 'Education', type: 'expense' }, // 2024-07-23
  { id: '5', date: baseDate.toISOString(), description: 'Restaurant Dinner', amount: -55.00, category: 'Dining Out', type: 'expense' }, // 2024-07-28
];

export const mockBudgets: Budget[] = [
  { id: 'b1', name: 'Monthly Groceries', category: 'Groceries', amount: 400, spent: 150.25, startDate: '2024-07-01T00:00:00.000Z', endDate: '2024-07-31T12:00:00.000Z' },
  { id: 'b2', name: 'Entertainment Fun', category: 'Entertainment', amount: 150, spent: 75.00, startDate: '2024-07-01T00:00:00.000Z', endDate: '2024-07-31T12:00:00.000Z' },
  { id: 'b3', name: 'Transportation Costs', category: 'Transportation', amount: 100, spent: 30.50, startDate: '2024-07-01T00:00:00.000Z', endDate: '2024-07-31T12:00:00.000Z' },
];

export const mockSavingsGoals: SavingsGoal[] = [
  { id: 's1', name: 'Vacation Fund', targetAmount: 2000, currentAmount: 750, deadline: '2025-06-01T00:00:00.000Z' },
  { id: 's2', name: 'New Laptop', targetAmount: 1200, currentAmount: 300 },
  { id: 's3', name: 'Emergency Fund', targetAmount: 5000, currentAmount: 2500 },
];

