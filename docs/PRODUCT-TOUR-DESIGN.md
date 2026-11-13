# Desain Product Tour Native Daily Athlete OS

## 1. Ringkasan
Menyediakan panduan produk berbasis React/Tailwind untuk mengenalkan alur utama Daily Athlete OS tanpa dependensi paket luar.

## 2. Pustaka & Arsitektur
- **Engine**: Native React component (`ProductTour.tsx`) berbasis context global (`TourContext`).
- **Penyimpanan**: `localStorage` (`daily_athlete_tour_seen`).
- **Gaya**: Tema Dark Neon Sport, backdrop blur, spotlight beranimasi halus, dan tombol navigasi (Lanjut, Lewati, Selesai).

## 3. Alur Langkah (5 Langkah Utama)
1. **Home / Cockpit**: Kartu status atlet, Readiness score, dan rekomendasi latihan hari ini.
2. **FAB Log Tambah (+)**: Tombol aksi utama di tengah navbar untuk mencatat makanan, liquid booster, dan beban gym.
3. **Workout Studio (`/bulking`)**: Studio angkat beban Steve Magness (Gym A/B/C), timer McGill Big 3 7 detik, dan power-to-weight guardrail.
4. **Weekly Planner (`/planner`)**: Penyusun jadwal mingguan 75/25 Norwegian Singles dan sinkronisasi satu klik ke Intervals.icu.
5. **Lab & Race (`/lab`)**: Matriks interval NSA, audit cardiac drift, serta strategi pacing dan nutrisi lomba di `/race`.

## 4. Pemicu
- Muncul otomatis sekali saat pengguna pertama kali tiba di Home dengan status profil lengkap (atau setelah selesai onboarding).
- Tombol ulangi tur tersedia di Header atau Cockpit Home agar pengguna dapat memutar kembali kapan saja.
