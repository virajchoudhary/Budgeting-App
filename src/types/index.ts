

export interface Transaction {
  id: string;
  userId: string; // Added for Firestore user association
  date: string; // ISO string
  description: string;
  amount: number; // positive for income, negative for expense
  category: string;
  type: 'income' | 'expense';
  createdAt?: string; // ISO string, from Firestore serverTimestamp
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  category: string; // Can be 'Overall' or a specific category
  amount: number; // Total budget amount
  spent: number; // This will represent the calculated spent amount in the UI
  startDate: string; // ISO string
  endDate: string; // ISO string
  createdAt?: string; // ISO string, from Firestore serverTimestamp
  updatedAt?: string; // ISO string, from Firestore serverTimestamp
}

export interface SavingsGoal {
  id:string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // ISO string, optional
  aiTips?: string; // For storing AI generated tips
  createdAt?: string; // ISO string, from Firestore serverTimestamp
  updatedAt?: string; // ISO string, from Firestore serverTimestamp
}

export type TransactionCategory =
  | 'Groceries'
  | 'Utilities'
  | 'Rent/Mortgage'
  | 'Transportation'
  | 'Dining Out'
  | 'Entertainment'
  | 'Shopping'
  | 'Healthcare'
  | 'Income'
  | 'Investments'
  | 'Travel'
  | 'Education'
  | 'Personal Care'
  | 'Gifts/Donations'
  | 'Other'
  | 'Uncategorized';

export const transactionCategories: TransactionCategory[] = [
  'Groceries', 'Utilities', 'Rent/Mortgage', 'Transportation', 'Dining Out',
  'Entertainment', 'Shopping', 'Healthcare', 'Income', 'Investments', 'Travel',
  'Education', 'Personal Care', 'Gifts/Donations', 'Other', 'Uncategorized'
];

export type Currency = 'USD' | 'INR' | 'JPY' | 'GBP' | 'EUR';

export const supportedCurrencies: { value: Currency; label: string }[] = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'EUR', label: 'EUR - Euro' },
];

export type Theme = 'light' | 'dark';
