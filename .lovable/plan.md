## GAJIKU - Rencana Implementasi Bertahap

### Fase 1: Fondasi & Data Layer (KRUSIAL)

- Buat data models TypeScript (Transaction, Budget, SavingsGoal, Notification)
- Implementasi localStorage service untuk CRUD semua data (simpan, baca, update, hapus)
- Buat custom hooks: useTransactions, useBudgets, useSavings, useNotifications
- Setup routing: Dashboard, Budget, Savings, Report, Settings, PIN Lock

### Fase 2: Dashboard Utama

- Layout dashboard dengan header (saldo, bulan, notifikasi bell)
- Kartu ringkasan: Total Pemasukan, Total Pengeluaran, Sisa Saldo
- Grafik garis tren keuangan bulanan (recharts)
- Daftar transaksi terbaru dengan kategori & ikon
- Tombol FAB (+) untuk tambah transaksi baru (form modal: tipe, jumlah, kategori, catatan, tanggal)

### Fase 3: Manajemen Anggaran

- Halaman daftar anggaran dengan progress bar per kategori
- Ringkasan total anggaran vs terpakai di header
- Form tambah/edit anggaran (kategori, batas nominal, periode, warna)
- Logika otomatis: hitung pengeluaran terpakai dari transaksi
- Peringatan visual saat anggaran mendekati/melampaui batas

### Fase 4: Target Tabungan

- Halaman daftar goals dengan kartu visual (ikon, progress bar, jumlah)
- Ringkasan total tabungan di header
- Form tambah goal baru (nama, target, deadline, ikon)
- Aksi setor & tarik dana pada setiap goal
- Notifikasi otomatis saat target tercapai

### Fase 5: Laporan Keuangan

- Filter periode: Harian, Mingguan, Bulanan
- Pie chart distribusi pengeluaran per kategori
- Bar chart perbandingan pemasukan vs pengeluaran
- Detail statistik per kategori (jumlah, persentase, tren)
- Ringkasan: total pemasukan, pengeluaran, saldo bersih

### Fase 6: Notifikasi & Keamanan

- Pusat notifikasi dengan daftar peringatan & pencapaian
- Badge counter notifikasi belum dibaca di dashboard
- Layar PIN 6 digit untuk keamanan aplikasi
- Pengaturan: aktifkan/nonaktifkan PIN, ubah PIN
- Animasi keypad PIN sesuai desain

### Fase 7: Pengaturan & Polish

- Halaman pengaturan: profil, mata uang, bahasa, tema gelap/terang
- Ekspor data ke CSV/PDF
- Bottom navigation bar dengan 5 tab sesuai desain
- Responsif mobile-first untuk semua halaman
- UI polish: warna, tipografi, animasi transisi sesuai screenshot

tambahkan ekspor dan Impor data aplikasi menggunakan JSON agar bisa menjadi backup