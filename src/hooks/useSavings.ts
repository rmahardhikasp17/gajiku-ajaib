import { useState, useCallback, useEffect } from 'react';
import { SavingsGoal } from '@/types/models';
import * as database from '@/services/database';

export function useSavings() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await database.getSavingsGoals();
    setGoals(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (g: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>) => {
    const newG = await database.addSavingsGoal(g);
    await refresh();
    return newG;
  }, [refresh]);

  const update = useCallback(async (id: string, updates: Partial<SavingsGoal>) => {
    const result = await database.updateSavingsGoal(id, updates);
    await refresh();
    return result;
  }, [refresh]);

  const deposit = useCallback(async (id: string, amount: number) => {
    const result = await database.depositToGoal(id, amount);
    await refresh();
    return result;
  }, [refresh]);

  const withdraw = useCallback(async (id: string, amount: number) => {
    const result = await database.withdrawFromGoal(id, amount);
    await refresh();
    return result;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    const result = await database.deleteSavingsGoal(id);
    await refresh();
    return result;
  }, [refresh]);

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return { goals, loading, add, update, deposit, withdraw, remove, refresh, totalSaved, totalTarget };
}
