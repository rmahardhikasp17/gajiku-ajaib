import { useState, useEffect } from 'react';

export type Platform = 'ios' | 'android' | 'desktop';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PlatformInfo {
  platform: Platform;
  canInstallPWA: boolean;
  isStandalone: boolean;
  installEvent: BeforeInstallPromptEvent | null;
  triggerInstall: () => Promise<boolean>;
}

export function usePlatformDetect(): PlatformInfo {
  const [platform, setPlatform] = useState<Platform>('desktop');
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);

    if (isIOS) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check if running as standalone (installed)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsStandalone(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const canInstallPWA = platform === 'ios' ? true : !!installEvent;

  const triggerInstall = async (): Promise<boolean> => {
    if (!installEvent) return false;
    await installEvent.prompt();
    const result = await installEvent.userChoice;
    if (result.outcome === 'accepted') {
      setIsStandalone(true);
      return true;
    }
    setInstallEvent(null);
    return false;
  };

  return {
    platform,
    canInstallPWA,
    isStandalone,
    installEvent,
    triggerInstall,
  };
}
