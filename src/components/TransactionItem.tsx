import { Transaction, CATEGORIES } from '@/types/models';
import { formatCurrency, formatDateShort } from '@/lib/format';
import CategoryIconComponent from '@/components/CategoryIcon';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const cat = CATEGORIES.find(c => c.id === transaction.category);
  const isIncome = transaction.type === 'income';

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: cat ? `hsl(${cat.color} / 0.12)` : 'hsl(var(--muted))' }}
      >
        {cat && <CategoryIconComponent name={cat.icon} color={cat.color} size={20} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {cat?.label || transaction.category}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {transaction.note || formatDateShort(transaction.date)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${isIncome ? 'text-income' : 'text-expense'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {formatDateShort(transaction.date)}
        </p>
      </div>
    </div>
  );
};

export default TransactionItem;
