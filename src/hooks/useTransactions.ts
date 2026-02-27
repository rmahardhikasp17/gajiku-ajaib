import { useState, useCallback, useEffect } from 'react';
import { Transaction } from '@/types/models';
import * as database from '@/services/database';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await database.getTransactions();
    setTransactions(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (t: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newT = await database.addTransaction(t);
    await refresh();
    return newT;
  }, [refresh]);

  const update = useCallback(async (id: string, updates: Partial<Transaction>) => {
    const result = await database.updateTransaction(id, updates);
    await refresh();
    return result;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    const result = await database.deleteTransaction(id);
    await refresh();
    return result;
  }, [refresh]);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return { transactions, loading, add, update, remove, refresh, totalIncome, totalExpense, balance };
}
