import { useState, useCallback, useEffect } from 'react';
import { Budget, Transaction } from '@/types/models';
import * as database from '@/services/database';

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await database.getBudgets();
    setBudgets(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (b: Omit<Budget, 'id' | 'createdAt' | 'spent'>) => {
    const newB = await database.addBudget(b);
    await refresh();
    return newB;
  }, [refresh]);

  const update = useCallback(async (id: string, updates: Partial<Budget>) => {
    const result = await database.updateBudget(id, updates);
    await refresh();
    return result;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    const result = await database.deleteBudget(id);
    await refresh();
    return result;
  }, [refresh]);

  // Compute spent from transactions (same logic, just used with existing data)
  const computeSpent = useCallback((transactions: Transaction[]): Budget[] => {
    const expenses = transactions.filter(t => t.type === 'expense');
    return budgets.map(b => ({
      ...b,
      spent: expenses.filter(t => t.category === b.category).reduce((s, t) => s + t.amount, 0),
    }));
  }, [budgets]);

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return { budgets, loading, add, update, remove, refresh, computeSpent, totalBudget, totalSpent };
}
