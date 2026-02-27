import { useState, useCallback, useMemo } from 'react';
import { Budget, Transaction } from '@/types/models';
import * as storage from '@/services/storage';

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>(storage.getBudgets());

  const refresh = useCallback(() => setBudgets(storage.getBudgets()), []);

  const add = useCallback((b: Omit<Budget, 'id' | 'createdAt' | 'spent'>) => {
    const newB = storage.addBudget(b);
    refresh();
    return newB;
  }, [refresh]);

  const update = useCallback((id: string, updates: Partial<Budget>) => {
    const result = storage.updateBudget(id, updates);
    refresh();
    return result;
  }, [refresh]);

  const remove = useCallback((id: string) => {
    const result = storage.deleteBudget(id);
    refresh();
    return result;
  }, [refresh]);

  // Compute spent from transactions
  const computeSpent = useCallback((transactions: Transaction[]): Budget[] => {
    const expenses = transactions.filter(t => t.type === 'expense');
    return budgets.map(b => ({
      ...b,
      spent: expenses.filter(t => t.category === b.category).reduce((s, t) => s + t.amount, 0),
    }));
  }, [budgets]);

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return { budgets, add, update, remove, refresh, computeSpent, totalBudget, totalSpent };
}
