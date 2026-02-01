// FIX: Export the User type from firebase/auth.
export type { User } from 'firebase/auth';

export type Page = 'dashboard' | 'transactions' | 'reports' | 'settings';
export type TransactionType = 'income' | 'expense';
export type ExpenseCategoryType = 'Umum' | 'Tagihan' | 'Investasi/Tabungan' | 'Utang';
export type AppLayout = 'classic' | 'modern';
export type AppFont = 'inter' | 'lora' | 'poppins' | 'mono';
export type AccentColor = 'blue' | 'emerald' | 'rose' | 'violet' | 'orange';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string; // Category name
  amount: number;
  date: string; // ISO string
  description: string;
  relatedId?: string; // To link to a Goal, Bill, or Debt
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

export interface Budget {
  categoryId: string; // Maps to Category.id for expense categories
  amount: number;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number; // Day of the month
}

export interface Debt {
  id:string;
  name: string;
  totalAmount: number;
  paidAmount: number;
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'info' | 'warning';
}

export interface AppState {
  isAuthenticated: boolean;
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: FinancialGoal[];
  bills: Bill[];
  debts: Debt[];
  apiKey: string | null;
  notifications: AppNotification[];
}

export const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);