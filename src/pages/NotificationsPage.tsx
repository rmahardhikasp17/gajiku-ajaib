import { useNotifications } from '@/hooks/useNotifications';
import { formatDate } from '@/lib/format';
import { Bell, BellOff, CheckCheck, Trash2, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification } from '@/types/models';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const typeConfig: Record<Notification['type'], { icon: typeof Bell; color: string; bg: string }> = {
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  success: { icon: CheckCircle2, color: 'text-income', bg: 'bg-income/10' },
  info: { icon: Info, color: 'text-info', bg: 'bg-info/10' },
};

const NotificationsPage = () => {
  const { notifications, loading, markRead, markAllRead, remove, unreadCount } = useNotifications();
  const navigate = useNavigate();

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
      <div className="bg-primary px-5 pb-6 pt-6 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-primary-foreground text-sm">←</button>
            <h1 className="text-primary-foreground text-lg font-bold">Notifikasi</h1>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 text-xs gap-1"
            >
              <CheckCheck className="h-4 w-4" />
              Tandai Semua
            </Button>
          )}
        </div>
        {unreadCount > 0 && (
          <p className="text-primary-foreground/60 text-xs mt-2">{unreadCount} belum dibaca</p>
        )}
      </div>

      <div className="px-4 mt-4 space-y-2">
        {notifications.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 shadow-sm border border-border text-center">
            <BellOff className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Tidak ada notifikasi</p>
          </div>
        ) : (
          notifications.map(n => {
            const config = typeConfig[n.type];
            const Icon = config.icon;
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={cn(
                  'rounded-2xl bg-card p-4 shadow-sm border border-border flex items-start gap-3 transition-all cursor-pointer',
                  !n.read && 'border-primary/20 bg-primary/[0.03]'
                )}
              >
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', config.bg)}>
                  <Icon className={cn('h-4 w-4', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-semibold text-foreground', !n.read && 'font-bold')}>
                      {n.title}
                    </p>
                    <button
                      onClick={e => { e.stopPropagation(); remove(n.id); }}
                      className="p-1 rounded-lg hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive/60" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{formatDate(n.createdAt)}</p>
                </div>
                {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
