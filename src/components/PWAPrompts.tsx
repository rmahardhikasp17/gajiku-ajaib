// Hook untuk mendeteksi update PWA dan menampilkan prompt install
import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, Download, X } from 'lucide-react';

// ── Update Notification Banner ──
export function PWAUpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('[GAJIKU PWA] Service Worker registered:', r);
    },
    onRegisterError(error) {
      console.error('[GAJIKU PWA] SW registration error:', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 mx-auto max-w-md">
      <div className="m-3 rounded-2xl bg-primary text-primary-foreground shadow-xl p-4 flex items-center gap-3">
        <RefreshCw className="h-5 w-5 shrink-0 animate-spin-slow" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Pembaruan Tersedia</p>
          <p className="text-xs text-primary-foreground/70">Versi baru GAJIKU siap digunakan</p>
        </div>
        <button
          onClick={() => updateServiceWorker(true)}
          className="rounded-lg bg-primary-foreground/20 px-3 py-1.5 text-xs font-semibold hover:bg-primary-foreground/30 transition-colors"
        >
          Perbarui
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="rounded-lg p-1 hover:bg-primary-foreground/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Install Prompt Banner ──
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('pwa-install-dismissed') === 'true'
  );
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Cek apakah sudah diinstall (standalone mode = sudah install)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const result = await installEvent.userChoice;
    if (result.outcome === 'accepted') {
      setInstalled(true);
    }
    setInstallEvent(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Tidak tampilkan jika: sudah diinstall, tidak ada prompt, atau sudah dismiss
  if (installed || !installEvent || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 mx-auto max-w-md px-4">
      <div className="rounded-2xl bg-card border border-border shadow-xl p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Install GAJIKU</p>
          <p className="text-xs text-muted-foreground">Pasang di layar utama untuk akses offline</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            Nanti
          </button>
          <button
            onClick={handleInstall}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
