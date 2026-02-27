import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { CATEGORIES, Transaction } from '@/types/models';
import { formatCurrency } from '@/lib/format';
import CategoryIconComponent from '@/components/CategoryIcon';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

type Period = 'daily' | 'weekly' | 'monthly';

const PERIOD_LABELS: Record<Period, string> = {
  daily: 'Harian',
  weekly: 'Mingguan',
  monthly: 'Bulanan',
};

function filterByPeriod(transactions: Transaction[], period: Period): Transaction[] {
  const now = new Date();
  return transactions.filter(t => {
    const d = new Date(t.date);
    if (period === 'daily') {
      return d.toDateString() === now.toDateString();
    } else if (period === 'weekly') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo && d <= now;
    } else {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
  });
}

const PIE_COLORS = [
  'hsl(25, 95%, 53%)', 'hsl(199, 89%, 48%)', 'hsl(330, 81%, 60%)',
  'hsl(262, 83%, 58%)', 'hsl(0, 84%, 60%)', 'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)', 'hsl(200, 18%, 46%)', 'hsl(280, 60%, 50%)', 'hsl(160, 60%, 40%)',
];

const ReportPage = () => {
  const { transactions, loading } = useTransactions();
  const [period, setPeriod] = useState<Period>('monthly');

  const filtered = useMemo(() => filterByPeriod(transactions, period), [transactions, period]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const pieData = useMemo(() => {
    const expenses = filtered.filter(t => t.type === 'expense');
    const catMap = new Map<string, number>();
    expenses.forEach(t => catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount));
    return Array.from(catMap.entries())
      .map(([catId, amount]) => {
        const cat = CATEGORIES.find(c => c.id === catId);
        return { name: cat?.label || catId, value: amount, catId, color: cat?.color || '200 18% 46%' };
      })
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const barData = useMemo(() => {
    const now = new Date();
    const result: { name: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(d);
      const monthTxs = transactions.filter(t => t.date.startsWith(key));
      result.push({
        name: label,
        income: monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return result;
  }, [transactions]);

  const categoryStats = useMemo(() => {
    const total = pieData.reduce((s, d) => s + d.value, 0);
    return pieData.map(d => ({
      ...d,
      percent: total > 0 ? (d.value / total) * 100 : 0,
      cat: CATEGORIES.find(c => c.id === d.catId),
    }));
  }, [pieData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary px-5 pb-8 pt-6 rounded-b-3xl">
        <h1 className="text-primary-foreground text-lg font-bold mb-4">Laporan Keuangan</h1>

        {/* Period filter */}
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-primary-foreground/10 p-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'rounded-lg py-2 text-xs font-semibold transition-all',
                period === p
                  ? 'bg-primary-foreground text-primary shadow-sm'
                  : 'text-primary-foreground/70'
              )}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-card p-3 shadow-sm border border-border text-center">
            <TrendingUp className="h-4 w-4 text-income mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Pemasukan</p>
            <p className="text-xs font-bold text-income">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="rounded-2xl bg-card p-3 shadow-sm border border-border text-center">
            <TrendingDown className="h-4 w-4 text-expense mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Pengeluaran</p>
            <p className="text-xs font-bold text-expense">{formatCurrency(totalExpense)}</p>
          </div>
          <div className="rounded-2xl bg-card p-3 shadow-sm border border-border text-center">
            <Wallet className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Saldo</p>
            <p className={cn('text-xs font-bold', netBalance >= 0 ? 'text-income' : 'text-expense')}>
              {formatCurrency(netBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Pie chart */}
      <div className="px-4 mt-5">
        <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
          <h2 className="text-sm font-bold text-foreground mb-3">Distribusi Pengeluaran</h2>
          {pieData.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Belum ada pengeluaran
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Jumlah']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bar chart */}
      <div className="px-4 mt-4">
        <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
          <h2 className="text-sm font-bold text-foreground mb-3">Pemasukan vs Pengeluaran</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000000).toFixed(0)}jt`} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'income' ? 'Pemasukan' : 'Pengeluaran',
                ]}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
              />
              <Bar dataKey="income" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="expense" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="px-4 mt-4">
        <div className="rounded-2xl bg-card shadow-sm border border-border divide-y divide-border">
          <div className="p-4">
            <h2 className="text-sm font-bold text-foreground">Detail per Kategori</h2>
          </div>
          {categoryStats.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Belum ada data</div>
          ) : (
            categoryStats.map((stat, i) => (
              <div key={stat.catId} className="flex items-center gap-3 px-4 py-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `hsl(${stat.cat?.color || '200 18% 46%'} / 0.12)` }}
                >
                  {stat.cat && <CategoryIconComponent name={stat.cat.icon} color={stat.cat.color} size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-foreground">{stat.name}</p>
                    <p className="text-xs font-bold text-foreground">{formatCurrency(stat.value)}</p>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${stat.percent}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground shrink-0 w-8 text-right">
                  {stat.percent.toFixed(0)}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
