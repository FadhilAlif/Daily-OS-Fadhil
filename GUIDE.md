# 📖 Panduan Penggunaan Daily Athlete OS (`intervals-icu-mcp`)

Panduan komprehensif untuk memasang, mengonfigurasi, dan mengoperasikan **Daily Athlete OS**: platform terpadu yang memadukan **Intervals.icu MCP Server (37 Tools)**, **16 AI Agent Skills**, **Shared Pure Physiology & Bulking Engine**, serta antarmuka modern **Progressive Web App (PWA)** berbasis **Next.js 16** dan basis data **Neon PostgreSQL**.

---

## 📌 Daftar Isi
1. [Tentang Sistem & Arsitektur](#1-tentang-sistem--arsitektur)
2. [Struktur Direktori Repositori](#2-struktur-direktori-repositori)
3. [Prasyarat & Konfigurasi Lingkungan](#3-prasyarat--konfigurasi-lingkungan)
4. [Instalasi, Pengujian, & Kompilasi](#4-instalasi-pengujian--kompilasi)
5. [Menjalankan Web PWA (`web/`)](#5-menjalankan-web-pwa-web)
6. [Konfigurasi MCP Client](#6-konfigurasi-mcp-client)
7. [Daftar 37 MCP Tools](#7-daftar-37-mcp-tools)
8. [Daftar 16 AI Agent Skills (Slash Commands)](#8-daftar-16-ai-agent-skills-slash-commands)
9. [Panduan Penggunaan Web PWA](#9-panduan-penggunaan-web-pwa)
10. [Spesifikasi Kontrak REST API](#10-spesifikasi-kontrak-rest-api)
11. [Status Fitur & Batasan Sistem Saat Ini](#11-status-fitur--batasan-sistem-saat-ini)
12. [Troubleshooting & Pemecahan Masalah](#12-troubleshooting--pemecahan-masalah)

---

## 1. Tentang Sistem & Arsitektur

**Daily Athlete OS** adalah sistem operasi harian atlet endurance dan *hybrid clean bulking* (61–64 kg menuju 66–68 kg) yang mengusung arsitektur *modular monolith* dengan lapisan logika terisolasi:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │        Shared Pure Physiology & Bulking Engine          │
                  │   (src/utils/*.ts — 10 Pure Calculators, 94 Vitest Tests)│
                  └───────────────┬─────────────────────────┬───────────────┘
                                  │                         │
                  ┌───────────────▼───────────┐ ┌───────────▼───────────────┐
                  │    Core MCP Server        │ │   Daily Athlete OS PWA    │
                  │  (src/index.ts, stdio)    │ │ (web/ — Next.js 16 + React 19)│
                  │  37 Tools & 16 Skills     │ │ Tailwind CSS + Service Worker│
                  └───────────────┬───────────┘ └───────────┬───────────────┘
                                  │                         │
                  ┌───────────────▼───────────┐ ┌───────────▼───────────────┐
                  │    Intervals.icu API      │ │    Neon PostgreSQL DB     │
                  │ (Telemetry, Load, Events) │ │ (Master, Logs & Items DDL)│
                  └───────────────────────────┘ └───────────────────────────┘
```

### 3 Pilar Metodologi Ilmiah
1. **Lari (Endurance)**: *Norwegian Singles Training Method* — kontrol akumulasi laktat Sub-T LT2 (85–95% Critical Power), rasio durasi 75% Easy / 25% Sub-T, dan rest pasif berjalan kaki.
2. **Kekuatan (Strength)**: *Steve Magness 5-Tool Framework* & *Dr. Stuart McGill Big 3* — adaptasi saraf murni (*heavy neural* 3–5 reps RPE $\le$ 8, piramida isometrik 6-4-2 tahan 7 detik, nol beban kaki perusak recovery lari).
3. **Nutrisi (Nutrition)**: *Clean Bulking Hybrid Runner* — surplus bersih dinamis (+400 kkal di atas TDEE harian aktual), target protein 2.0–2.2 g/kg, 2x *Liquid Calorie Booster* ramah kantor Jakarta, serta proteksi rasio *Power-to-Weight* ($W/kg$).

---

## 2. Struktur Direktori Repositori

```
intervals-icu-mcp/
├── src/                                  ← MCP Stdio Server & Shared Pure Engine
│   ├── tools/                            ← 10 Modul Handler MCP Tools (37 Tools)
│   ├── utils/                            ← 10 Pure Calculators (vdot, nsa, load, bulking, dll.)
│   ├── client.ts                         ← Intervals.icu HTTP Client (Basic Auth + Retry 429)
│   ├── config.ts                         ← Environment Variable Reader
│   ├── index.ts                          ← Entry point server MCP stdio
│   └── types.ts                          ← Tipe TypeScript standar MCP
├── web/                                  ← Web PWA & REST Services (Next.js 16 App Router)
│   ├── src/app/                          ← Halaman App Router & Route Handlers
│   │   ├── page.tsx                      ← Today Cockpit
│   │   ├── bulking/page.tsx              ← Bulking & Gym Studio (Steve Magness & McGill Timer)
│   │   ├── onboarding/page.tsx           ← Profil Atlet & Live Sync Intervals.icu
│   │   ├── planner/page.tsx              ← 7-Day NSA Training Planner
│   │   ├── lab/page.tsx                  ← VDOT & Pace Zone Calculator Lab
│   │   ├── race/page.tsx                 ← Race Strategy & Pacing
│   │   └── api/                          ← REST API Routes (athletes, daily-logs, readiness, gym)
│   ├── src/components/                   ← Komponen UI Sport Dark, Cockpit, & Dialog Log
│   ├── src/server/                       ← Repository Drizzle ORM & Service Layer (BR-01..BR-12)
│   ├── scripts/migrate.mjs               ← Script eksekusi migrasi DDL Neon DB
│   └── public/manifest.json              ← Manifest Progressive Web App
├── Database/                             ← Database DDL & Views
│   ├── schema.sql                        ← DDL PostgreSQL (athlete_master, daily_log_header/item)
│   └── sp_get_daily_logs.sql             ← View agregasi rekap log server-side
├── .agents/                              ← AI Agent Configuration & 16 Skills
│   ├── rules/                            ← Guardrails fisiologis & project context
│   └── skills/                           ← 16 Skills (/bulk-plan, /plan-week, /readiness-check, dll.)
├── docs/                                 ← Dokumentasi Rekayasa Perangkat Lunak
│   ├── PRD.md                            ← Product Requirements Document
│   ├── ARCHITECTURE.md                   ← Desain Arsitektur & ERD
│   ├── PROGRESS.md                       ← Pelacak Progres Pelaksanaan
│   └── WORKFLOWS-GUIDE.md                ← Panduan Alur 14 Rutinitas AI Coach
├── AGENTS.md                             ← Aturan ketat AI Coding Agent
├── GUIDE.md                              ← Panduan penggunaan ini
└── README.md                             ← Ringkasan repositori utama
```

---

## 3. Prasyarat & Konfigurasi Lingkungan

### A. Kebutuhan Perangkat Lunak
- **Node.js**: Versi `v18.0.0` atau lebih baru (`node -v`). Disarankan `v20` atau `v22`.
- **pnpm**: Versi `10.x` / `11.x` (`npm install -g pnpm`).
- **PostgreSQL**: Database relasional Neon Serverless PostgreSQL (atau PostgreSQL lokal).

### B. Konfigurasi MCP Server Root (`.env`)
Salin template `.env.example` di root menjadi `.env`:
```bash
cp .env.example .env
```
Isi variabel berikut:
```env
INTERVALS_API_KEY="api_key_intervals_anda"
INTERVALS_ATHLETE_ID="i655618"
INTERVALS_API_BASE_URL="https://intervals.icu/api/v1"
```
*(Dapatkan API Key di menu **Intervals.icu** > **Settings** > **Developer Settings**).*

### C. Konfigurasi Web PWA (`web/.env.local`)
Salin template `web/.env.example` menjadi `web/.env.local`:
```bash
cd web
cp .env.example .env.local
```
Isi konfigurasi database Neon dan kredensial Intervals:
```env
# Neon Serverless PostgreSQL Connection String
DATABASE_URL="postgresql://user:password@ep-sample-pooler.ap-southeast-1.aws.neon.tech/Daily-OS-Fadhil?sslmode=require"

# Intervals.icu API Credentials
INTERVALS_API_KEY="api_key_intervals_anda"
INTERVALS_ATHLETE_ID="i655618"
INTERVALS_API_BASE_URL="https://intervals.icu/api/v1"

# Opsional: Athlete ID default untuk single-user mode
DEFAULT_ATHLETE_ID=1
```
> 🔒 **Keamanan**: File `.env` dan `.env.local` otomatis diabaikan oleh `.gitignore`. Jangan pernah meng-commit file kredensial ke Git.

---

## 4. Instalasi, Pengujian, & Kompilasi

Jalankan perintah berikut di root repositori:

```bash
# 1. Install seluruh dependensi root (MCP SDK, Vitest, Zod)
pnpm install

# 2. Jalankan unit test suite (94 tests wajib lulus 100%)
pnpm test

# 3. Kompilasi TypeScript MCP Server ke folder dist/
pnpm run build
```

---

## 5. Menjalankan Web PWA (`web/`)

### A. Inisialisasi Skema Basis Data (Neon DB)
Jalankan migrasi skema DDL ke Neon PostgreSQL dari folder `web`:
```bash
cd web
pnpm db:migrate
```
Perintah ini akan menjalankan skrip `Database/schema.sql` dan `Database/sp_get_daily_logs.sql` untuk membuat tabel `athlete_master`, `daily_log_header`, `daily_log_item`, serta memasukkan profil seed atlet.

### B. Menjalankan Server Development
```bash
cd web
pnpm dev
```
Buka peramban di `http://localhost:3000`.

> 💡 **Catatan pnpm 11**: Jika muncul peringatan script build `esbuild`, jalankan `pnpm approve-builds esbuild` di folder `web`.

### C. Verifikasi Kompilasi Produksi Web
```bash
cd web
npx next build
```

---

## 6. Konfigurasi MCP Client

Server MCP berkomunikasi via transport **stdio**. Berkas output kompilasi berada di `dist/index.js`.

### A. Konfigurasi di Claude Desktop
Buka file konfigurasi Claude Desktop:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Tambahkan pada blok `mcpServers`:
```json
{
  "mcpServers": {
    "intervals-icu": {
      "command": "node",
      "args": [
        "C:\\Users\\<USER>\\...\\intervals-icu-mcp\\dist\\index.js"
      ],
      "env": {
        "INTERVALS_API_KEY": "YOUR_INTERVALS_API_KEY",
        "INTERVALS_ATHLETE_ID": "i655618"
      }
    }
  }
}
```

### B. Konfigurasi di Antigravity / Cursor / VS Code (Cline / Roo-Code)
Tambahkan ke berkas konfigurasi MCP workspace Anda:
```json
{
  "mcpServers": {
    "intervals-icu": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "C:\\Users\\<USER>\\...\\intervals-icu-mcp",
      "env": {
        "INTERVALS_API_KEY": "YOUR_INTERVALS_API_KEY",
        "INTERVALS_ATHLETE_ID": "i655618"
      }
    }
  }
}
```

---

## 7. Daftar 37 MCP Tools

Tools berikut siap dipanggil secara otonom oleh AI Assistant melalui protokol MCP:

| No | Nama Tool | Kategori Domain | Deskripsi Fungsional |
|:--:|---|---|---|
| 1 | `get_activities` | Activities | Ambil riwayat aktivitas olahraga dalam rentang tanggal |
| 2 | `get_activity_details` | Activities | Detail komprehensif sesi (pace, HR, cadence, watt, kurva daya) |
| 3 | `get_activity_intervals` | Activities | Data interval split putaran/lap (work vs rest) |
| 4 | `get_activity_streams` | Activities | Telemetri detik-per-detik (watts, HR, cad, speed, altitude) |
| 5 | `get_activity_messages` | Activities | Riwayat komentar dan catatan evaluasi coaching |
| 6 | `add_activity_message` | Activities | Tambah evaluasi coaching langsung ke aktivitas Intervals.icu |
| 7 | `get_athlete_profile` | Athlete | Profil fisiologis atlet (FTP/CP, LTHR, BB, resting HR) |
| 8 | `get_training_zones` | Athlete | Zona daya lari (7 Zones), Friel HR zones, dan pace zones |
| 9 | `calculate_vdot` | Calculator | Hitung Jack Daniels VDOT dari hasil time trial / race |
| 10| `calculate_pace_zones` | Calculator | Hitung 5 zona pace lari berdasarkan nilai VDOT |
| 11| `calculate_nsa_matrix` | Calculator | Matriks interval resmi Norwegian Singles (1m s.d. 15m) |
| 12| `get_events` | Calendar | Daftar event kalender (planned workout, note, race) |
| 13| `get_event_by_id` | Calendar | Detail satu event kalender berdasarkan Event ID |
| 14| `delete_event` | Calendar | Hapus event dari kalender Intervals.icu |
| 15| `add_or_update_planned_workout` | Calendar | Jadwalkan latihan berencana (Run, WeightTraining, dll.) |
| 16| `add_or_update_note` | Calendar | Buat/perbarui catatan teks target kalori di kalender |
| 17| `get_workout_library` | Calendar | Pustaka template latihan tersimpan atlet |
| 18| `get_workout_by_id` | Calendar | Detail template latihan beserta target langkah demi langkah |
| 19| `create_running_workout` | Calendar | Buat running workout via format Teks DSL resmi |
| 20| `get_custom_items` | Custom Items | Daftar custom chart, custom field, atau interval field |
| 21| `get_custom_item_by_id` | Custom Items | Ambil metadata satu custom item |
| 22| `create_custom_item` | Custom Items | Buat custom item baru di Intervals.icu |
| 23| `update_custom_item` | Custom Items | Perbarui metadata custom item |
| 24| `delete_custom_item` | Custom Items | Hapus custom item |
| 25| `get_gear_list` | Gear | Daftar sepatu lari dan peralatan terdaftar beserta jarak tempuh |
| 26| `predict_race_time` | Intelligence | Prediksi waktu finish & pace race berbasis VDOT + CTL/TSB |
| 27| `calculate_taper_plan` | Intelligence | Pola tapering 10–14 hari (A-Taper NSA: -35% lalu -50%) |
| 28| `analyze_cardiac_drift` | Intelligence | Aerobic Decoupling EF paruh 1 vs paruh 2 dari data stream |
| 29| `calculate_readiness_score` | Intelligence | Skor kesiapan 0–100% (TSB, ACWR, Sleep Score, RHR Spike) |
| 30| `calculate_race_fueling` | Intelligence | Strategi nutrisi race day, gel 30g carb, batas cairan tropis |
| 31| `calculate_bulking_plan` | Intelligence | Kalori dinamis lari+kantor, makro, gym upper hypertrophy |
| 32| `analyze_training_load` | Load | Evaluasi CTL, ATL, TSB, Ramp Rate, & ACWR |
| 33| `calculate_weekly_budget` | Load | Alokasi durasi latihan mingguan 75/25 NSA (5–9 jam) |
| 34| `get_athlete_power_curves` | Power Curves | Kurva daya lari (Power Duration Curve) tersimpan |
| 35| `get_wellness_data` | Wellness | Catatan harian berat badan, sleep score, RHR, HRV |
| 36| `get_fitness_chart` | Wellness | Time series fitness chart (CTL, ATL, TSB, Ramp Rate) |
| 37| `generate_weekly_plan` | Calendar | Generator susunan rencana mingguan NSA terstruktur |

---

## 8. Daftar 16 AI Agent Skills (Slash Commands)

Tersedia **16 Skills** di direktori `.agents/skills/` yang dapat dieksekusi melalui slash command di ruang chat AI:

| No | Perintah Slash | Direktori Skill | Fungsi & Metodologi Utama |
|:--:|---|---|---|
| 1 | **`/bulk-plan`** | `bulk-plan/` | Perencanaan bulking surplus dinamis (+400 kkal), makro, 2x liquid booster, dan gym upper hypertrophy. |
| 2 | **`/plan-week`** | `plan-week/` | Penyusunan jadwal latihan 1 pekan (`E-Q-E-Q-E-Q-LR`) dengan durasi 75/25 NSA & opsi publish kalender. |
| 3 | **`/readiness-check`** | `readiness-check/` | Evaluasi kesiapan fisik harian 0–100% (GREEN, YELLOW, RED) dari telemetri tidur dan beban. |
| 4 | **`/run-report`** | `run-report/` | Evaluasi pasca-lari: kepatuhan zona watt Sub-T, kestabilan HR, rest pasif, dan RPE. |
| 5 | **`/cardiac-drift`** | `cardiac-drift/` | Analisis *Aerobic Decoupling* stream telemetri (HR vs Speed/Watt) paruh 1 vs paruh 2. |
| 6 | **`/fitness-status`** | `fitness-status/` | Ringkasan cepat fitness chart (CTL, ATL, TSB, form status, deload signal). |
| 7 | **`/training-load-analysis`**| `training-load-analysis/`| Audit mendalam beban latihan jangka panjang berbasis metrik kebugaran Intervals.icu. |
| 8 | **`/weekly-budget`** | `weekly-budget/` | Kalkulator budget durasi mingguan 5–9 jam dengan rasio 75% Easy / 25% Sub-T. |
| 9 | **`/calc-nsa`** | `calc-nsa/` | Matriks durasi interval resmi Norwegian Singles (1m s.d. 15m) sesuai VDOT & CP. |
| 10| **`/calc-vdot`** | `calc-vdot/` | Kalkulasi Jack Daniels VDOT dan 5 zona pace lari dari hasil time trial. |
| 11| **`/check-workout`** | `check-workout/` | Cek jadwal latihan mendatang dari kalender Intervals.icu beserta target watt/HR. |
| 12| **`/create-workout`** | `create-workout/` | Terbitkan sesi latihan lari berstruktur ke kalender via format Teks DSL. |
| 13| **`/strength-guide`** | `strength-guide/` | Panduan kekuatan Steve Magness & protokol isometrik tulang belakang McGill Big 3. |
| 14| **`/predict-race`** | `predict-race/` | Prediksi waktu finish 5K/10K/HM/FM & susunan jadwal tapering 10–14 hari. |
| 15| **`/race-strategy`** | `race-strategy/` | Rencana fueling gel 30g carb, hidrasi cuaca panas, dan split pacing kilometer-per-kilometer. |
| 16| **N/A (Master)** | `running-coach-analysis/` | Pangkalan pengetahuan master coaching lari ilmiah dan panduan profil fisiologis atlet. |

---

## 9. Panduan Penggunaan Web PWA

### A. Halaman `Today Cockpit` (`/`)
- **Readiness Ring**: Menampilkan skor kesiapan harian (0–100%) bersumber live dari Intervals.icu.
- **Sesi & Nutrisi Hari Ini**: Progres kalori dan protein harian dihitung secara *server-side* berdasarkan log transaksi hari ini terhadap target dinamis atlet.
- **Riwayat Log Harian**: Menampilkan daftar log transaksi 14 hari terakhir dengan tombol ekspor CSV dan tombol hapus log.
- **Modal Tambah Log Atomik**: Formulir pencatatan log harian yang mematuhi aturan bisnis **BR-01 s.d. BR-09** (tanggal $\le$ hari ini, nomor log unik, minimal 1 line item, kuantitas $>0$). Menyediakan tombol preset 5-Meal Jakarta untuk pengisian instan.
- **Modal Konfirmasi Hapus**: Dialog konfirmasi dinamis menampilkan nomor dokumen (`LOG_NO`) sebelum penghapusan data induk dan baris anak secara atomik (**BR-11 & BR-09**).

### B. Halaman `Bulking & Gym Studio` (`/bulking`)
- **Power-to-Weight Guardrail**: Memantau rasio daya terhadap berat badan ($W/kg$) aktif. Menyajikan proyeksi target Critical Power saat atlet mencapai target bobot 67 kg agar rasio tidak turun.
- **Sesi Gym A, B, & C**: Tab latihan terstruktur sesuai prinsip Steve Magness:
  - `GYM_A`: Upper Push Hypertrophy + Lower Neural (Incline DB Bench, Overhead Press, Trap Bar RDL 4 reps).
  - `GYM_B`: Upper Pull Hypertrophy + Pelvic Armor (Weighted Chin-Up, Single-Arm DB Row, Copenhagen Plank).
  - `GYM_C`: Upper Hypertrophy Pump (Dada & Punggung) dengan **proteksi 0 beban kaki** demi menjaga Long Run esok hari.
- **Log Sesi Gym ke DB**: Menyimpan baris latihan gym ke tabel transaksi Neon PostgreSQL.
- **McGill Big 3 Timer**: Timer interaktif 7 detik bersuara visual untuk piramida isometrik 6-4-2 (Modified Curl-Up, Side Bridge, Bird-Dog).
- **Protokol 5-Meal Jakarta**: Rincian waktu dan makro 3 makanan padat + 2 *Liquid Booster* yang ditarik langsung dari modul murni `src/utils/bulking.ts`.

### C. Halaman `Onboarding & Profil Atlet` (`/onboarding`)
- Menampilkan profil atlet terdaftar dari Neon DB.
- Menyediakan tombol sinkronisasi langsung (*Live Sync*) untuk menarik parameter Critical Power, LTHR, Max HR, dan berat badan dari akun Intervals.icu ke basis data lokal.

---

## 10. Spesifikasi Kontrak REST API

Layanan API Routes berjalan pada runtime Next.js (`/api/*`):

| Method | Endpoint | Deskripsi | Input Utama | Respon Berhasil |
|---|---|---|---|---|
| `GET` | `/api/athletes` | Ambil profil atlet aktif & rencana bulking default | Query: `?intervalsId=i655618` | `200 OK`: `{ needsOnboarding, athlete, defaultPlan }` |
| `POST` | `/api/athletes/sync-intervals`| Tarik profil live dari Intervals.icu ke DB | JSON Body profil | `200 OK`: Profil terbarui di DB |
| `GET` | `/api/telemetry/readiness` | Ambil skor kesiapan fisik harian | `?date=YYYY-MM-DD` | `200 OK`: `{ readinessScore, status, tsb, ctl, source }` |
| `GET` | `/api/daily-logs` | Ambil daftar log harian beserta kalkulasi server | `?startDate=&endDate=` | `200 OK`: `{ success: true, logs: [...] }` |
| `POST` | `/api/daily-logs` | Buat log baru beserta line items (Atomik DB) | JSON Body Log & Items | `201 Created`: `{ success: true, id: 101, data: ... }` |
| `DELETE`| `/api/daily-logs/[id]` | Hapus log header beserta seluruh line items | Path `id` | `200 OK`: `{ success: true }` |
| `GET` | `/api/daily-logs/export` | Ekspor rekapitulasi log ke CSV (Filter aktif) | `?startDate=&endDate=` | `200 OK`: File stream `daily-logs-*.csv` |
| `GET` | `/api/gym-sessions` | Ambil preset latihan gym Steve Magness | - | `200 OK`: `{ success: true, sessions: { GYM_A, ... } }` |

---

## 11. Status Fitur & Batasan Sistem Saat Ini

Untuk menjaga transparansi pengembangan:
- ✅ **Sudah Berfungsi Penuh**: Core MCP Server (37 tools), 16 AI Skills, Pure Engine (94 unit tests), migrasi skema Neon DB, seluruh REST API routes di atas, Today Cockpit, Bulking Studio, McGill Timer, CSV Export, dan Onboarding Sync.
- 🟡 **Dalam Penyempurnaan**: Halaman `/planner`, `/lab`, dan `/race` di frontend saat ini masih menyajikan visualisasi data terarah; endpoint batch publish 7 hari ke kalender Intervals.icu via Web UI sedang dipersiapkan.
- ℹ️ **Pencatatan Beban Gym**: Tombol quick-log sesi gym mencatat set gerakan sebagai `GYM_SET` dengan beban acuan; pelacakan beban per set secara dinamis per repetisi dapat diperinci melalui modal log kustom.

---

## 12. Troubleshooting & Pemecahan Masalah

### 1. Error: `[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: esbuild`
- **Penyebab**: Kebijakan keamanan baru pada pnpm v10/v11 yang memerlukan persetujuan eksplisit untuk dependency build script.
- **Solusi**: Jalankan perintah berikut di direktori `web`:
  ```bash
  cd web && pnpm approve-builds esbuild
  ```

### 2. Error: `DATABASE_URL wajib diisi di environment variable`
- **Penyebab**: Berkas `web/.env.local` belum dibuat atau variabel `DATABASE_URL` kosong.
- **Solusi**: Pastikan berkas `web/.env.local` telah dibuat dari template `web/.env.example` dan memuat connection string PostgreSQL Neon Anda dengan parameter `?sslmode=require`.

### 3. Tanggal Log Tidak Sesuai Jam Kerja Jakarta
- **Solusi**: Sistem menggunakan fungsi waktu standar `todayJakarta()` yang mengunci zona waktu `Asia/Jakarta` (UTC+7) secara deterministik pada browser maupun serverless runtime, sehingga tidak terpengaruh perbedaan zona waktu server cloud.

### 4. Perubahan Kode TypeScript MCP Server Tidak Muncul di Client AI
- **Solusi**: Setelah mengubah file di `src/`, Anda wajib menjalankan `pnpm run build` di root folder agar file output kompilasi `dist/index.js` diperbarui, lalu restart sesi AI Assistant Anda.

---

*Terakhir diperbarui: 13 November 2026 · Versi 2.1.0 Daily Athlete OS.*
