import { useState } from 'react';
import { Bell, Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useNotifications } from '@/hooks/useNotifications';
import { formatCurrency, getMonthYear } from '@/lib/format';
import TrendChart from '@/components/TrendChart';
import TransactionItem from '@/components/TransactionItem';
import AddTransactionModal from '@/components/AddTransactionModal';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { transactions, add, totalIncome, totalExpense, balance } = useTransactions();
  const { unreadCount } = useNotifications();
  const [showAdd, setShowAdd] = useState(false);

  const recentTransactions = transactions.slice(0, 5);
  const currentMonth = getMonthYear(new Date().toISOString());

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary px-5 pb-8 pt-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-primary-foreground/70 text-xs font-medium">Selamat Datang 👋</p>
            <h1 className="text-primary-foreground text-lg font-bold">GAJIKU</h1>
          </div>
          <Link
            to="/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10"
          >
            <Bell className="h-5 w-5 text-primary-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-expense text-[10px] font-bold text-white px-1">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>

        {/* Balance card */}
        <div className="rounded-2xl bg-primary-foreground/10 backdrop-blur-sm p-4">
          <p className="text-primary-foreground/70 text-xs mb-1">{currentMonth}</p>
          <p className="text-primary-foreground text-2xl font-extrabold tracking-tight">
            {formatCurrency(balance)}
          </p>
          <p className="text-primary-foreground/60 text-[10px] mt-0.5">Sisa Saldo</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-income/10">
                <TrendingUp className="h-4 w-4 text-income" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Pemasukan</span>
            </div>
            <p className="text-base font-bold text-income">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-expense/10">
                <TrendingDown className="h-4 w-4 text-expense" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Pengeluaran</span>
            </div>
            <p className="text-base font-bold text-expense">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="px-4 mt-5">
        <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Tren Keuangan</h2>
            <span className="text-[10px] text-muted-foreground">6 bulan terakhir</span>
          </div>
          <TrendChart transactions={transactions} />
        </div>
      </div>

      {/* Recent transactions */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Transaksi Terbaru</h2>
          <span className="text-xs text-primary font-medium">Lihat Semua</span>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 shadow-sm border border-border text-center">
            <Wallet className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Belum ada transaksi</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Tap tombol + untuk menambah transaksi pertama
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-card shadow-sm border border-border divide-y divide-border px-4">
            {recentTransactions.map(t => (
              <TransactionItem key={t.id} transaction={t} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 transition-transform active:scale-95 hover:scale-105"
        style={{ maxWidth: 'calc(100% - 2rem)', left: 'auto' }}
      >
        <Plus className="h-7 w-7 text-primary-foreground" />
      </button>

      {/* Add transaction modal */}
      <AddTransactionModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={add}
      />
    </div>
  );
};

export default Dashboard;
