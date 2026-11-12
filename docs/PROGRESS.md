# PROJECT PROGRESS TRACKER (PROGRESS.md)
<!-- 
================================================================================
🤖 INSTRUKSI UNTUK AI AGENT (PANDUAN OPERASIONAL TRACKING):
1. MODE UPDATE PROGRES (EXECUTION):
   - Setiap kali menyelesaikan sebuah task atau fase pada Daily Athlete OS, ubah tanda `- [ ]` menjadi `- [x]`.
   - Update tabel "Ringkasan Progress" (ubah status 🔴/🟡/🟢 dan waktu aktual).
   - Tambahkan entri ringkas pada "Log Aktivitas & Harian" setelah setiap milestone penting.
   - Jika mengalami error atau blocker, catat segera di tabel "Kendala & Blocker" beserta resolusinya.

2. MODE ASESMEN STATUS (AUDIT & HEALTH-CHECK):
   - Evaluasi apakah seluruh 94 unit tests pada Core Engine tetap lulus (`pnpm test`).
   - Cek apakah ada task prasyarat (prerequisite) yang belum tercentang sebelum fase berikutnya dimulai.
================================================================================
-->

## Daily Athlete OS (`intervals-icu-mcp`) — Tracking Progres Pengerjaan
### Pelacakan Implementasi Core Physiology Engine, 37 MCP Tools, 16 AI Skills, dan Progressive Web App (PWA)

| Metadata Pelaksanaan | Nilai |
|----------------------|-------|
| **Tanggal Mulai** | 2026-09-12 (Core MCP) \| 2026-11-12 (Bulking Engine & Daily Athlete OS PWA Spec) |
| **Target Selesai / Deadline** | Core MCP & Bulking Skill: Selesai \| Full Web PWA: 5 Hari Kerja |
| **Status Keseluruhan** | 🟡 In Progress (Fase 0, 1, 2 Selesai 100% — Siap Masuk Fase Database & Web PWA) |
| **Persentase Selesai** | **45%** (Fondasi Engine, 37 MCP Tools, 16 Skills, & Dokumen Rekayasa Selesai) |
| **PIC / Penanggung Jawab** | FadhilAlif (`i655618`) & AI Coding Agent |

---

## 📊 Ringkasan Progress

| Fase | Komponen / Fokus Kerja | Status | Estimasi Waktu | Waktu Aktual | PIC / Agent |
|------|------------------------|--------|----------------|--------------|-------------|
| **0** | Setup Lingkungan, Repositori & Core MCP Server | 🟢 Selesai | 45 mnt | 35 mnt | Developer / AI Agent |
| **1** | Shared Pure Physiology & Bulking Engine (`src/utils/*`) | 🟢 Selesai | 2 jam | 1.5 jam | Developer / AI Agent |
| **2** | 37 MCP Tools & 16 AI Slash Command Skills (`/bulk-plan`) | 🟢 Selesai | 2 jam | 1.5 jam | Developer / AI Agent |
| **3** | Database Setup (`/Database/schema.sql`) & Seed Profil Atlet | 🔴 Belum | 45 mnt | - | Developer / AI Agent |
| **4** | `AthleteMasterService` & Intervals.icu Telemetry Bridge | 🔴 Belum | 1.5 jam | - | Developer / AI Agent |
| **5** | `BulkingAndTrainingService` (CRUD Atomik, Planner & Export) | 🔴 Belum | 3 jam | - | Developer / AI Agent |
| **6** | FrontEnd Web PWA (`Today Cockpit`, `Bulking Studio`, `Planner`) | 🔴 Belum | 3-4 jam | - | Developer / AI Agent |
| **7** | Security Middleware (`X-Api-Key`) & Offline PWA Service Worker | 🔴 Belum | 1 jam | - | Developer / AI Agent |
| **8** | Final Audit End-to-End, Dokumentasi & Deployment | 🟡 In Progress | 45 mnt | 25 mnt | Developer / AI Agent |

> **Indikator Status**: 🔴 Belum Dimulai | 🟡 Sedang Berjalan (In Progress) | 🟢 Selesai (Completed) | ⚠️ Terkendala (Blocked)

---

## FASE 0 — Setup Lingkungan & Inisialisasi Repositori

**Status**: 🟢 Selesai  
**Tanggal Selesai**: 2026-11-12

### Prerequisites & Tools
- [x] Runtime Node.js (`>=18.0.0`), TypeScript (`^5.7.2`), dan package manager `pnpm` terverifikasi.
- [x] Kredensial API Intervals.icu (`INTERVALS_API_KEY` & `INTERVALS_ATHLETE_ID=i655618`) terkonfigurasi di `.env`.
- [x] Test runner Vitest (`^4.1.10`) aktif dan terkonfigurasi (`vitest.config.ts`).
- [x] Git terkonfigurasi pada branch utama `main`.

### Struktur Repositori & Workspace
- [x] Struktur folder modular (`src/tools`, `src/utils`, `.agents/skills`, `docs/`) terbentuk.
- [x] HTTP Client terpusat (`src/client.ts`) dengan HTTP Basic Auth dan auto-retry HTTP 429 (`src/utils/retry.ts`) selesai dibuat.

---

## FASE 1 — Shared Pure Physiology & Bulking Engine (`src/utils/*`)

**Status**: 🟢 Selesai  
**Tanggal Selesai**: 2026-11-12

### Implementasi 10 Modul Kalkulator Murni (Zero I/O Side-Effects)
- [x] `src/utils/vdot.ts` — Rumus Jack Daniels VDOT & 5 zona pace lari (`vdot.test.ts` lulus).
- [x] `src/utils/nsa.ts` — Matriks interval berbasis durasi Norwegian Singles 1m s.d. 15m (`nsa.test.ts` lulus).
- [x] `src/utils/load.ts` — Evaluasi CTL, ATL, TSB, ACWR, Ramp Rate & Weekly Budget 75/25 (`load.test.ts` lulus).
- [x] `src/utils/readiness.ts` — Skor kesiapan komposit 0–100% GREEN/YELLOW/RED (`readiness.test.ts` lulus).
- [x] `src/utils/drift.ts` — Analisis *Aerobic Decoupling* EF Paruh 1 vs Paruh 2 (`drift.test.ts` lulus).
- [x] `src/utils/dsl.ts` — Validator sintaks Teks DSL workout Intervals.icu (`dsl.test.ts` lulus).
- [x] `src/utils/plan.ts` — Generator jadwal mingguan deterministik `E-Q-E-Q-E-Q-LR` (`plan.test.ts` lulus).
- [x] `src/utils/race.ts` — Prediksi waktu lomba & generator *A-Taper 10–14 Hari* (`race.test.ts` lulus).
- [x] `src/utils/fueling.ts` — Perencana *EJ Sport Gel (30g carb)*, hidrasi tropis & pacing CP (`fueling.test.ts` lulus).
- [x] `src/utils/bulking.ts` — Mesin *Clean Bulking* pelari (BMR Mifflin-St Jeor, NEAT kantor Jakarta, kalori lari/gym dinamis, makro 2.1g/kg protein, *Power-to-Weight Guardrail*, preset `GYM_A`/`GYM_B`/`GYM_C`, dan 5-Meal Jakarta + 2x *Liquid Booster*) (`bulking.test.ts` lulus).

---

## FASE 2 — 37 MCP Tools & 16 AI Slash Command Skills

**Status**: 🟢 Selesai  
**Tanggal Selesai**: 2026-11-12

### Registrasi & Pengujian MCP Tools
- [x] Seluruh 10 modul tool handler (`src/tools/*.ts`) terdaftar di `src/index.ts` (Total: **37 MCP Tools**).
- [x] Tool baru `calculate_bulking_plan` terdaftar di `src/tools/intelligence.ts` dengan validasi Zod schema.
- [x] Seluruh **94 unit tests across 20 test files** lulus 100% (`pnpm test`).
- [x] Kompilasi TypeScript (`pnpm run build`) menghasilkan artefak `dist/` tanpa error.

### Pembuatan & Sinkronisasi Agent Skills
- [x] Skill `/bulk-plan` (`.agents/skills/bulk-plan/SKILL.md`) selesai dibuat mengikuti standar `writing-great-skills`.
- [x] Direktori 16 Skills (14 Slash Commands + 2 Master Skills) tersinkronisasi di `.agents/README.md`, `docs/WORKFLOWS-GUIDE.md`, `.agents/rules/project-context.md`, dan `GUIDE.md`.

---

## FASE 3 — Database Setup & Seed Data (`/Database/schema.sql`)

**Status**: 🔴 Belum  
**Target Selesai**: Fase Pembangunan Web PWA Hari ke-1

### Skema & Migrasi Awal
- [ ] Database utama dibuat: `DailyAthleteOS_DB`
- [ ] File skrip `/Database/schema.sql` ditulis lengkap:
  - [ ] DDL Tabel Master Profil Atlet (`ATHLETE_MASTER`)
  - [ ] DDL Tabel Transaksi Induk Log Harian (`DAILY_LOG_HEADER`)
  - [ ] DDL Tabel Detail Makanan & Set Gym (`DAILY_LOG_ITEM`)
  - [ ] Foreign Key constraints, Check constraints (`QUANTITY > 0`), dan Unique Indexes (`LOG_NO`) terpasang
  - [ ] Seed data awal profil `FadhilAlif` (`i655618`, 180 cm, 63 kg, target 67 kg, CP 241W) dan contoh log harian disertakan
- [ ] Skrip berhasil dieksekusi clean dari nol tanpa error.

### Database Objects Tambahan (Stored Procedures / Views)
- [ ] File terpisah untuk Stored Procedure / View rekapitulasi: `/Database/sp_get_daily_logs.sql`

---

## FASE 4 — `AthleteMasterService` & Intervals.icu Telemetry Bridge

**Status**: 🔴 Belum  
**Target Selesai**: Fase Pembangunan Web PWA Hari ke-2

### Implementasi Layer & Endpoint
- [ ] Data Model & DTO untuk `ATHLETE_MASTER` dan ringkasan kesiapan harian.
- [ ] Repository & Service Layer untuk pembacaan profil atlet dan penggabungan data `get_wellness_data` + `get_fitness_chart`.
- [ ] Endpoint `GET /api/athletes` dan `GET /api/athletes/{id}` mengembalikan profil fisiologis & target *W/kg*.
- [ ] Endpoint `GET /api/telemetry/readiness` memanggil `calculateReadinessScore` dan mengembalikan skor 0–100% (`GREEN` / `YELLOW` / `RED`).

---

## FASE 5 — `BulkingAndTrainingService` (Transaksi Log Harian, Planner & Export)

**Status**: 🔴 Belum  
**Target Selesai**: Fase Pembangunan Web PWA Hari ke-3

### Repository & Integritas Transaksional
- [ ] Query daftar log harian (`GET /api/daily-logs`) dengan filter kata kunci dan rentang tanggal.
- [ ] Query detail tunggal (`GET /api/daily-logs/{id}`) beserta rincian item makanan/booster/gym.
- [ ] Operasi simpan (`POST /api/daily-logs`): Insert `DAILY_LOG_HEADER` + Bulk Insert `DAILY_LOG_ITEM` dalam transaksi database.
- [ ] Operasi ubah (`PUT /api/daily-logs/{id}`): Update header dan sinkronisasi item secara atomik.
- [ ] Operasi hapus (`DELETE /api/daily-logs/{id}`): Hapus `DAILY_LOG_ITEM` terlebih dahulu lalu `DAILY_LOG_HEADER` dalam `BEGIN TRANSACTION ... COMMIT` (**BR-06 / BR-09**).

### Validasi Business Rules & Ekspor
- [ ] Penegakan **BR-01 s/d BR-10** di Service Layer (termasuk kalkulasi server-side via `calculateBulkingPlan`).
- [ ] Endpoint `GET /api/daily-logs/export` menghasilkan file `.xlsx` / `.csv` sesuai filter aktif (**BR-11**).
- [ ] Endpoint `POST /api/planner/publish` menerbitkan jadwal lari + sesi gym + note kalori ke kalender Intervals.icu.

---

## FASE 6 — FrontEnd Web PWA (`Daily Athlete OS UI`)

**Status**: 🔴 Belum  
**Target Selesai**: Fase Pembangunan Web PWA Hari ke-4

### Kerangka Tampilan & 5 Modul Utama
- [ ] Inisialisasi aplikasi Web PWA (Next.js + Tailwind CSS Dark Sport UI) dengan HTTP Client terpusat ke backend.
- [ ] **Modul 1 (`Today Cockpit`)**: *Readiness Ring Gauge*, *5 Red Flags Toggle*, *Today's Workout Card*, *Dynamic Calorie Progress Bar*, dan tabel riwayat log harian + filter + tombol Export.
- [ ] **Modul 2 (`Hybrid Bulking & Gym Studio`)**:
  - [ ] Form Create & Edit Log Harian dengan tombol *"1-Tap Muat Preset 5-Meal Jakarta"* dan *"Muat Preset Gym A/B/C"*.
  - [ ] Grafik tren berat badan (*7-Day Moving Average*) dan *Power-to-Weight ($3.83\text{ W/kg}$) Guardrail Gauge*.
  - [ ] Widget interaktif **7–8s McGill Big 3 Isometric Timer** (piramida 6-4-2) dan modal konfirmasi hapus dinamis (**BR-12**).
- [ ] **Modul 3 (`Weekly Planner & Sync`)**: Pratinjau jadwal 7 hari (`E-Q-E-Q-E-Q-LR`) dengan indikator kepatuhan durasi 75/25 NSA dan tombol *1-Click Publish*.
- [ ] **Modul 4 & 5 (`NSA Lab` & `Offline Race Command Center`)**: Kalkulator VDOT/NSA Matrix dan kartu saku *EJ Sport Gel (30g carb)* + *Pacing Split CP*.

---

## FASE 7 — Keamanan (`X-Api-Key`) & Offline PWA Service Worker

**Status**: 🔴 Belum  
**Target Selesai**: Fase Pembangunan Web PWA Hari ke-5

- [ ] Konfigurasi `manifest.json` dan *Service Worker* agar aplikasi dapat di-install di layar utama smartphone dan membuka *Gym Card* / *Race Card* saat *offline*.
- [ ] Middleware verifikasi header `X-Api-Key` pada endpoint mutasi (`POST`, `PUT`, `DELETE`).
- [ ] Verifikasi keamanan: `INTERVALS_API_KEY` dan `DATABASE_URL` 100% terisolasi di server.

---

## FASE 8 — Dokumentasi, Audit & Penyerahan

**Status**: 🟡 In Progress  
**Target Selesai**: 2026-11-12 (Dokumen Spesifikasi & MCP Guide Selesai)

- [x] `GUIDE.md` dan `docs/WORKFLOWS-GUIDE.md` ditulis lengkap mencakup seluruh 37 MCP Tools dan 14 Slash Commands.
- [x] Dokumen spesifikasi `docs/PRD.md`, `docs/ARCHITECTURE.md`, `AGENTS.md`, dan `docs/PROGRESS.md` telah diisi lengkap sesuai visi **Daily Athlete OS**.
- [x] Seluruh 94 unit tests pada `src/` diverifikasi lulus 100% (`pnpm test`).
- [ ] Verifikasi akhir integrasi Web PWA & Database setelah Fase 3–7 dieksekusi.

---

## 📝 Log Aktivitas & Harian

### 2026-11-12
- **09:15 WIB** — Brainstorming kebutuhan fitur *Clean Bulking* untuk profil atlet `FadhilAlif` (`180 cm / 61–64 kg` menuju `66–68 kg`, *Office Hours Jakarta*, *Upper Hypertrophy + Lower Neural*).
- **09:30 WIB** — Penulisan dokumen spesifikasi desain `docs/superpowers/specs/2026-11-12-runner-bulking-plan-design.md`.
- **09:40 WIB** — Implementasi mesin murni `src/utils/bulking.ts` beserta unit test `src/utils/bulking.test.ts` dan registrasi MCP tool `calculate_bulking_plan` di `src/tools/intelligence.ts`.
- **09:42 WIB** — Pembuatan skill `/bulk-plan` di `.agents/skills/bulk-plan/SKILL.md` dan verifikasi 94 unit tests lulus 100% (`vitest`) + kompilasi `tsc` bersih.
- **09:55 WIB** — Pembuatan `GUIDE.md` sebagai panduan lengkap penggunaan 37 MCP Tools dan 14 AI Slash Commands.
- **10:10 WIB** — Penyusunan dokumen rekayasa perangkat lunak **Daily Athlete OS** pada `docs/PRD.md`, `docs/ARCHITECTURE.md`, `AGENTS.md`, dan `docs/PROGRESS.md`.

---

## 🚧 Kendala & Blocker

| Tanggal | Komponen / Modul | Kendala / Masalah yang Dihadapi | Tindakan Resolusi | Status |
|---------|------------------|---------------------------------|-------------------|--------|
| 2026-11-12 | `src/utils/bulking.ts` | Pada desain awal, pemilihan sesi gym hari Sabtu (`GYM_C`) membutuhkan pembeda eksplisit dari sesi `GYM_A` / `GYM_B`. | Menambahkan parameter opsional `gymSessionCode` (`GYM_A` \| `GYM_B` \| `GYM_C`) pada `BulkingInput` dan schema MCP tool `calculate_bulking_plan`. | 🟢 Teratasi |
| 2026-11-12 | Git Remote Repository | Remote `origin` mengarah ke repositori rekan (`hadidwirsty/intervals-icu-mcp`). | Menyimpan perubahan hanya sebagai *local commit* tanpa melakukan `git push` ke remote milik rekan. | 🟢 Teratasi |

---

## 💡 Keputusan Teknis yang Diambil Saat Implementasi

| Tanggal | Keputusan Teknis | Alasan & Rasionalisasi | Dampak terhadap Sistem |
|---------|------------------|------------------------|------------------------|
| 2026-11-12 | **Asymmetric Hypertrophy (Upper Push/Pull/Pump + Lower Neural)** | Latihan kaki hingga *failure* memicu DOMS dan merusak kualitas lari *Sub-Threshold* (LT2). Fokus hipertrofi ditempatkan pada tubuh atas, sedangkan kaki mengikuti protokol neural Steve Magness (3–4 reps @ RPE $\le 8$). | Sesi lari *Norwegian Singles* tetap segar; atlet tetap dapat menambah massa otot 4–5 kg secara proporsional di tinggi 180 cm. |
| 2026-11-12 | **Shared Pure TypeScript Engine (`src/utils/*.ts`)** | Menempatkan seluruh logika bisnis di fungsi murni tanpa I/O memungkinkan kode yang sama dipakai oleh MCP Server (`stdio`) sekaligus Backend Web PWA. | Zero duplikasi rumus antara AI Coach dan dashboard web; pengujian unit sangat cepat (< 1.5 detik untuk 94 tests). |
| 2026-11-12 | **Protokol 3 Solid Meals + 2 Liquid Calorie Boosters** | Mengonsumsi 3.100–3.500 kkal dari makanan padat saja memicu rasa begah saat bekerja di kantor Jakarta. | Dua shake cair (*Liquid Booster #1 & #2*) menyumbang ~1.050–1.200 kkal secara praktis dan mudah dicerna. |
