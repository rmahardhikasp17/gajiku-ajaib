import { Link, useLocation } from 'react-router-dom';
import { Home, PieChart, Target, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Beranda', icon: Home },
  { path: '/budget', label: 'Anggaran', icon: PieChart },
  { path: '/savings', label: 'Tabungan', icon: Target },
  { path: '/report', label: 'Laporan', icon: BarChart3 },
  { path: '/settings', label: 'Pengaturan', icon: Settings },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
                active ? 'text-primary font-semibold' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'text-primary')} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
