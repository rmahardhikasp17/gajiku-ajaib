import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

interface DepositWithdrawModalProps {
  open: boolean;
  onClose: () => void;
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
}

const DepositWithdrawModal = ({ open, onClose, goalName, currentAmount, targetAmount, onDeposit, onWithdraw }: DepositWithdrawModalProps) => {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');

  const remaining = targetAmount - currentAmount;
  const canWithdraw = currentAmount > 0;
  const parsedAmount = parseFloat(amount) || 0;
  const isValid = parsedAmount > 0 && (mode === 'deposit' || parsedAmount <= currentAmount);

  const handleSubmit = () => {
    if (!isValid) return;
    if (mode === 'deposit') {
      onDeposit(parsedAmount);
    } else {
      onWithdraw(parsedAmount);
    }
    setAmount('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{goalName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground">Terkumpul</p>
            <p className="text-2xl font-extrabold text-foreground">{formatCurrency(currentAmount)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sisa {formatCurrency(remaining > 0 ? remaining : 0)}</p>
          </div>

          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            <button
              onClick={() => setMode('deposit')}
              className={cn(
                'rounded-lg py-2.5 text-sm font-semibold transition-all',
                mode === 'deposit' ? 'bg-income text-white shadow-sm' : 'text-muted-foreground'
              )}
            >
              Setor
            </button>
            <button
              onClick={() => setMode('withdraw')}
              disabled={!canWithdraw}
              className={cn(
                'rounded-lg py-2.5 text-sm font-semibold transition-all',
                mode === 'withdraw' ? 'bg-expense text-white shadow-sm' : 'text-muted-foreground',
                !canWithdraw && 'opacity-40 cursor-not-allowed'
              )}
            >
              Tarik
            </button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Jumlah (Rp)</Label>
            <Input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} className="text-xl font-bold h-12" />
            {mode === 'withdraw' && parsedAmount > currentAmount && (
              <p className="text-xs text-expense">Melebihi saldo terkumpul</p>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={!isValid} className={cn('w-full h-12 text-base font-semibold rounded-xl', mode === 'withdraw' && 'bg-expense hover:bg-expense/90')}>
            {mode === 'deposit' ? 'Setor Dana' : 'Tarik Dana'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepositWithdrawModal;
