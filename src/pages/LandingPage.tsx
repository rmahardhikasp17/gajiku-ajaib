import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  Shield,
  PieChart,
  Target,
  BarChart3,
  Smartphone,
  Monitor,
  Download,
  ChevronRight,
  ArrowRight,
  Zap,
  WifiOff,
  Lock,
  Sparkles,
  CircleDollarSign,
  CheckCircle2,
  Share,
  PlusSquare,
  Package,
} from 'lucide-react';
import { usePlatformDetect } from '@/hooks/usePlatformDetect';

// ── Intersection Observer Hook ──
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ── Animated Counter ──
function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{count.toLocaleString('id-ID')}{suffix}</span>;
}

// ── Feature Card ──
function FeatureCard({ icon: Icon, title, description, delay }: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-all duration-700 hover:bg-white/10 hover:border-indigo-400/30 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 transition-colors group-hover:from-indigo-500/30 group-hover:to-blue-500/30">
        <Icon className="h-6 w-6 text-indigo-400" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}

// ── Step Card ──
function StepCard({ step, title, description, icon: Icon, delay }: {
  step: number;
  title: string;
  description: string;
  icon: React.ElementType;
  delay: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`relative flex items-start gap-5 transition-all duration-700 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex shrink-0 flex-col items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/30">
          <Icon className="h-7 w-7 text-white" />
        </div>
        {step < 4 && <div className="mt-2 h-14 w-px bg-gradient-to-b from-indigo-500/50 to-transparent" />}
      </div>
      <div className="pb-8">
        <span className="mb-1 inline-block rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-400">Langkah {step}</span>
        <h3 className="mb-1 text-lg font-bold text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-400">{description}</p>
      </div>
    </div>
  );
}


// ═══════════════ MAIN LANDING PAGE ═══════════════
const LandingPage = () => {
  const { platform, isStandalone, triggerInstall, installEvent } = usePlatformDetect();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav
        id="landing-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20' : 'bg-transparent'}`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">GAJIKU</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="transition-colors hover:text-white">Fitur</a>
            <a href="#how-it-works" className="transition-colors hover:text-white">Cara Kerja</a>
            <a href="#install" className="transition-colors hover:text-white">Install</a>
          </div>
          <Link
            to="/app"
            id="navbar-enter-app"
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110 active:scale-95"
          >
            Masuk Aplikasi
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section id="hero" className="relative flex min-h-[100dvh] items-center justify-center px-5 pt-20">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/8 blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-600/8 blur-[100px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-sm animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Gratis • Offline • Tanpa Iklan</span>
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl animate-fade-in-up">
            Kelola Keuangan
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Tanpa Ribet
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-slate-400 md:text-lg animate-fade-in-up-delay">
            Catat pemasukan, pengeluaran, anggaran &amp; tabungan dalam satu aplikasi.
            Bisa digunakan kapan saja — bahkan tanpa internet.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up-delay-2">
            <Link
              to="/app"
              id="hero-enter-app"
              className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 hover:brightness-110 active:scale-95"
            >
              Mulai Sekarang
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#install"
              id="hero-install-link"
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
            >
              <Download className="h-5 w-5" />
              Install Gratis
            </a>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-6 border-t border-white/5 pt-10 animate-fade-in-up-delay-3">
            <div>
              <p className="text-2xl font-extrabold text-white md:text-3xl">
                <AnimatedCounter end={100} suffix="%" />
              </p>
              <p className="mt-1 text-xs text-slate-500 md:text-sm">Gratis Selamanya</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white md:text-3xl">
                <AnimatedCounter end={0} suffix="" />
              </p>
              <p className="mt-1 text-xs text-slate-500 md:text-sm">Iklan Mengganggu</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white md:text-3xl">
                <AnimatedCounter end={3} suffix="" />
              </p>
              <p className="mt-1 text-xs text-slate-500 md:text-sm">Platform Didukung</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-10 w-6 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
            <div className="h-2 w-1 rounded-full bg-white/40 animate-scroll-dot" />
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="relative py-24 px-5">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">Fitur Unggulan</span>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Semua yang Kamu Butuhkan
            </h2>
            <p className="mt-4 text-slate-400 max-w-lg mx-auto">
              Fitur lengkap untuk mengelola keuangan pribadi — dirancang agar simple tapi powerful.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={CircleDollarSign}
              title="Catat Transaksi"
              description="Tambah pemasukan dan pengeluaran dengan cepat. Kategorisasi otomatis dan catatan detail."
              delay={0}
            />
            <FeatureCard
              icon={PieChart}
              title="Anggaran Bulanan"
              description="Atur budget per kategori. Dapat notifikasi jika pengeluaran mendekati batas."
              delay={100}
            />
            <FeatureCard
              icon={Target}
              title="Target Tabungan"
              description="Buat target menabung dengan tracking progress visual. Motivasi keuanganmu."
              delay={200}
            />
            <FeatureCard
              icon={BarChart3}
              title="Laporan Lengkap"
              description="Grafik tren keuangan, perbandingan bulanan, dan analisis pengeluaran terbesar."
              delay={300}
            />
            <FeatureCard
              icon={WifiOff}
              title="Offline First"
              description="Semua data tersimpan di perangkatmu. Tidak perlu internet untuk menggunakan GAJIKU."
              delay={400}
            />
            <FeatureCard
              icon={Lock}
              title="Keamanan PIN"
              description="Lindungi data keuangan dengan PIN. Privasi kamu terjaga."
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section id="how-it-works" className="relative py-24 px-5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 right-0 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-indigo-600/5 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">Cara Kerja</span>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Mulai dalam 4 Langkah
            </h2>
            <p className="mt-4 text-slate-400 max-w-lg mx-auto">
              Dari install hingga mengelola keuangan — semudah menghitung 1-2-3-4.
            </p>
          </div>

          <div className="mx-auto max-w-xl">
            <StepCard
              step={1}
              icon={Download}
              title="Install GAJIKU"
              description="Install sebagai PWA di smartphone atau desktop. Tanpa perlu app store."
              delay={0}
            />
            <StepCard
              step={2}
              icon={Zap}
              title="Catat Transaksi"
              description="Tambah pemasukan dan pengeluaran harian. Cepat, cuma butuh beberapa detik."
              delay={150}
            />
            <StepCard
              step={3}
              icon={PieChart}
              title="Atur Anggaran"
              description="Tentukan batas pengeluaran per kategori. GAJIKU akan mengingatkanmu."
              delay={300}
            />
            <StepCard
              step={4}
              icon={TrendingUp}
              title="Pantau Keuangan"
              description="Lihat tren, laporan, dan progress tabungan. Ambil keputusan finansial lebih baik."
              delay={450}
            />
          </div>
        </div>
      </section>

      {/* ── Install Section ── */}
      <section id="install" className="relative py-24 px-5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-indigo-600/5 blur-[150px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">Install</span>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Pasang di Semua Perangkat
            </h2>
            <p className="mt-4 text-slate-400 max-w-lg mx-auto">
              GAJIKU mendukung instalasi di Desktop, Android, dan iOS — tanpa app store.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Desktop */}
            <InstallCard
              icon={Monitor}
              title="Desktop"
              subtitle="Chrome / Edge"
              steps={[
                'Buka GAJIKU di Chrome atau Edge',
                'Klik ikon install (⊕) di address bar',
                'Klik "Install" pada dialog yang muncul',
              ]}
              isActive={platform === 'desktop'}
              canInstall={platform === 'desktop' && !!installEvent}
              onInstall={triggerInstall}
            />

            {/* Android */}
            <InstallCard
              icon={Smartphone}
              title="Android"
              subtitle="APK / Chrome"
              steps={[
                'Buka GAJIKU di Chrome',
                'Tap "Add to Home Screen" pada banner',
                'Atau tap ⋮ Menu → "Install App"',
              ]}
              isActive={platform === 'android'}
              canInstall={platform === 'android' && !!installEvent}
              onInstall={triggerInstall}
              apkDownloadUrl="/gajiku.apk"
            />

            {/* iOS */}
            <InstallCard
              icon={Smartphone}
              title="iOS"
              subtitle="Safari"
              steps={[
                'Buka GAJIKU di Safari',
              ]}
              iosSteps
              isActive={platform === 'ios'}
              canInstall={false}
              onInstall={() => Promise.resolve(false)}
            />
          </div>

          {isStandalone && (
            <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/10 py-4 px-6 text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-semibold">GAJIKU sudah terinstall di perangkat ini!</span>
            </div>
          )}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section id="final-cta" className="relative py-24 px-5">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-10 md:p-16 backdrop-blur-sm">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-2xl shadow-indigo-500/40">
                <Wallet className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              Siap Kelola Keuanganmu?
            </h2>
            <p className="mb-8 text-slate-400 max-w-md mx-auto">
              Mulai catat keuangan sekarang. Gratis, aman, dan bisa offline.
            </p>
            <Link
              to="/app"
              id="final-cta-enter-app"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 hover:brightness-110 active:scale-95"
            >
              Masuk Aplikasi
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-5">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-300">GAJIKU</span>
          </div>
          <p>© {new Date().getFullYear()} GAJIKU. Pembukuan Keuangan Pribadi.</p>
        </div>
      </footer>
    </div>
  );
};

// ── Install Card Component ──
function InstallCard({
  icon: Icon,
  title,
  subtitle,
  steps,
  isActive,
  canInstall,
  onInstall,
  iosSteps,
  apkDownloadUrl,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  steps: string[];
  isActive: boolean;
  canInstall: boolean;
  onInstall: () => Promise<boolean>;
  iosSteps?: boolean;
  apkDownloadUrl?: string;
}) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      className={`relative rounded-2xl border p-6 transition-all duration-700 ${
        isActive
          ? 'border-indigo-500/30 bg-indigo-500/5 shadow-lg shadow-indigo-500/10'
          : 'border-white/10 bg-white/5'
      } ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {isActive && (
        <span className="absolute -top-3 left-5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 px-3 py-1 text-[11px] font-bold text-white shadow-lg">
          Perangkat Anda
        </span>
      )}

      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20">
          <Icon className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      {/* APK Download Option */}
      {apkDownloadUrl && (
        <div className="mb-5">
          <a
            href={apkDownloadUrl}
            download
            id="download-apk-btn"
            className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:brightness-110 active:scale-[0.98]"
          >
            <Package className="h-5 w-5 transition-transform group-hover:scale-110" />
            Download APK
          </a>
          <p className="mt-2 text-center text-[11px] text-slate-500">
            Versi aplikasi Android • Install langsung tanpa Play Store
          </p>

          {/* Divider */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">atau install via browser</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>
        </div>
      )}

      <div className="space-y-3 mb-5">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-400">
              {i + 1}
            </span>
            <p className="text-sm text-slate-400 pt-0.5">{step}</p>
          </div>
        ))}
        {iosSteps && (
          <>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-400">
                2
              </span>
              <div className="flex items-center gap-1.5 pt-0.5">
                <p className="text-sm text-slate-400">Tap tombol</p>
                <Share className="h-4 w-4 text-indigo-400" />
                <p className="text-sm text-slate-400">Share</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-400">
                3
              </span>
              <div className="flex items-center gap-1.5 pt-0.5">
                <p className="text-sm text-slate-400">Pilih</p>
                <PlusSquare className="h-4 w-4 text-indigo-400" />
                <p className="text-sm text-slate-400 font-medium">"Add to Home Screen"</p>
              </div>
            </div>
          </>
        )}
      </div>

      {canInstall ? (
        <button
          onClick={onInstall}
          id={`install-btn-${title.toLowerCase()}`}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110 active:scale-[0.98]"
        >
          <span className="flex items-center justify-center gap-2">
            <Download className="h-4 w-4" />
            Install Sekarang
          </span>
        </button>
      ) : apkDownloadUrl ? (
        <div className="w-full rounded-xl bg-white/5 py-3 text-center text-sm font-medium text-slate-500">
          Gunakan APK di atas atau ikuti langkah PWA
        </div>
      ) : (
        <div className="w-full rounded-xl bg-white/5 py-3 text-center text-sm font-medium text-slate-500">
          {isActive ? 'Ikuti langkah di atas' : 'Buka di perangkat ini'}
        </div>
      )}
    </div>
  );
}

export default LandingPage;
