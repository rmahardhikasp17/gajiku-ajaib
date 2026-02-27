import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { useSavings } from '@/hooks/useSavings';
import { useNotifications } from '@/hooks/useNotifications';
import { formatCurrency } from '@/lib/format';
import { SavingsGoal } from '@/types/models';
import SavingsCard from '@/components/SavingsCard';
import AddSavingsModal from '@/components/AddSavingsModal';
import DepositWithdrawModal from '@/components/DepositWithdrawModal';
import { toast } from '@/hooks/use-toast';

const SavingsPage = () => {
  const { goals, add, deposit, withdraw, remove, totalSaved, totalTarget } = useSavings();
  const { add: addNotification } = useNotifications();
  const [showAdd, setShowAdd] = useState(false);
  const [activeGoal, setActiveGoal] = useState<SavingsGoal | null>(null);

  const totalPercent = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;

  const handleDeposit = (amount: number) => {
    if (!activeGoal) return;
    const updated = deposit(activeGoal.id, amount);
    if (updated && updated.currentAmount >= updated.targetAmount) {
      addNotification({
        title: '🎉 Target Tercapai!',
        message: `Selamat! Target "${updated.name}" berhasil tercapai!`,
        type: 'success',
      });
      toast({
        title: '🎉 Target Tercapai!',
        description: `Selamat! Target "${updated.name}" berhasil tercapai!`,
      });
    }
    setActiveGoal(null);
  };

  const handleWithdraw = (amount: number) => {
    if (!activeGoal) return;
    withdraw(activeGoal.id, amount);
    setActiveGoal(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary px-5 pb-8 pt-6 rounded-b-3xl">
        <h1 className="text-primary-foreground text-lg font-bold mb-4">Target Tabungan</h1>

        <div className="rounded-2xl bg-primary-foreground/10 backdrop-blur-sm p-4">
          <p className="text-primary-foreground/70 text-xs mb-1">Total Tabungan</p>
          <p className="text-primary-foreground text-xl font-extrabold">
            {formatCurrency(totalSaved)}
            <span className="text-sm font-normal text-primary-foreground/60"> / {formatCurrency(totalTarget)}</span>
          </p>
          <div className="mt-3 h-2 w-full rounded-full bg-primary-foreground/20 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-[hsl(142,71%,45%)]"
              style={{ width: `${totalPercent}%` }}
            />
          </div>
          <p className="text-primary-foreground/50 text-[10px] mt-1 text-right">{goals.length} target aktif</p>
        </div>
      </div>

      {/* Goals list */}
      <div className="px-4 mt-5 space-y-3">
        {goals.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 shadow-sm border border-border text-center">
            <Target className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Belum ada target tabungan</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Tap + untuk menambah target pertama</p>
          </div>
        ) : (
          goals.map(g => (
            <SavingsCard key={g.id} goal={g} onTap={setActiveGoal} onDelete={remove} />
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

      <AddSavingsModal open={showAdd} onClose={() => setShowAdd(false)} onSave={add} />

      {activeGoal && (
        <DepositWithdrawModal
          open={!!activeGoal}
          onClose={() => setActiveGoal(null)}
          goalName={activeGoal.name}
          currentAmount={activeGoal.currentAmount}
          targetAmount={activeGoal.targetAmount}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
        />
      )}
    </div>
  );
};

export default SavingsPage;
