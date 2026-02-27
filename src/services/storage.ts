// ============= GAJIKU localStorage Service =============
import { Transaction, Budget, SavingsGoal, Notification, AppSettings, AppData, DEFAULT_SETTINGS } from '@/types/models';

const STORAGE_KEY = 'gajiku_data';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getAll(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefault();
    return JSON.parse(raw) as AppData;
  } catch {
    return getDefault();
  }
}

function getDefault(): AppData {
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

// ---- Transactions ----
export function getTransactions(): Transaction[] {
  return getAll().transactions;
}

export function addTransaction(t: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
  const data = getAll();
  const newT: Transaction = { ...t, id: generateId(), createdAt: new Date().toISOString() };
  data.transactions.unshift(newT);
  saveAll(data);
  return newT;
}

export function updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
  const data = getAll();
  const idx = data.transactions.findIndex(t => t.id === id);
  if (idx === -1) return null;
  data.transactions[idx] = { ...data.transactions[idx], ...updates };
  saveAll(data);
  return data.transactions[idx];
}

export function deleteTransaction(id: string): boolean {
  const data = getAll();
  const len = data.transactions.length;
  data.transactions = data.transactions.filter(t => t.id !== id);
  if (data.transactions.length === len) return false;
  saveAll(data);
  return true;
}

// ---- Budgets ----
export function getBudgets(): Budget[] {
  return getAll().budgets;
}

export function addBudget(b: Omit<Budget, 'id' | 'createdAt' | 'spent'>): Budget {
  const data = getAll();
  const newB: Budget = { ...b, id: generateId(), spent: 0, createdAt: new Date().toISOString() };
  data.budgets.push(newB);
  saveAll(data);
  return newB;
}

export function updateBudget(id: string, updates: Partial<Budget>): Budget | null {
  const data = getAll();
  const idx = data.budgets.findIndex(b => b.id === id);
  if (idx === -1) return null;
  data.budgets[idx] = { ...data.budgets[idx], ...updates };
  saveAll(data);
  return data.budgets[idx];
}

export function deleteBudget(id: string): boolean {
  const data = getAll();
  const len = data.budgets.length;
  data.budgets = data.budgets.filter(b => b.id !== id);
  if (data.budgets.length === len) return false;
  saveAll(data);
  return true;
}

// ---- Savings Goals ----
export function getSavingsGoals(): SavingsGoal[] {
  return getAll().savingsGoals;
}

export function addSavingsGoal(g: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>): SavingsGoal {
  const data = getAll();
  const newG: SavingsGoal = { ...g, id: generateId(), currentAmount: 0, createdAt: new Date().toISOString() };
  data.savingsGoals.push(newG);
  saveAll(data);
  return newG;
}

export function updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): SavingsGoal | null {
  const data = getAll();
  const idx = data.savingsGoals.findIndex(g => g.id === id);
  if (idx === -1) return null;
  data.savingsGoals[idx] = { ...data.savingsGoals[idx], ...updates };
  saveAll(data);
  return data.savingsGoals[idx];
}

export function depositToGoal(id: string, amount: number): SavingsGoal | null {
  const data = getAll();
  const idx = data.savingsGoals.findIndex(g => g.id === id);
  if (idx === -1) return null;
  data.savingsGoals[idx].currentAmount += amount;
  saveAll(data);
  return data.savingsGoals[idx];
}

export function withdrawFromGoal(id: string, amount: number): SavingsGoal | null {
  const data = getAll();
  const idx = data.savingsGoals.findIndex(g => g.id === id);
  if (idx === -1 || data.savingsGoals[idx].currentAmount < amount) return null;
  data.savingsGoals[idx].currentAmount -= amount;
  saveAll(data);
  return data.savingsGoals[idx];
}

export function deleteSavingsGoal(id: string): boolean {
  const data = getAll();
  const len = data.savingsGoals.length;
  data.savingsGoals = data.savingsGoals.filter(g => g.id !== id);
  if (data.savingsGoals.length === len) return false;
  saveAll(data);
  return true;
}

// ---- Notifications ----
export function getNotifications(): Notification[] {
  return getAll().notifications;
}

export function addNotification(n: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
  const data = getAll();
  const newN: Notification = { ...n, id: generateId(), read: false, createdAt: new Date().toISOString() };
  data.notifications.unshift(newN);
  saveAll(data);
  return newN;
}

export function markNotificationRead(id: string): void {
  const data = getAll();
  const n = data.notifications.find(n => n.id === id);
  if (n) { n.read = true; saveAll(data); }
}

export function markAllNotificationsRead(): void {
  const data = getAll();
  data.notifications.forEach(n => n.read = true);
  saveAll(data);
}

export function deleteNotification(id: string): boolean {
  const data = getAll();
  const len = data.notifications.length;
  data.notifications = data.notifications.filter(n => n.id !== id);
  if (data.notifications.length === len) return false;
  saveAll(data);
  return true;
}

// ---- Settings ----
export function getSettings(): AppSettings {
  return getAll().settings;
}

export function updateSettings(updates: Partial<AppSettings>): AppSettings {
  const data = getAll();
  data.settings = { ...data.settings, ...updates };
  saveAll(data);
  return data.settings;
}

// ---- Export/Import ----
export function exportData(): string {
  return JSON.stringify(getAll(), null, 2);
}

export function importData(json: string): boolean {
  try {
    const data = JSON.parse(json) as AppData;
    if (!data.transactions || !data.settings) return false;
    saveAll(data);
    return true;
  } catch {
    return false;
  }
}

export { generateId, getAll as getAllData };
