# AI AGENT SYSTEM RULES & PROJECT CONTEXT (AGENTS.md)
<!-- 
================================================================================
🤖 INSTRUKSI UNTUK AI CODING AGENT (PANDUAN OPERASIONAL & PERATURAN SISTEM):
1. FILE INI ADALAH ATURAN UTAMA (RULES OF ENGAGEMENT) UNTUK ANDA SEBAGAI AGENT:
   - Sebelum menulis atau memodifikasi kode apapun di repositori Daily Athlete OS (`intervals-icu-mcp`), BACA seluruh aturan di dokumen ini.
   - Jangan pernah melanggar aturan arsitektur & fisiologis bertanda ❌ di Bab 3.
   - Patuhi konvensi penamaan di Bab 10 dan urutan pengerjaan di Bab 11.
   - Setiap fitur yang selesai WAJIB diuji secara mandiri (`pnpm test` & `pnpm run build`) sebelum lanjut ke tahap berikutnya.

2. MODE ASESMEN AGENT (SELF-AUDIT SEBELUM MENYELESAIKAN TUGAS):
   - Gunakan Checklist di Bab 9 untuk memverifikasi apakah semua kriteria wajib telah terpenuhi.
   - Pastikan tidak ada secrets, `INTERVALS_API_KEY`, connection string, atau URL yang di-hardcode di kode program.
================================================================================
-->

# AGENTS.md — Daily Athlete OS (`intervals-icu-mcp` Web PWA & AI Coach)
### Panduan Arsitektur, Kontrak Teknis, dan Batasan Sistem untuk AI Agent

---

## 🎯 1. Konteks Proyek & Ringkasan Teknis

**Daily Athlete OS (`intervals-icu-mcp`)** adalah sistem operasi harian atlet endurance dan *hybrid clean bulking* yang dibangun dengan spesifikasi teknis berikut:
- **Tujuan Sistem**: Mengintegrasikan telemetri olahraga **Intervals.icu**, metodologi lari **Norwegian Singles Training Method**, protokol kekuatan **Steve Magness & McGill Big 3**, serta kalkulasi **Clean Bulking Dinamis** (61–64 kg $\rightarrow$ 66–68 kg) ke dalam **MCP Server (37 Tools)** dan **Progressive Web App (PWA)**.
- **Arsitektur Utama**: Modular Monolith dengan Shared Pure Physiology & Nutrition Engine (`src/utils/*.ts`) yang melayani dua antarmuka: **MCP Stdio Server** dan **REST API + Next.js PWA**.
- **Backend & Engine Stack**: TypeScript `^5.7.2` (Strict ES2022, NodeNext ESM), Node.js `>=18.0.0`, `@modelcontextprotocol/sdk` `^1.30.0`, `zod` `^4.4.3`, `vitest` `^4.1.10`.
- **Database Engine**: Hybrid — Cloud Telemetry di **Intervals.icu REST API** + Transactional Relational DB (**SQL Server / PostgreSQL / SQLite** via `/Database/schema.sql`).
- **Frontend Presentation**: Progressive Web App (Next.js App Router + React 19 + Tailwind CSS Dark Sport UI + Service Worker `manifest.json`).
- **Protokol Komunikasi**: JSON-RPC 2.0 via `stdio` (MCP) & HTTP REST API JSON (Web PWA).
- **Target Deadline / Batasan Waktu**: Core Engine & MCP Server: Selesai (100%) | Web PWA & Database Layer: 5 Hari Kerja.

> ⚠️ **Prioritas Eksekusi**: Selesaikan seluruh fitur **WAJIB (Must-Have)** dan pastikan seluruh 94 unit tests tetap hijau (`pnpm test`) sebelum mengerjakan fitur nilai plus / opsional.

---

## 📁 2. Struktur Direktori Repositori (Monorepo)

```
intervals-icu-mcp/
├── src/                                  ← Core MCP Server & Shared Pure Engine
│   ├── tools/                            ← 10 Modul MCP Tool Handlers (37 Tools)
│   ├── utils/                            ← 10 Pure Calculators (`bulking.ts`, `nsa.ts`, `plan.ts`, dll.)
│   ├── client.ts                         ← Intervals.icu HTTP Client (Basic Auth + 429 Retry)
│   ├── config.ts                         ← Environment Variable Reader
│   ├── index.ts                          ← Entry Point MCP Stdio Server
│   └── types.ts                          ← Standard MCP Tool Result Wrappers
├── web/                                  ← Aplikasi Web PWA & REST Services (Daily Athlete OS)
│   ├── MasterService/                    ← Layanan Master Profil Atlet & Sync Telemetri (Port: 5001)
│   ├── TransactionService/               ← Layanan Transaksi Log Bulking, Gym & Planner (Port: 5002)
│   └── FrontEndPWA/                      ← Presentation UI PWA (Port: 3000 / 5000)
├── Database/                             ← Database Setup Scripts
│   ├── schema.sql                        ← WAJIB: DDL tabel, constraints & seed data atlet `i655618`
│   └── *.sql                             ← File skrip SQL per Stored Procedure / View
├── .agents/                              ← Konfigurasi AI Agent & 16 Slash Command Skills
│   ├── rules/                            ← Guardrails Norwegian Singles & Project Context
│   └── skills/                           ← 16 Skills (`/bulk-plan`, `/plan-week`, `/readiness-check`, dll.)
├── docs/                                 ← Dokumentasi Lengkap
│   ├── PRD.md                            ← Product Requirements Document (Daily Athlete OS)
│   ├── ARCHITECTURE.md                   ← Desain Arsitektur, ERD & Sequence Flows
│   ├── PROGRESS.md                       ← Pelacak Progres Pelaksanaan
│   └── WORKFLOWS-GUIDE.md                ← Panduan Alur Kronologis 14 Slash Commands
├── AGENTS.md                             ← File panduan aturan sistem ini
├── GUIDE.md                              ← Panduan instalasi & penggunaan MCP + Skills
└── README.md                             ← Dokumentasi utama repositori
```

---

## 📐 3. Aturan Arsitektur & Fisiologis yang TIDAK BOLEH Dilanggar (Hard Boundaries)

### A. Aturan Basis Data (Database Boundaries)
- ❌ **Dilarang** mengubah, menghapus, atau mengganti nama kolom/tabel (`ATHLETE_MASTER`, `DAILY_LOG_HEADER`, `DAILY_LOG_ITEM`) yang telah ditentukan dalam spesifikasi skema.
- ❌ **Dilarang** melakukan query lintas domain secara langsung tanpa melalui kontrak service/repository yang ditentukan.
- ✅ Boleh menambahkan Stored Procedure, View, Index, atau Function untuk optimasi performa.
- ✅ Setiap Stored Procedure / View baru **WAJIB** disimpan sebagai file `.sql` terpisah di folder `/Database/`.
- ✅ Operasi penghapusan data induk (`DAILY_LOG_HEADER`) yang memiliki data anak (`DAILY_LOG_ITEM`) **WAJIB** menggunakan Database Transaction atomik (`BEGIN TRANSACTION ... COMMIT`).

### B. Batasan Lapisan Frontend, Pure Engine & Service (Presentation Boundary)
- ❌ **Dilarang keras** menghitung rumus fisiologis (VDOT, matriks NSA, ACWR, Readiness, Cardiac Drift) maupun nominal nutrisi (BMR, TDEE, Subtotal Kalori/Protein, Grand Total Kalori, rasio $W/kg$) di JavaScript/Frontend browser!
- ❌ **Dilarang keras** mengakses koneksi basis data atau memanggil API Intervals.icu dengan `INTERVALS_API_KEY` langsung dari layer antarmuka (Frontend Browser).
- ✅ Seluruh perhitungan matematis **WAJIB** memanggil fungsi murni di `src/utils/*.ts` dari sisi Backend Service layer.
- ✅ Semua import lokal pada proyek TypeScript ESM (`"type": "module"`) **WAJIB** berakhiran ekstensi `.js` (contoh: `import { calculateBulkingPlan } from "../utils/bulking.js";`).

### C. Batasan Metodologi Norwegian Singles & Steve Magness (Physiological Guardrails)
- ❌ **Dilarang** menyarankan latihan interval di atas ambang laktat kedua (LT2 / > 95% CP / VO₂max / Anaerobic Repeats) dalam jadwal mingguan normal.
- ❌ **Dilarang** melampaui plafon waktu kerja Sub-Threshold (maksimal **20–25%** dari total durasi mingguan, dan maksimal **40–50 menit** per sesi tunggal).
- ❌ **Dilarang** menjadwalkan latihan beban kaki hingga *failure* (squat/leg extension volume tinggi) atau menjadwalkan beban kaki di hari Sabtu (`GYM_C` wajib **0 beban kaki** demi melindungi Long Run Minggu).

### D. Manajemen Konfigurasi & Kredensial (Configuration Security)
- ❌ **Dilarang keras** menulis hardcoded `INTERVALS_API_KEY`, connection string database, JWT secret, atau port URL di kode program!
- ✅ Seluruh konfigurasi sensitif **WAJIB** ditempatkan di `.env` atau `appsettings.json` dan dibaca melalui `src/config.ts`.

---

## 🗄️ 4. Skema Database Referensi (`/Database/schema.sql`)

```sql
-- 1. TABEL MASTER PROFIL ATLET
CREATE TABLE ATHLETE_MASTER (
    ATHLETE_ID          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    INTERVALS_ID        VARCHAR(20) NOT NULL UNIQUE,
    FULL_NAME           VARCHAR(100) NOT NULL,
    HEIGHT_CM           INT NOT NULL DEFAULT 180,
    BASELINE_WEIGHT_KG  DECIMAL(5,2) NOT NULL DEFAULT 63.00,
    TARGET_WEIGHT_KG    DECIMAL(5,2) NOT NULL DEFAULT 67.00,
    CRITICAL_POWER_W    INT NOT NULL DEFAULT 241,
    LTHR_BPM            INT NOT NULL DEFAULT 179,
    MAX_HR_BPM          INT NOT NULL DEFAULT 204
);

-- 2. TABEL TRANSAKSI INDUK LOG NUTRISI & LATIHAN HARIAN (HEADER)
CREATE TABLE DAILY_LOG_HEADER (
    LOG_ID              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    LOG_NO              VARCHAR(20) NOT NULL UNIQUE,
    LOG_DATE            DATETIME NOT NULL,
    ATHLETE_ID          INT NOT NULL,
    DAY_TYPE            VARCHAR(20) NOT NULL, -- REST | EASY_RUN | QUALITY_SUB_T | LONG_RUN
    GYM_SESSION_CODE    VARCHAR(10) NOT NULL DEFAULT 'NONE', -- NONE | GYM_A | GYM_B | GYM_C
    MORNING_WEIGHT_KG   DECIMAL(5,2) NOT NULL,
    RUNNING_BURN_KCAL   INT NOT NULL DEFAULT 0,
    TARGET_SURPLUS_KCAL INT NOT NULL DEFAULT 400,
    REMARKS             VARCHAR(500) NULL,
    CONSTRAINT FK_DAILY_LOG_ATHLETE FOREIGN KEY (ATHLETE_ID)
        REFERENCES ATHLETE_MASTER(ATHLETE_ID)
);

-- 3. TABEL DETAIL ITEM MAKANAN / LIQUID BOOSTER / SET GYM (LINE ITEMS)
CREATE TABLE DAILY_LOG_ITEM (
    ITEM_ID             INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    LOG_ID              INT NOT NULL,
    ITEM_CATEGORY       VARCHAR(30) NOT NULL, -- MEAL_SOLID | LIQUID_BOOSTER | GYM_SET
    ITEM_NAME           VARCHAR(100) NOT NULL,
    QUANTITY            INT NOT NULL CHECK (QUANTITY > 0),
    UNIT_KCAL_OR_LOAD   DECIMAL(18,2) NOT NULL CHECK (UNIT_KCAL_OR_LOAD > 0),
    PROTEIN_GRAMS       DECIMAL(8,2) NOT NULL DEFAULT 0 CHECK (PROTEIN_GRAMS >= 0),
    CONSTRAINT FK_ITEM_DAILY_LOG FOREIGN KEY (LOG_ID)
        REFERENCES DAILY_LOG_HEADER(LOG_ID)
);
```

> **Aturan Komputasi Nilai Server-Side**:
> - `Subtotal Kalori = QUANTITY * UNIT_KCAL_OR_LOAD`
> - `Subtotal Protein = QUANTITY * PROTEIN_GRAMS`
> - `Grand Total Kalori = SUM(Subtotal Kalori seluruh line items)`
> - `Target Kalori Dinamis = Baseline Office TDEE + RUNNING_BURN_KCAL + Gym Burn + TARGET_SURPLUS_KCAL` (dihitung via `calculateBulkingPlan` di `src/utils/bulking.ts`).

---

## 🔌 5. Kontrak API Minimum (REST API & MCP Tools Contracts)

### A. `AthleteMasterService` — `http://localhost:5001`
| HTTP Method | Endpoint | Deskripsi Fungsi | Payload / Query | Response Code & Output |
|-------------|----------|------------------|-----------------|------------------------|
| `GET` | `/api/athletes` | Ambil semua profil atlet | - | `200 OK`: `[{ "athleteId": 1, "intervalsId": "i655618", "fullName": "FadhilAlif", ... }]` |
| `GET` | `/api/athletes/{id}` | Ambil profil atlet + zona latihan | Path `id` | `200 OK` / `404 Not Found` |
| `GET` | `/api/telemetry/readiness` | Ambil skor kesiapan harian (0-100%) | `?date=YYYY-MM-DD` | `200 OK`: `{ "readinessScore": 86, "status": "GREEN", ... }` |

### B. `BulkingAndTrainingService` — `http://localhost:5002`
| HTTP Method | Endpoint | Deskripsi Fungsi | Payload / Query | Response Code & Output |
|-------------|----------|------------------|-----------------|------------------------|
| `GET` | `/api/daily-logs` | Daftar log harian + filter | `?keyword=&startDate=&endDate=` | `200 OK`: List log + Grand Total Kalori/Protein & Target |
| `GET` | `/api/daily-logs/{id}`| Detail log harian + line items | Path `id` | `200 OK`: Header + Items array + Hasil `calculateBulkingPlan` |
| `POST` | `/api/daily-logs` | Buat log nutrisi/gym baru | JSON Body | `201 Created`: `{ "success": true, "id": 101 }` |
| `PUT` | `/api/daily-logs/{id}` | Perbarui log harian & items | JSON Body | `200 OK`: `{ "success": true }` |
| `DELETE` | `/api/daily-logs/{id}` | Hapus log harian secara atomik | Path `id` | `200 OK`: `{ "success": true }` |
| `GET` | `/api/daily-logs/export` | Ekspor laporan ke Excel/CSV | `?keyword=&startDate=&endDate=` | `200 OK`: Binary Stream (`.xlsx` / `.csv`) |
| `POST` | `/api/planner/publish` | Generate & publish jadwal 7 hari ke Intervals.icu | JSON Body (`startDateMonday`, `targetHours`) | `200 OK`: Daftar event yang berhasil dibuat di Intervals.icu |

#### Format Standard Error Response (Wajib Konsisten)
```json
{
  "success": false,
  "message": "Pesan ringkas kegagalan validasi",
  "errors": [
    "Detail error spesifik 1",
    "Detail error spesifik 2"
  ]
}
```

---

## ✅ 6. Aturan Bisnis Inti (Business Rules)

AI Agent **WAJIB** menerapkan validasi aturan bisnis berikut pada Service & Pure Engine Layer:

| Kode Rule | Pernyataan Aturan | Perilaku Jika Dilanggar |
|-----------|-------------------|-------------------------|
| **BR-01** | Nomor dokumen log (`LOG_NO` / tanggal per atlet) tidak boleh duplikat di DB | Return HTTP `400 Bad Request` / `409 Conflict` |
| **BR-02** | Tanggal log harian tidak boleh lebih besar dari hari ini (`<= TODAY`) | Return HTTP `400 Bad Request` |
| **BR-03** | Transaksi log harian wajib memiliki minimal 1 (satu) line item makanan/latihan | Return HTTP `400 Bad Request` |
| **BR-04** | Nilai Kuantitas (`QUANTITY`) wajib bilangan bulat > 0 | Return HTTP `400 Bad Request` |
| **BR-05** | Nilai Kalori/Beban (`UNIT_KCAL_OR_LOAD`) wajib angka positif > 0 | Return HTTP `400 Bad Request` |
| **BR-06** | `ATHLETE_ID` wajib valid dan terdaftar di tabel `ATHLETE_MASTER` | Return HTTP `400 Bad Request` |
| **BR-07** | Subtotal Kalori (`Qty * Kcal`) dan Protein (`Qty * Protein`) dihitung di server | Nilai dihitung runtime di Backend |
| **BR-08** | Grand Total Kalori Masuk & Target Kalori Dinamis (`calculateBulkingPlan`) dihitung di server | Nilai dihitung runtime di Backend |
| **BR-09** | Hapus log harian: Hapus `DAILY_LOG_ITEM` terlebih dahulu, lalu `DAILY_LOG_HEADER` dalam 1 transaksi DB | Rollback penuh jika ada langkah yang gagal |
| **BR-10** | Ekspor file hanya memproses data yang sesuai dengan filter pencarian & tanggal aktif | Query ekspor memakai parameter filter yang sama |
| **BR-11** | Dialog konfirmasi hapus pada UI wajib memuat nomor dokumen (`LOG_NO`) secara dinamis | Render `LOG_NO` spesifik di modal pop-up |
| **BR-12** | Jadwal lari mingguan wajib mematuhi rasio durasi 75/25 NSA dan plafon Sub-T $\le 50$ menit/sesi | Validasi via `generateWeeklyPlan` & `validateWorkoutDsl` |

---

## 🏗️ 7. Pola Desain Internal Layanan (Layered Pattern)

Setiap backend service dan modul MCP **WAJIB** mengikuti arsitektur berlapis:

```
[HTTP Request / MCP Call]
      │
      ▼
Controller / Tool Handler Layer ──► Validasi Zod Schema / DTO, panggil Service, return HTTP/MCP Result
      │
      ▼
Service & Pure Engine Layer     ──► Validasi BR-01..BR-12, panggil `src/utils/*.ts`, kelola transaksi
      │
      ▼
Repository / Client Layer       ──► Eksekusi SQL Transaction ke DB atau HTTP Request via `src/client.ts`
      │
      ▼
Storage / Cloud API             ──► Relational DB (`DailyAthleteOS_DB`) & Intervals.icu API
```

---

## 📦 8. Dependensi & Paket Library yang Diizinkan

| Kategori | Nama Paket / Library | Kegunaan |
|----------|----------------------|----------|
| Protocol & AI SDK | `@modelcontextprotocol/sdk` (`^1.30.0`) | Server MCP stdio & registrasi 37 tools |
| Schema Validation | `zod` (`^4.4.3`) | Validasi input boundary & DTO |
| Testing Framework | `vitest` (`^4.1.10`) | Unit test suite untuk pure engine & tools |
| Web & PWA UI | `next`, `react`, `tailwindcss` | Dashboard PWA Daily Athlete OS |
| Data Access & Export | `mssql` / `pg` / `better-sqlite3`, `exceljs` / `csv-stringify` | Konektivitas DB & ekspor laporan `.xlsx` / `.csv` |

---

## 📋 9. Checklist Deliverables & Kriteria Penyerahan

### Deliverables Wajib
- [x] Shared Pure Physiology & Bulking Engine (`src/utils/*.ts`) lulus 94 unit tests (`pnpm test`).
- [x] MCP Server (`src/index.ts`) berfungsi penuh dengan 37 MCP tools dan 16 Agent Skills.
- [x] Panduan penggunaan lengkap tersedia di `README.md`, `GUIDE.md`, dan `docs/WORKFLOWS-GUIDE.md`.
- [ ] File `/Database/schema.sql` siap dieksekusi clean dari nol (mencakup seed data profil `FadhilAlif`).
- [ ] `AthleteMasterService` dan `BulkingAndTrainingService` berfungsi penuh dengan seluruh endpoint CRUD, Planner Sync, dan Export.
- [ ] Antarmuka Web PWA terhubung ke backend dan menampilkan 5 modul utama secara akurat.

### Deliverables Nilai Plus (Advanced)
- [x] Auto-retry *exponential backoff + jitter* untuk HTTP 429 (`src/utils/retry.ts`).
- [x] In-memory TTL cache untuk optimasi kuota API (`src/utils/cache.ts`).
- [ ] Proteksi endpoint dengan autentikasi `X-Api-Key` middleware.
- [ ] Fitur *Offline PWA Pocket Card* dan *Built-in 7s McGill Big 3 Timer*.

---

## 🔑 10. Konvensi Penamaan & Standar Kode

| Elemen Pemrograman | Konvensi Standar | Contoh Penggunaan |
|--------------------|------------------|-------------------|
| Class / Interface / Type | PascalCase | `BulkingPlanResult`, `PlannedSessionItem`, `InMemoryCache` |
| Fungsi & Method (TypeScript) | camelCase | `calculateBulkingPlan`, `generateWeeklyPlan`, `analyzeCardiacDrift` |
| Variabel Lokal & Parameter | camelCase | `weightKg`, `criticalPowerWatts`, `targetIntakeKcal` |
| MCP Tool Names | snake_case | `calculate_bulking_plan`, `create_running_workout` |
| Agent Skill Folders & Slash | lowercase kebab-case | `bulk-plan` (`/bulk-plan`), `readiness-check` (`/readiness-check`) |
| Skrip & Tabel Database SQL | UPPER_SNAKE_CASE / snake_case | `ATHLETE_MASTER`, `DAILY_LOG_HEADER`, `schema.sql` |
| Route Endpoint REST | lowercase kebab-case / plural | `/api/athletes`, `/api/daily-logs`, `/api/daily-logs/export` |

---

## 🚦 11. Urutan Implementasi yang Direkomendasikan (Step-by-Step)

```
Langkah 1: [SELESAI 🟢] Pure Physiology & Bulking Engine (`src/utils/*.ts` + 94 Unit Tests)
Langkah 2: [SELESAI 🟢] MCP Server (37 Tools) & 16 Agent Skills (`/bulk-plan`, `/plan-week`, dll.)
Langkah 3: Setup Database & `/Database/schema.sql` (Tabel Master Atlet, Log Header, & Log Item)
Langkah 4: Service Master & Telemetry (`GET /api/athletes`, `GET /api/telemetry/readiness`)
Langkah 5: Service Transaksi Bulking & Gym - Repository & Atomic SQL Transactions
Langkah 6: Service Transaksi Bulking & Gym - Integrasi `calculateBulkingPlan` & Validasi BR-01..12
Langkah 7: Fitur Export Laporan (`.xlsx` / `.csv`) & Endpoint Batch Publish ke Intervals.icu
Langkah 8: FrontEnd PWA - Halaman `Today Cockpit` & Tabel Riwayat Log Harian
Langkah 9: FrontEnd PWA - Form Tambah/Edit Log Bulking, Studio Gym A/B/C & Timer McGill 7s
Langkah 10: Security Middleware (`X-Api-Key`) & PWA Service Worker (`manifest.json`)
Langkah 11: Final Audit End-to-End & Sinkronisasi Dokumentasi
```

---

## 📚 12. Tautan Dokumen Referensi Proyek

- [`docs/PRD.md`](docs/PRD.md) — Dokumen Kebutuhan Produk & Aturan Fungsional Lengkap
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Diagram Arsitektur, ERD, dan Sequence Flows
- [`docs/PROGRESS.md`](docs/PROGRESS.md) — Lembar Tracking Progres & Checklist Fase
- [`GUIDE.md`](GUIDE.md) — Panduan Operasional MCP Server, 37 Tools, dan 14 Slash Commands
- [`docs/ATHLETE-PROFILE-FADHIL.md`](docs/ATHLETE-PROFILE-FADHIL.md) — Profil Fisiologis & Antropometri Atlet (`FadhilAlif`)
