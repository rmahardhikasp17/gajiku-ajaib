import { useMemo } from 'react';
import { Transaction } from '@/types/models';
import { formatCurrency } from '@/lib/format';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface TrendChartProps {
  transactions: Transaction[];
}

const TrendChart = ({ transactions }: TrendChartProps) => {
  const data = useMemo(() => {
    const now = new Date();
    const months: { name: string; income: number; expense: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(d);

      const monthTxs = transactions.filter(t => t.date.startsWith(monthKey));
      months.push({
        name: label,
        income: monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return months;
  }, [transactions]);

  const hasData = data.some(d => d.income > 0 || d.expense > 0);

  if (!hasData) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Belum ada data untuk grafik
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000000).toFixed(0)}jt`} />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatCurrency(value),
            name === 'income' ? 'Pemasukan' : 'Pengeluaran',
          ]}
          contentStyle={{
            borderRadius: '12px',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            fontSize: '12px',
          }}
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="hsl(142, 71%, 45%)"
          strokeWidth={2}
          fill="url(#incomeGrad)"
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="hsl(0, 84%, 60%)"
          strokeWidth={2}
          fill="url(#expenseGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;
