import { SavingsGoal } from '@/types/models';
import { formatCurrency, formatDate } from '@/lib/format';
import { CalendarDays, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavingsCardProps {
  goal: SavingsGoal;
  onTap: (g: SavingsGoal) => void;
  onDelete: (id: string) => void;
}

const SavingsCard = ({ goal, onTap, onDelete }: SavingsCardProps) => {
  const percent = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
  const isComplete = percent >= 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const deadlineDate = new Date(goal.deadline);
  const isOverdue = deadlineDate < new Date() && !isComplete;

  return (
    <div
      onClick={() => onTap(goal)}
      className={cn(
        'rounded-2xl bg-card p-4 shadow-sm border border-border cursor-pointer transition-all hover:shadow-md active:scale-[0.98]',
        isComplete && 'border-income/30 bg-income/5'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-2xl">
            {goal.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{goal.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <CalendarDays className={cn('h-3 w-3', isOverdue ? 'text-expense' : 'text-muted-foreground')} />
              <p className={cn('text-[10px]', isOverdue ? 'text-expense font-medium' : 'text-muted-foreground')}>
                {formatDate(goal.deadline)}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(goal.id); }}
          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </button>
      </div>

      {/* Progress */}
      <div className="mb-2">
        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              backgroundColor: isComplete ? 'hsl(142, 71%, 45%)' : 'hsl(217, 91%, 60%)',
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{formatCurrency(goal.currentAmount)}</span>
          {' / '}
          {formatCurrency(goal.targetAmount)}
        </p>
        <span className={cn(
          'text-xs font-semibold',
          isComplete ? 'text-income' : 'text-primary'
        )}>
          {isComplete ? '✅ Tercapai!' : `${percent.toFixed(0)}%`}
        </span>
      </div>
    </div>
  );
};

export default SavingsCard;
