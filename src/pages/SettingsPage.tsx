import { useState, useRef, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { exportData, importData } from '@/services/storage';
import { hashPin } from '@/components/PinLock';
import {
  User, Palette, Lock, Download, Upload, Moon, Sun, Monitor,
  ChevronRight, Shield, Coins, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CURRENCIES = [
  { value: 'IDR', label: 'IDR - Rupiah Indonesia' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'MYR', label: 'MYR - Ringgit Malaysia' },
];

const SettingsPage = () => {
  const { settings, update } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PIN dialog
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pinMode, setPinMode] = useState<'setup' | 'change' | 'disable'>('setup');
  const [pinStep, setPinStep] = useState<'current' | 'new' | 'confirm'>('new');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [settings.theme]);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    update({ theme });
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gajiku-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Berhasil!', description: 'Data berhasil diekspor' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = ev.target?.result as string;
      if (importData(json)) {
        toast({ title: 'Berhasil!', description: 'Data berhasil diimpor. Halaman akan dimuat ulang.' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast({ title: 'Gagal', description: 'File tidak valid', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // PIN logic
  const openPinDialog = (mode: 'setup' | 'change' | 'disable') => {
    setPinMode(mode);
    setPinStep(mode === 'setup' ? 'new' : 'current');
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setPinError('');
    setPinDialogOpen(true);
  };

  const handlePinSubmit = () => {
    if (pinStep === 'current') {
      if (hashPin(currentPin) !== settings.pinHash) {
        setPinError('PIN lama salah');
        return;
      }
      if (pinMode === 'disable') {
        update({ pinEnabled: false, pinHash: null });
        setPinDialogOpen(false);
        toast({ title: 'PIN Dinonaktifkan', description: 'Kunci PIN telah dinonaktifkan' });
        return;
      }
      setPinStep('new');
      setPinError('');
      return;
    }
    if (pinStep === 'new') {
      if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
        setPinError('PIN harus 6 digit angka');
        return;
      }
      setPinStep('confirm');
      setPinError('');
      return;
    }
    if (pinStep === 'confirm') {
      if (confirmPin !== newPin) {
        setPinError('PIN tidak cocok');
        return;
      }
      update({ pinEnabled: true, pinHash: hashPin(newPin) });
      setPinDialogOpen(false);
      toast({
        title: pinMode === 'setup' ? 'PIN Aktif!' : 'PIN Diubah!',
        description: pinMode === 'setup' ? 'Kunci PIN berhasil diaktifkan' : 'PIN berhasil diubah',
      });
    }
  };

  const themeIcon = settings.theme === 'dark' ? Moon : settings.theme === 'light' ? Sun : Monitor;
  const ThemeIcon = themeIcon;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="text-primary-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">Pengaturan</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <User className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-primary-foreground font-semibold text-lg">{settings.userName}</p>
            <p className="text-primary-foreground/60 text-sm">Pengguna GAJIKU</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Profile */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Nama</Label>
              <Input
                value={settings.userName}
                onChange={(e) => update({ userName: e.target.value })}
                placeholder="Nama Anda"
                maxLength={50}
              />
            </div>
          </CardContent>
        </Card>

        {/* Currency */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" /> Mata Uang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={settings.currency} onValueChange={(v) => update({ currency: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" /> Tampilan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'light' as const, label: 'Terang', icon: Sun },
                { value: 'dark' as const, label: 'Gelap', icon: Moon },
                { value: 'system' as const, label: 'Sistem', icon: Monitor },
              ]).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleThemeChange(value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    settings.theme === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* PIN Security */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Keamanan PIN
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Kunci Aplikasi</p>
                <p className="text-xs text-muted-foreground">Minta PIN saat membuka aplikasi</p>
              </div>
              <Switch
                checked={settings.pinEnabled}
                onCheckedChange={(checked) => {
                  if (checked) {
                    openPinDialog('setup');
                  } else {
                    if (settings.pinHash) {
                      openPinDialog('disable');
                    } else {
                      update({ pinEnabled: false });
                    }
                  }
                }}
              />
            </div>
            {settings.pinEnabled && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => openPinDialog('change')}
              >
                <Lock className="h-4 w-4 mr-2" /> Ubah PIN
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Export / Import */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" /> Backup & Restore
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-between" onClick={handleExport}>
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Ekspor Data (JSON)
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4" /> Impor Data (JSON)
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <p className="text-xs text-muted-foreground text-center mt-2">
              Ekspor untuk backup, impor untuk mengembalikan data
            </p>
          </CardContent>
        </Card>

        {/* App info */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">GAJIKU v1.0.0</p>
          <p className="text-xs text-muted-foreground">Aplikasi Manajemen Keuangan Pribadi</p>
        </div>
      </div>

      {/* PIN Dialog */}
      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {pinMode === 'setup' && 'Buat PIN Baru'}
              {pinMode === 'change' && (pinStep === 'current' ? 'Verifikasi PIN Lama' : pinStep === 'new' ? 'PIN Baru' : 'Konfirmasi PIN')}
              {pinMode === 'disable' && 'Nonaktifkan PIN'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {pinStep === 'current' && (
              <div>
                <Label className="text-xs text-muted-foreground">PIN Lama (6 digit)</Label>
                <Input
                  type="password"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                />
              </div>
            )}
            {pinStep === 'new' && (
              <div>
                <Label className="text-xs text-muted-foreground">PIN Baru (6 digit)</Label>
                <Input
                  type="password"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                />
              </div>
            )}
            {pinStep === 'confirm' && (
              <div>
                <Label className="text-xs text-muted-foreground">Konfirmasi PIN</Label>
                <Input
                  type="password"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                />
              </div>
            )}
            {pinError && <p className="text-xs text-destructive">{pinError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPinDialogOpen(false)}>Batal</Button>
            <Button onClick={handlePinSubmit}>
              {pinStep === 'confirm' || (pinStep === 'current' && pinMode === 'disable') ? 'Simpan' : 'Lanjut'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
