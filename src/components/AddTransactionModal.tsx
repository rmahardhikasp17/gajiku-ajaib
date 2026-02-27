import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORIES, TransactionType, CategoryIcon as CategoryIconType } from '@/types/models';
import CategoryIconComponent from '@/components/CategoryIcon';
import { cn } from '@/lib/utils';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: {
    type: TransactionType;
    amount: number;
    category: CategoryIconType;
    note: string;
    date: string;
  }) => void;
}

const AddTransactionModal = ({ open, onClose, onAdd }: AddTransactionModalProps) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryIconType | ''>('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredCategories = CATEGORIES.filter(c => c.type === type);

  const handleSubmit = () => {
    if (!amount || !category || !date) return;
    onAdd({
      type,
      amount: parseFloat(amount),
      category: category as CategoryIconType,
      note,
      date: new Date(date).toISOString(),
    });
    // Reset
    setAmount('');
    setCategory('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Tambah Transaksi</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            <button
              onClick={() => { setType('income'); setCategory(''); }}
              className={cn(
                'rounded-lg py-2.5 text-sm font-semibold transition-all',
                type === 'income'
                  ? 'bg-income text-white shadow-sm'
                  : 'text-muted-foreground'
              )}
            >
              Pemasukan
            </button>
            <button
              onClick={() => { setType('expense'); setCategory(''); }}
              className={cn(
                'rounded-lg py-2.5 text-sm font-semibold transition-all',
                type === 'expense'
                  ? 'bg-expense text-white shadow-sm'
                  : 'text-muted-foreground'
              )}
            >
              Pengeluaran
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Jumlah (Rp)</Label>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="text-xl font-bold h-12"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Tanggal</Label>
            <Input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Kategori</Label>
            <div className="grid grid-cols-4 gap-2">
              {filteredCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl p-2.5 text-[10px] transition-all border-2',
                    category === cat.id
                      ? 'border-primary bg-primary/10 font-semibold'
                      : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted'
                  )}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: `hsl(${cat.color} / 0.15)` }}
                  >
                    <CategoryIconComponent name={cat.icon} color={cat.color} size={18} />
                  </div>
                  <span className="truncate w-full text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Catatan</Label>
            <Textarea
              placeholder="Tulis catatan..."
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!amount || !category}
            className="w-full h-12 text-base font-semibold rounded-xl"
          >
            Simpan Transaksi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;
