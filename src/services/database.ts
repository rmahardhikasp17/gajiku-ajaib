// ============= GAJIKU Database Service =============
// Web:    localStorage  (works offline, no WASM needed)
// Native: SQLite stub   (will be replaced in Phase 5)
//
// All timestamps: Unix milliseconds (number)
// ID: nanoid-style string (URL-safe, short)
// Soft delete: deletedAt (null = active, number = deleted ts)
// is_dirty: true = needs backup, false = clean
//
// StorageAdapter interface is satisfied here for backup/import use.

import { Capacitor } from '@capacitor/core';
import {
  Transaction, Budget, SavingsGoal, Notification, AppSettings,
  AppData, DEFAULT_SETTINGS, SCHEMA_VERSION, nowMs,
} from '@/types/models';

// ── Constants ──
const STORAGE_KEY   = 'gajiku_data';
const SCHEMA_KEY    = 'gajiku_schema_version';

// ── ID Generator: timestamp + random (no external dep) ──
export function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 9);
  return `${ts}${rand}`;
}

// ── Platform flag ──
const isNative = Capacitor.isNativePlatform();
let isInitialized = false;

// ══════════════════════════════════════════════
//  INITIALIZATION + SCHEMA MIGRATION
// ══════════════════════════════════════════════

export async function initDatabase(): Promise<void> {
  if (isInitialized) return;

  if (isNative) {
    try {
      const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite');
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      const { SQLiteNative } = await import('./database-native');
      await SQLiteNative.init(sqlite);
    } catch (err) {
      console.warn('[GAJIKU] Native SQLite init failed, using localStorage:', err);
    }
  }

  // Check schema version & run migrations if needed
  runSchemaMigrations();

  // Ensure defaults exist
  ensureDefaults();

  isInitialized = true;
  console.log(`[GAJIKU] ✅ Database ready on platform: ${Capacitor.getPlatform()}`);
}

// ── Schema version migration ──
function runSchemaMigrations(): void {
  const storedVersion = parseInt(localStorage.getItem(SCHEMA_KEY) ?? '0', 10);

  if (storedVersion === SCHEMA_VERSION) return;

  // v0 → v1: Add isDirty, deletedAt, convert createdAt string → number
  if (storedVersion < 1) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw) as Record<string, unknown>;
        const now = nowMs();

        const migrateRecord = (r: Record<string, unknown>) => ({
          ...r,
          createdAt: typeof r.createdAt === 'string' ? new Date(r.createdAt as string).getTime() : (r.createdAt ?? now),
          updatedAt: typeof r.updatedAt === 'string' ? new Date(r.updatedAt as string).getTime() : (r.updatedAt ?? now),
          deletedAt: r.deletedAt ?? null,
          isDirty: r.isDirty ?? false,
        });

        const migrateDate = (r: Record<string, unknown>) => ({
          ...migrateRecord(r),
          date: typeof r.date === 'string' ? new Date(r.date as string).getTime() : (r.date ?? now),
        });

        const migrated = {
          ...data,
          transactions:  (data.transactions  as unknown[] ?? []).map(r => migrateDate(r as Record<string, unknown>)),
          budgets:       (data.budgets        as unknown[] ?? []).map(r => migrateRecord(r as Record<string, unknown>)),
          savingsGoals:  (data.savingsGoals   as unknown[] ?? []).map(r => ({
            ...migrateRecord(r as Record<string, unknown>),
            deadline: typeof (r as Record<string, unknown>).deadline === 'string'
              ? new Date((r as Record<string, unknown>).deadline as string).getTime()
              : ((r as Record<string, unknown>).deadline ?? now),
          })),
          notifications: (data.notifications  as unknown[] ?? []).map(r => migrateRecord(r as Record<string, unknown>)),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        console.log('[GAJIKU] ✅ Schema migration v0 → v1 complete');
      } catch (e) {
        console.error('[GAJIKU] Schema migration failed:', e);
      }
    }
  }

  // Future: if (storedVersion < 2) { ... }

  localStorage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION));
}

// ── Ensure defaults ──
function ensureDefaults(): void {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return;

  const defaults: AppData = {
    transactions: [],
    budgets: [],
    savingsGoals: [],
    notifications: [],
    settings: { ...DEFAULT_SETTINGS },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
}

// ══════════════════════════════════════════════
//  STORAGE HELPERS
// ══════════════════════════════════════════════

function getAll(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeEmpty();
    return JSON.parse(raw) as AppData;
  } catch {
    return makeEmpty();
  }
}

function makeEmpty(): AppData {
  return {
    transactions: [],
    budgets: [],
    savingsGoals: [],
    notifications: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

function saveAll(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── StorageAdapter implementation (for backup/import use) ──
export const localStorageAdapter = {
  async getAll(): Promise<AppData> { return getAll(); },
  async saveAll(data: AppData): Promise<void> { saveAll(data); },
};

// ── Mark records as dirty after mutation ──
function markDirty<T extends { isDirty: boolean }>(r: T): T {
  return { ...r, isDirty: true };
}

// ══════════════════════════════════════════════
//  TRANSACTIONS
// ══════════════════════════════════════════════

export async function getTransactions(): Promise<Transaction[]> {
  // Only return non-deleted records
  return getAll().transactions.filter(t => t.deletedAt === null);
}

export async function addTransaction(
  t: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isDirty'>
): Promise<Transaction> {
  const data = getAll();
  const now = nowMs();
  const newT: Transaction = {
    ...t,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    isDirty: true,
  };
  data.transactions.unshift(newT);
  saveAll(data);
  return newT;
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
  const data = getAll();
  const idx = data.transactions.findIndex(t => t.id === id);
  if (idx === -1) return null;
  data.transactions[idx] = markDirty({ ...data.transactions[idx], ...updates, updatedAt: nowMs() });
  saveAll(data);
  return data.transactions[idx];
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const data = getAll();
  const idx = data.transactions.findIndex(t => t.id === id);
  if (idx === -1) return false;
  // Soft delete
  data.transactions[idx] = markDirty({ ...data.transactions[idx], deletedAt: nowMs(), updatedAt: nowMs() });
  saveAll(data);
  return true;
}

// ══════════════════════════════════════════════
//  BUDGETS
// ══════════════════════════════════════════════

export async function getBudgets(): Promise<Budget[]> {
  return getAll().budgets.filter(b => b.deletedAt === null);
}

export async function addBudget(
  b: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isDirty' | 'spent'>
): Promise<Budget> {
  const data = getAll();
  const now = nowMs();
  const newB: Budget = { ...b, id: generateId(), spent: 0, createdAt: now, updatedAt: now, deletedAt: null, isDirty: true };
  data.budgets.push(newB);
  saveAll(data);
  return newB;
}

export async function updateBudget(id: string, updates: Partial<Budget>): Promise<Budget | null> {
  const data = getAll();
  const idx = data.budgets.findIndex(b => b.id === id);
  if (idx === -1) return null;
  data.budgets[idx] = markDirty({ ...data.budgets[idx], ...updates, updatedAt: nowMs() });
  saveAll(data);
  return data.budgets[idx];
}

export async function deleteBudget(id: string): Promise<boolean> {
  const data = getAll();
  const idx = data.budgets.findIndex(b => b.id === id);
  if (idx === -1) return false;
  data.budgets[idx] = markDirty({ ...data.budgets[idx], deletedAt: nowMs(), updatedAt: nowMs() });
  saveAll(data);
  return true;
}

// ══════════════════════════════════════════════
//  SAVINGS GOALS
// ══════════════════════════════════════════════

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  return getAll().savingsGoals.filter(g => g.deletedAt === null);
}

export async function addSavingsGoal(
  g: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isDirty' | 'currentAmount' | 'isCompleted'>
): Promise<SavingsGoal> {
  const data = getAll();
  const now = nowMs();
  const newG: SavingsGoal = { ...g, id: generateId(), currentAmount: 0, isCompleted: false, createdAt: now, updatedAt: now, deletedAt: null, isDirty: true };
  data.savingsGoals.push(newG);
  saveAll(data);
  return newG;
}

export async function updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal | null> {
  const data = getAll();
  const idx = data.savingsGoals.findIndex(g => g.id === id);
  if (idx === -1) return null;
  data.savingsGoals[idx] = markDirty({ ...data.savingsGoals[idx], ...updates, updatedAt: nowMs() });
  saveAll(data);
  return data.savingsGoals[idx];
}

export async function depositToGoal(id: string, amount: number): Promise<SavingsGoal | null> {
  const data = getAll();
  const idx = data.savingsGoals.findIndex(g => g.id === id);
  if (idx === -1) return null;
  const g = data.savingsGoals[idx];
  const currentAmount = g.currentAmount + amount;
  const isCompleted = currentAmount >= g.targetAmount;
  data.savingsGoals[idx] = markDirty({ ...g, currentAmount, isCompleted, updatedAt: nowMs() });
  saveAll(data);
  return data.savingsGoals[idx];
}

export async function withdrawFromGoal(id: string, amount: number): Promise<SavingsGoal | null> {
  const data = getAll();
  const idx = data.savingsGoals.findIndex(g => g.id === id);
  if (idx === -1 || data.savingsGoals[idx].currentAmount < amount) return null;
  data.savingsGoals[idx] = markDirty({
    ...data.savingsGoals[idx],
    currentAmount: data.savingsGoals[idx].currentAmount - amount,
    updatedAt: nowMs(),
  });
  saveAll(data);
  return data.savingsGoals[idx];
}

export async function deleteSavingsGoal(id: string): Promise<boolean> {
  const data = getAll();
  const idx = data.savingsGoals.findIndex(g => g.id === id);
  if (idx === -1) return false;
  data.savingsGoals[idx] = markDirty({ ...data.savingsGoals[idx], deletedAt: nowMs(), updatedAt: nowMs() });
  saveAll(data);
  return true;
}

// ══════════════════════════════════════════════
//  NOTIFICATIONS
// ══════════════════════════════════════════════

export async function getNotifications(): Promise<Notification[]> {
  return getAll().notifications.filter(n => n.deletedAt === null);
}

export async function addNotification(
  n: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isDirty' | 'read'>
): Promise<Notification> {
  const data = getAll();
  const now = nowMs();
  const newN: Notification = { ...n, id: generateId(), read: false, createdAt: now, updatedAt: now, deletedAt: null, isDirty: false };
  data.notifications.unshift(newN);
  saveAll(data);
  return newN;
}

export async function markNotificationRead(id: string): Promise<void> {
  const data = getAll();
  const n = data.notifications.find(n => n.id === id);
  if (n) { n.read = true; n.updatedAt = nowMs(); saveAll(data); }
}

export async function markAllNotificationsRead(): Promise<void> {
  const data = getAll();
  const now = nowMs();
  data.notifications.forEach(n => { n.read = true; n.updatedAt = now; });
  saveAll(data);
}

export async function deleteNotification(id: string): Promise<boolean> {
  const data = getAll();
  const idx = data.notifications.findIndex(n => n.id === id);
  if (idx === -1) return false;
  // Hard delete for notifications (no need to propagate)
  data.notifications.splice(idx, 1);
  saveAll(data);
  return true;
}

// ══════════════════════════════════════════════
//  SETTINGS
// ══════════════════════════════════════════════

export async function getSettings(): Promise<AppSettings> {
  return getAll().settings ?? { ...DEFAULT_SETTINGS };
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  const data = getAll();
  data.settings = { ...data.settings, ...updates };
  saveAll(data);
  return data.settings;
}

// ══════════════════════════════════════════════
//  EXPORT / IMPORT  (delegates to backup services)
// ══════════════════════════════════════════════

export async function exportData(): Promise<string> {
  const { exportBackup } = await import('./backup/export');
  return exportBackup(getAll());
}

export async function importData(json: string): Promise<boolean> {
  try {
    const { importFullReplace } = await import('./backup/import');
    const result = await importFullReplace(json, localStorageAdapter);
    return result.success;
  } catch (err) {
    console.error('[GAJIKU] Import failed:', err);
    return false;
  }
}

export async function importDataMerge(json: string): Promise<boolean> {
  try {
    const { importSmartMerge } = await import('./backup/import');
    const result = await importSmartMerge(json, localStorageAdapter);
    return result.success;
  } catch (err) {
    console.error('[GAJIKU] Smart merge import failed:', err);
    return false;
  }
}

export async function getAllData(): Promise<AppData> {
  return getAll();
}
