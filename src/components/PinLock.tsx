import { useState, useCallback, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';
import { Delete, Fingerprint, Lock } from 'lucide-react';

interface PinLockProps {
  onUnlock: () => void;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

const PinLock = ({ onUnlock }: PinLockProps) => {
  const { settings } = useSettings();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [shake, setShake] = useState(false);

  // Lockout countdown
  useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutRemaining(remaining);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setAttempts(0);
        setError('');
      }
    }, 200);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const hashPin = (p: string) => {
    // Simple hash for demo - in production use bcrypt/argon2
    let hash = 0;
    for (let i = 0; i < p.length; i++) {
      const char = p.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash.toString();
  };

  const handleDigit = useCallback((digit: string) => {
    if (lockoutUntil) return;
    if (pin.length >= 6) return;

    const newPin = pin + digit;
    setPin(newPin);
    setError('');

    if (newPin.length === 6) {
      // Verify
      if (hashPin(newPin) === settings.pinHash) {
        onUnlock();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setShake(true);
        setTimeout(() => setShake(false), 500);

        if (newAttempts >= MAX_ATTEMPTS) {
          setLockoutUntil(Date.now() + LOCKOUT_SECONDS * 1000);
          setError(`Terlalu banyak percobaan. Coba lagi dalam ${LOCKOUT_SECONDS} detik`);
        } else {
          setError(`PIN salah. ${MAX_ATTEMPTS - newAttempts} percobaan tersisa`);
        }
        setTimeout(() => setPin(''), 300);
      }
    }
  }, [pin, settings.pinHash, onUnlock, attempts, lockoutUntil]);

  const handleDelete = useCallback(() => {
    if (lockoutUntil) return;
    setPin(prev => prev.slice(0, -1));
    setError('');
  }, [lockoutUntil]);

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primary">
      <div className="flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/10 mb-4">
          <Lock className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-primary-foreground text-xl font-bold mb-1">GAJIKU</h1>
        <p className="text-primary-foreground/60 text-sm mb-8">Masukkan PIN untuk melanjutkan</p>

        {/* PIN dots */}
        <div className={cn('flex gap-3 mb-4', shake && 'animate-[shake_0.5s_ease-in-out]')}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-3.5 w-3.5 rounded-full transition-all duration-200',
                i < pin.length
                  ? 'bg-primary-foreground scale-110'
                  : 'bg-primary-foreground/20'
              )}
            />
          ))}
        </div>

        {/* Error */}
        <div className="h-6 mb-6">
          {error && <p className="text-xs text-red-300 text-center">{error}</p>}
          {lockoutUntil && lockoutRemaining > 0 && (
            <p className="text-xs text-red-300">Tunggu {lockoutRemaining} detik...</p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 max-w-[260px]">
          {keys.map((key, i) => {
            if (key === '') return <div key={i} />;
            if (key === 'del') {
              return (
                <button
                  key={i}
                  onClick={handleDelete}
                  className="flex h-16 w-16 items-center justify-center rounded-full text-primary-foreground/70 active:bg-primary-foreground/10 transition-colors mx-auto"
                >
                  <Delete className="h-6 w-6" />
                </button>
              );
            }
            return (
              <button
                key={i}
                onClick={() => handleDigit(key)}
                disabled={!!lockoutUntil}
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-full text-2xl font-semibold text-primary-foreground transition-all mx-auto',
                  'bg-primary-foreground/10 active:bg-primary-foreground/20 active:scale-95',
                  lockoutUntil && 'opacity-40 cursor-not-allowed'
                )}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PinLock;

export { PinLock };

// Utility to hash pin (exported for setup)
export function hashPin(p: string): string {
  let hash = 0;
  for (let i = 0; i < p.length; i++) {
    const char = p.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString();
}
