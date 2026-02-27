import { CATEGORIES, Budget } from '@/types/models';
import { formatCurrency } from '@/lib/format';
import CategoryIconComponent from '@/components/CategoryIcon';
import { AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (b: Budget) => void;
  onDelete: (id: string) => void;
}

const BudgetCard = ({ budget, onEdit, onDelete }: BudgetCardProps) => {
  const cat = CATEGORIES.find(c => c.id === budget.category);
  const percent = budget.limit > 0 ? Math.min((budget.spent / budget.limit) * 100, 100) : 0;
  const isOver = budget.spent >= budget.limit;
  const isNear = percent >= 80 && !isOver;
  const remaining = budget.limit - budget.spent;

  const barColor = isOver
    ? 'hsl(0, 84%, 60%)'
    : isNear
    ? 'hsl(38, 92%, 50%)'
    : cat
    ? `hsl(${cat.color})`
    : 'hsl(var(--primary))';

  const periodLabel = budget.period === 'weekly' ? 'Minggu ini' : budget.period === 'monthly' ? 'Bulan ini' : 'Tahun ini';

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: cat ? `hsl(${cat.color} / 0.12)` : 'hsl(var(--muted))' }}
          >
            {cat && <CategoryIconComponent name={cat.icon} color={cat.color} size={20} />}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{budget.label}</p>
            <p className="text-[10px] text-muted-foreground">{periodLabel}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(budget)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => onDelete(budget.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%`, backgroundColor: barColor }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{formatCurrency(budget.spent)}</span>
          {' / '}
          {formatCurrency(budget.limit)}
        </p>
        <div className="flex items-center gap-1">
          {(isOver || isNear) && (
            <AlertTriangle className={cn('h-3.5 w-3.5', isOver ? 'text-expense' : 'text-warning')} />
          )}
          <span className={cn(
            'text-xs font-semibold',
            isOver ? 'text-expense' : isNear ? 'text-warning' : 'text-income'
          )}>
            {isOver ? `Lebih ${formatCurrency(Math.abs(remaining))}` : `Sisa ${formatCurrency(remaining)}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
