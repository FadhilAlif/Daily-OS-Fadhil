# Desain Sinkronisasi Dua Arah Aktivitas Lari Intervals.icu ke Daily Log

## 1. Konteks & Tujuan
Menyinkronkan aktivitas lari aktual yang tersimpan di Intervals.icu ke dalam `DAILY_LOG_HEADER` di basis data Neon. Sistem otomatis membaca kalori terbakar (`calories` / `icu_joules` / `icu_training_load`) dan memperbarui kolom `runningBurnKcal`, sehingga target nutrisi dan surplus kalori atlet terhitung dinamis dan akurat.

## 2. Arsitektur & Alur Kerja
1. **Trigger Sumber**:
   - **Vercel Cron Job**: Menjalankan route `GET /api/cron/sync-activities` secara periodik (misal 2 kali sehari: subuh 05:00 WIB dan malam 22:00 WIB).
   - **Tombol UI Manual**: Tombol "Sync Aktivitas" di kartu Cockpit (`TodayNutritionCard` / `ReadinessCard`) yang memicu `POST /api/telemetry/sync-activities`.
2. **Logika Sinkronisasi**:
   - Tarik aktivitas dalam rentang 3 hari terakhir (`oldest = today - 3d`, `newest = today`) dari `/athlete/{id}/activities`.
   - Filter hanya aktivitas berjenis `Run`.
   - Jumlahkan total kalori pembakaran lari per tanggal (jika ada lebih dari 1 sesi lari per hari).
   - Jika `DAILY_LOG_HEADER` untuk tanggal tersebut sudah ada: update `runningBurnKcal` dengan total pembakaran riil.
   - Jika belum ada: buat baris draft baru (`upsert`) dengan `morningWeightKg` dari profil atlet, `dayType` ditentukan dari durasi/beban latihan, dan minimal 1 item placeholder/catatan agar patuh `BR-03`.
3. **Keamanan**:
   - Endpoint cron dilindungi dengan header `Authorization: Bearer ${CRON_SECRET}` bawaan Vercel.
   - Panggilan manual dari UI menggunakan route API internal dengan session/token yang valid.

## 3. Komponen & Berkas Terkait
- `web/src/server/services/activity-sync.service.ts`: Mesin sinkronisasi aktivitas ke Drizzle ORM.
- `web/src/app/api/cron/sync-activities/route.ts`: Handler Cron Vercel.
- `web/src/app/api/telemetry/sync-activities/route.ts`: Handler tombol manual dari UI.
- `web/vercel.json`: Definisi jadwal Cron untuk Vercel.
- `web/src/components/cockpit/TodayNutritionCard.tsx`: Tombol aksi sync cepat di UI Cockpit.
