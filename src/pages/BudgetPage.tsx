import { useState, useMemo } from 'react';
import { Plus, PieChart, AlertTriangle } from 'lucide-react';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/lib/format';
import BudgetCard from '@/components/BudgetCard';
import AddBudgetModal from '@/components/AddBudgetModal';
import { Budget } from '@/types/models';

const BudgetPage = () => {
  const { budgets, add, update, remove, computeSpent } = useBudgets();
  const { transactions } = useTransactions();
  const [showAdd, setShowAdd] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);

  // Compute spent amounts from real transactions
  const budgetsWithSpent = useMemo(() => computeSpent(transactions), [computeSpent, transactions]);

  const totalBudget = budgetsWithSpent.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgetsWithSpent.reduce((s, b) => s + b.spent, 0);
  const totalPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const overBudgetCount = budgetsWithSpent.filter(b => b.spent >= b.limit).length;

  const handleSave = (data: { category: any; label: string; limit: number; period: any; color: string }) => {
    if (editBudget) {
      update(editBudget.id, data);
    } else {
      add(data);
    }
    setEditBudget(null);
  };

  const handleEdit = (b: Budget) => {
    setEditBudget(b);
    setShowAdd(true);
  };

  const handleClose = () => {
    setShowAdd(false);
    setEditBudget(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary px-5 pb-8 pt-6 rounded-b-3xl">
        <h1 className="text-primary-foreground text-lg font-bold mb-4">Anggaran</h1>

        <div className="rounded-2xl bg-primary-foreground/10 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-primary-foreground/70 text-xs">Total Anggaran</p>
            {overBudgetCount > 0 && (
              <div className="flex items-center gap-1 bg-expense/20 rounded-full px-2 py-0.5">
                <AlertTriangle className="h-3 w-3 text-expense" />
                <span className="text-[10px] text-expense font-semibold">{overBudgetCount} melebihi</span>
              </div>
            )}
          </div>
          <p className="text-primary-foreground text-xl font-extrabold">
            {formatCurrency(totalSpent)} <span className="text-sm font-normal text-primary-foreground/60">/ {formatCurrency(totalBudget)}</span>
          </p>
          <div className="mt-3 h-2 w-full rounded-full bg-primary-foreground/20 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalPercent}%`,
                backgroundColor: totalPercent >= 100 ? 'hsl(0, 84%, 60%)' : totalPercent >= 80 ? 'hsl(38, 92%, 50%)' : 'hsl(142, 71%, 45%)',
              }}
            />
          </div>
          <p className="text-primary-foreground/50 text-[10px] mt-1 text-right">{totalPercent.toFixed(0)}% terpakai</p>
        </div>
      </div>

      {/* Budget list */}
      <div className="px-4 mt-5 space-y-3">
        {budgetsWithSpent.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 shadow-sm border border-border text-center">
            <PieChart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Belum ada anggaran</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Tap + untuk menambah anggaran pertama</p>
          </div>
        ) : (
          budgetsWithSpent.map(b => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={handleEdit}
              onDelete={remove}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 transition-transform active:scale-95 hover:scale-105"
      >
        <Plus className="h-7 w-7 text-primary-foreground" />
      </button>

      <AddBudgetModal
        open={showAdd}
        onClose={handleClose}
        onSave={handleSave}
        editBudget={editBudget}
      />
    </div>
  );
};

export default BudgetPage;
