import { useState, useCallback } from 'react';
import { Transaction } from '@/types/models';
import * as storage from '@/services/storage';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(storage.getTransactions());

  const refresh = useCallback(() => setTransactions(storage.getTransactions()), []);

  const add = useCallback((t: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newT = storage.addTransaction(t);
    refresh();
    return newT;
  }, [refresh]);

  const update = useCallback((id: string, updates: Partial<Transaction>) => {
    const result = storage.updateTransaction(id, updates);
    refresh();
    return result;
  }, [refresh]);

  const remove = useCallback((id: string) => {
    const result = storage.deleteTransaction(id);
    refresh();
    return result;
  }, [refresh]);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return { transactions, add, update, remove, refresh, totalIncome, totalExpense, balance };
}
