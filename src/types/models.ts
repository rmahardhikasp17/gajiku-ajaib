// ============= GAJIKU Data Models =============

export type TransactionType = 'income' | 'expense';

export type CategoryIcon =
  | 'salary' | 'freelance' | 'investment' | 'gift' | 'other-income'
  | 'food' | 'transport' | 'shopping' | 'entertainment' | 'health'
  | 'education' | 'bills' | 'rent' | 'insurance' | 'other-expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: CategoryIcon;
  note: string;
  date: string; // ISO string
  createdAt: string;
}

export interface Budget {
  id: string;
  category: CategoryIcon;
  label: string;
  limit: number;
  spent: number; // computed from transactions
  period: 'weekly' | 'monthly' | 'yearly';
  color: string; // HSL token name e.g. "budget-food"
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO string
  icon: string; // emoji or icon name
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'success' | 'info';
  read: boolean;
  createdAt: string;
}

export interface AppSettings {
  currency: string;
  language: 'id' | 'en';
  theme: 'light' | 'dark' | 'system';
  pinEnabled: boolean;
  pinHash: string | null;
}

export interface AppData {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  notifications: Notification[];
  settings: AppSettings;
}

// Category metadata for UI
export interface CategoryMeta {
  id: CategoryIcon;
  label: string;
  icon: string; // lucide icon name
  type: TransactionType;
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  // Income
  { id: 'salary', label: 'Gaji', icon: 'Briefcase', type: 'income', color: '142 71% 45%' },
  { id: 'freelance', label: 'Freelance', icon: 'Laptop', type: 'income', color: '199 89% 48%' },
  { id: 'investment', label: 'Investasi', icon: 'TrendingUp', type: 'income', color: '262 83% 58%' },
  { id: 'gift', label: 'Hadiah', icon: 'Gift', type: 'income', color: '330 81% 60%' },
  { id: 'other-income', label: 'Lainnya', icon: 'Plus', type: 'income', color: '200 18% 46%' },
  // Expense
  { id: 'food', label: 'Makanan', icon: 'UtensilsCrossed', type: 'expense', color: '25 95% 53%' },
  { id: 'transport', label: 'Transportasi', icon: 'Car', type: 'expense', color: '199 89% 48%' },
  { id: 'shopping', label: 'Belanja', icon: 'ShoppingBag', type: 'expense', color: '330 81% 60%' },
  { id: 'entertainment', label: 'Hiburan', icon: 'Gamepad2', type: 'expense', color: '262 83% 58%' },
  { id: 'health', label: 'Kesehatan', icon: 'Heart', type: 'expense', color: '0 84% 60%' },
  { id: 'education', label: 'Pendidikan', icon: 'GraduationCap', type: 'expense', color: '199 89% 48%' },
  { id: 'bills', label: 'Tagihan', icon: 'Receipt', type: 'expense', color: '25 95% 53%' },
  { id: 'rent', label: 'Sewa', icon: 'Home', type: 'expense', color: '142 71% 45%' },
  { id: 'insurance', label: 'Asuransi', icon: 'Shield', type: 'expense', color: '200 18% 46%' },
  { id: 'other-expense', label: 'Lainnya', icon: 'MoreHorizontal', type: 'expense', color: '200 18% 46%' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'IDR',
  language: 'id',
  theme: 'light',
  pinEnabled: false,
  pinHash: null,
};
