
import type { Transaction, Budget, SavingsGoal } from '@/types';

// Using fixed dates to prevent hydration mismatches
const baseDate = new Date('2024-07-28T10:00:00.000Z'); // Sunday

const daysAgo = (days: number) => new Date(baseDate.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

export const mockTransactions: Transaction[] = [
  // Week 1 (Current Week of baseDate)
  { id: '1', date: daysAgo(0), description: 'Dinner at "The Fancy Spoon"', amount: -75.50, category: 'Dining Out', type: 'expense' }, // Sunday
  { id: '2', date: daysAgo(1), description: 'Weekly Groceries - "FreshMart"', amount: -123.45, category: 'Groceries', type: 'expense' }, // Saturday
  { id: '3', date: daysAgo(2), description: 'Monthly Salary - July', amount: 4500.00, category: 'Income', type: 'income' }, // Friday
  { id: '4', date: daysAgo(3), description: 'Cinema Tickets - "Action Movie"', amount: -30.00, category: 'Entertainment', type: 'expense' }, // Thursday
  { id: '5', date: daysAgo(4), description: 'Gas Bill - July', amount: -65.20, category: 'Utilities', type: 'expense' }, // Wednesday
  { id: '6', date: daysAgo(5), description: 'Lunch with Colleagues', amount: -22.80, category: 'Dining Out', type: 'expense' }, // Tuesday
  { id: '7', date: daysAgo(6), description: 'New Book - "Coding Adventures"', amount: -19.99, category: 'Shopping', type: 'expense' }, // Monday

  // Week 2
  { id: '8', date: daysAgo(7), description: 'Coffee Shop - "Brew & Bean"', amount: -4.75, category: 'Dining Out', type: 'expense' },
  { id: '9', date: daysAgo(8), description: 'Freelance Project Payment', amount: 350.00, category: 'Income', type: 'income' },
  { id: '10', date: daysAgo(9), description: 'Train Ticket to City', amount: -12.50, category: 'Transportation', type: 'expense' },
  { id: '11', date: daysAgo(10), description: 'Online Course Subscription - "Web Dev Monthly"', amount: -29.99, category: 'Education', type: 'expense' },
  { id: '12', date: daysAgo(11), description: 'Birthday Gift for Friend', amount: -40.00, category: 'Gifts/Donations', type: 'expense' },
  { id: '13', date: daysAgo(12), description: 'Pharmacy - "HealthPlus"', amount: -15.60, category: 'Healthcare', type: 'expense' },
  { id: '14', date: daysAgo(13), description: 'Groceries - "Quick Stop"', amount: -55.70, category: 'Groceries', type: 'expense' },

  // Week 3
  { id: '15', date: daysAgo(14), description: 'Streaming Service - "NetMovies"', amount: -15.00, category: 'Entertainment', type: 'expense' },
  { id: '16', date: daysAgo(15), description: 'Concert Tickets - "Indie Fest"', amount: -80.00, category: 'Entertainment', type: 'expense' },
  { id: '17', date: daysAgo(16), description: 'Rent Payment - August', amount: -1200.00, category: 'Rent/Mortgage', type: 'expense' },
  { id: '18', date: daysAgo(17), description: 'Phone Bill - July', amount: -50.00, category: 'Utilities', type: 'expense' },
  { id: '19', date: daysAgo(18), description: 'Investment - "Tech Stock"', amount: -200.00, category: 'Investments', type: 'expense' }, // Note: Investments can be expenses if buying
  { id: '20', date: daysAgo(19), description: 'Haircut', amount: -35.00, category: 'Personal Care', type: 'expense' },
  { id: '21', date: daysAgo(20), description: 'Takeout Pizza', amount: -28.50, category: 'Dining Out', type: 'expense' },

  // Older Transactions
  { id: '22', date: daysAgo(25), description: 'Clothing Shopping - "Style Hub"', amount: -150.00, category: 'Shopping', type: 'expense' },
  { id: '23', date: daysAgo(30), description: 'Monthly Salary - June', amount: 4450.00, category: 'Income', type: 'income' },
  { id: '24', date: daysAgo(40), description: 'Weekend Trip Fuel', amount: -60.00, category: 'Travel', type: 'expense' },
  { id: '25', date: daysAgo(45), description: 'Dinner with Family', amount: -110.00, category: 'Dining Out', type: 'expense' },
];

export const mockBudgets: Budget[] = [
  { id: 'b1', name: 'July Groceries', category: 'Groceries', amount: 450, spent: 0, startDate: '2024-07-01T00:00:00.000Z', endDate: '2024-07-31T23:59:59.999Z' },
  { id: 'b2', name: 'July Dining Out', category: 'Dining Out', amount: 250, spent: 0, startDate: '2024-07-01T00:00:00.000Z', endDate: '2024-07-31T23:59:59.999Z' },
  { id: 'b3', name: 'July Entertainment', category: 'Entertainment', amount: 150, spent: 0, startDate: '2024-07-01T00:00:00.000Z', endDate: '2024-07-31T23:59:59.999Z' },
  { id: 'b4', name: 'Overall Spending July', category: 'Overall', amount: 2000, spent: 0, startDate: '2024-07-01T00:00:00.000Z', endDate: '2024-07-31T23:59:59.999Z' },
];
// Note: The 'spent' in mockBudgets is initialized to 0.
// The UI (Dashboard, BudgetsPage) dynamically calculates 'spent' based on mockTransactions for the logged-out view.

export const mockSavingsGoals: SavingsGoal[] = [
  { id: 's1', name: 'Dream Vacation to Japan', targetAmount: 5000, currentAmount: 1250, deadline: '2025-12-01T00:00:00.000Z', aiTips: "- Set up automatic monthly transfers.\n- Research budget travel options for Japan." },
  { id: 's2', name: 'Next Gen Gaming Console', targetAmount: 600, currentAmount: 150, deadline: '2024-11-01T00:00:00.000Z' },
  { id: 's3', name: 'Emergency Fund Boost', targetAmount: 10000, currentAmount: 7500 },
  { id: 's4', name: 'Down Payment for Car', targetAmount: 3000, currentAmount: 500, deadline: '2025-08-01T00:00:00.000Z' },
];
