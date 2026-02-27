import { useState, useCallback } from 'react';
import { SavingsGoal } from '@/types/models';
import * as storage from '@/services/storage';

export function useSavings() {
  const [goals, setGoals] = useState<SavingsGoal[]>(storage.getSavingsGoals());

  const refresh = useCallback(() => setGoals(storage.getSavingsGoals()), []);

  const add = useCallback((g: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>) => {
    const newG = storage.addSavingsGoal(g);
    refresh();
    return newG;
  }, [refresh]);

  const update = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    const result = storage.updateSavingsGoal(id, updates);
    refresh();
    return result;
  }, [refresh]);

  const deposit = useCallback((id: string, amount: number) => {
    const result = storage.depositToGoal(id, amount);
    refresh();
    return result;
  }, [refresh]);

  const withdraw = useCallback((id: string, amount: number) => {
    const result = storage.withdrawFromGoal(id, amount);
    refresh();
    return result;
  }, [refresh]);

  const remove = useCallback((id: string) => {
    const result = storage.deleteSavingsGoal(id);
    refresh();
    return result;
  }, [refresh]);

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return { goals, add, update, deposit, withdraw, remove, refresh, totalSaved, totalTarget };
}
