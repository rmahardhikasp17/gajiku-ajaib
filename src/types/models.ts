// ============= GAJIKU Data Models =============
// Design principles:
// - All IDs: nanoid (URL-safe, shorter than UUID, still unique)
// - Timestamps: Unix milliseconds (INTEGER internally, string in JS)
// - Soft delete via deletedAt (null = active, number = deleted timestamp)
// - is_dirty flag (not sync_status) for MVP — minimal and clear

// ── Timestamp helpers ──
export const nowMs = (): number => Date.now();
export const toMs = (iso: string): number => new Date(iso).getTime();
export const fromMs = (ms: number): string => new Date(ms).toISOString();

// ── Schema version (increment when structure changes) ──
export const SCHEMA_VERSION = 1;

// ── Types ──
export type TransactionType = 'income' | 'expense';

export type CategoryIcon =
  | 'salary' | 'freelance' | 'investment' | 'gift' | 'other-income'
  | 'food' | 'transport' | 'shopping' | 'entertainment' | 'health'
  | 'education' | 'bills' | 'rent' | 'insurance' | 'other-expense';

// ── Base record interface (every entity extends this) ──
export interface BaseRecord {
  id: string;             // nanoid — offline-safe, short, URL-safe
  createdAt: number;      // Unix ms — fast sort & compare in SQLite
  updatedAt: number;      // Unix ms — used as merge key
  deletedAt: number | null; // Unix ms if deleted, null if active
  isDirty: boolean;       // true = not yet backed up / needs export
}

// ── Transaction ──
export interface Transaction extends BaseRecord {
  type: TransactionType;
  amount: number;
  category: CategoryIcon;
  note: string;
  date: number;           // Unix ms — date of the transaction
}

// ── Budget ──
export interface Budget extends BaseRecord {
  category: CategoryIcon;
  label: string;
  limit: number;
  spent: number;          // computed at runtime, NOT stored
  period: 'weekly' | 'monthly' | 'yearly';
  color: string;
}

// ── Savings Goal ──
export interface SavingsGoal extends BaseRecord {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: number;       // Unix ms
  icon: string;
  isCompleted: boolean;
}

// ── Notification ──
export interface Notification extends BaseRecord {
  title: string;
  message: string;
  type: 'warning' | 'success' | 'info';
  read: boolean;
}

// ── Settings (key-value, no BaseRecord needed) ──
export interface AppSettings {
  userName: string;
  currency: string;
  language: 'id' | 'en';
  theme: 'light' | 'dark' | 'system';
  pinEnabled: boolean;
  pinHash: string | null;
}

// ── Full app data (for export/import) ──
export interface AppData {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  notifications: Notification[];
  settings: AppSettings;
}

// ── Backup envelope (exported JSON structure) ──
export interface BackupEnvelope {
  meta: BackupMeta;
  data: AppData;
}

export interface BackupMeta {
  format: 'gajiku-backup';
  schemaVersion: number;  // SCHEMA_VERSION at time of export
  exportedAt: number;     // Unix ms
  appVersion: string;
  deviceId: string;
  recordCounts: {
    transactions: number;
    budgets: number;
    savingsGoals: number;
    notifications: number;
  };
}

// ── Import result ──
export type ImportStrategy = 'full_replace' | 'smart_merge';

export interface ImportResult {
  success: boolean;
  strategy: ImportStrategy;
  counts: {
    added: number;
    updated: number;
    skipped: number;
    deleted: number;    // records soft-deleted from incoming
    conflicts: number;  // same updatedAt but different content
  };
  error?: string;
}

// ── Category metadata ──
export interface CategoryMeta {
  id: CategoryIcon;
  label: string;
  icon: string;
  type: TransactionType;
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  // Income
  { id: 'salary',       label: 'Gaji',         icon: 'Briefcase',        type: 'income',  color: '142 71% 45%' },
  { id: 'freelance',    label: 'Freelance',     icon: 'Laptop',           type: 'income',  color: '199 89% 48%' },
  { id: 'investment',   label: 'Investasi',     icon: 'TrendingUp',       type: 'income',  color: '262 83% 58%' },
  { id: 'gift',         label: 'Hadiah',        icon: 'Gift',             type: 'income',  color: '330 81% 60%' },
  { id: 'other-income', label: 'Lainnya',       icon: 'Plus',             type: 'income',  color: '200 18% 46%' },
  // Expense
  { id: 'food',         label: 'Makanan',       icon: 'UtensilsCrossed',  type: 'expense', color: '25 95% 53%'  },
  { id: 'transport',    label: 'Transportasi',  icon: 'Car',              type: 'expense', color: '199 89% 48%' },
  { id: 'shopping',     label: 'Belanja',       icon: 'ShoppingBag',      type: 'expense', color: '330 81% 60%' },
  { id: 'entertainment',label: 'Hiburan',       icon: 'Gamepad2',         type: 'expense', color: '262 83% 58%' },
  { id: 'health',       label: 'Kesehatan',     icon: 'Heart',            type: 'expense', color: '0 84% 60%'   },
  { id: 'education',    label: 'Pendidikan',    icon: 'GraduationCap',    type: 'expense', color: '199 89% 48%' },
  { id: 'bills',        label: 'Tagihan',       icon: 'Receipt',          type: 'expense', color: '25 95% 53%'  },
  { id: 'rent',         label: 'Sewa',          icon: 'Home',             type: 'expense', color: '142 71% 45%' },
  { id: 'insurance',    label: 'Asuransi',      icon: 'Shield',           type: 'expense', color: '200 18% 46%' },
  { id: 'other-expense',label: 'Lainnya',       icon: 'MoreHorizontal',   type: 'expense', color: '200 18% 46%' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Pengguna',
  currency: 'IDR',
  language: 'id',
  theme: 'light',
  pinEnabled: false,
  pinHash: null,
};
