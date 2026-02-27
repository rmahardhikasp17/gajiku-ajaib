import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, CategoryIcon as CategoryIconType, Budget } from '@/types/models';
import CategoryIconComponent from '@/components/CategoryIcon';
import { cn } from '@/lib/utils';

const expenseCategories = CATEGORIES.filter(c => c.type === 'expense');

interface AddBudgetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { category: CategoryIconType; label: string; limit: number; period: 'weekly' | 'monthly' | 'yearly'; color: string }) => void;
  editBudget?: Budget | null;
}

const AddBudgetModal = ({ open, onClose, onSave, editBudget }: AddBudgetModalProps) => {
  const [category, setCategory] = useState<CategoryIconType | ''>(editBudget?.category || '');
  const [limit, setLimit] = useState(editBudget?.limit?.toString() || '');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>(editBudget?.period || 'monthly');

  const selectedCat = expenseCategories.find(c => c.id === category);

  const handleSubmit = () => {
    if (!category || !limit) return;
    const cat = expenseCategories.find(c => c.id === category)!;
    onSave({
      category: category as CategoryIconType,
      label: cat.label,
      limit: parseFloat(limit),
      period,
      color: cat.color,
    });
    setCategory('');
    setLimit('');
    setPeriod('monthly');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {editBudget ? 'Edit Anggaran' : 'Tambah Anggaran'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category grid */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Kategori</Label>
            <div className="grid grid-cols-4 gap-2">
              {expenseCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl p-2 text-[10px] transition-all border-2',
                    category === cat.id
                      ? 'border-primary bg-primary/10 font-semibold'
                      : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted'
                  )}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: `hsl(${cat.color} / 0.15)` }}
                  >
                    <CategoryIconComponent name={cat.icon} color={cat.color} size={16} />
                  </div>
                  <span className="truncate w-full text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Limit */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Batas Anggaran (Rp)</Label>
            <Input
              type="number"
              placeholder="0"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              className="text-xl font-bold h-12"
            />
          </div>

          {/* Period */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Periode</Label>
            <Select value={period} onValueChange={(v) => setPeriod(v as 'weekly' | 'monthly' | 'yearly')}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Mingguan</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!category || !limit}
            className="w-full h-12 text-base font-semibold rounded-xl"
          >
            {editBudget ? 'Simpan Perubahan' : 'Tambah Anggaran'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBudgetModal;
