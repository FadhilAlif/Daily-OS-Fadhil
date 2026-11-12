# PRODUCT REQUIREMENTS DOCUMENT (PRD)
<!-- 
================================================================================
🤖 INSTRUKSI UNTUK AI AGENT (PANDUAN OPERASIONAL):
1. MODE PEMBUATAN DOKUMEN (GENERATION):
   - Dokumen ini adalah spesifikasi produk utama untuk pengembangan Daily Athlete OS (PWA + MCP Ecosystem).
   - Patuhi seluruh kode aturan bisnis (BR-01 s/d BR-12) secara ketat pada Backend & Pure Engine layer.
   - Setiap fitur fungsional wajib mengacu pada sumber data, validasi, dan komponen UI yang didefinisikan di Bab 5.

2. MODE PENILAIAN / ASESMEN (ASSESSMENT):
   - Gunakan Bagian 9 (Rubrik Asesmen AI) di bagian bawah dokumen untuk mengevaluasi kelengkapan implementasi terhadap PRD ini.
================================================================================
-->

## Daily Athlete OS (`intervals-icu-mcp` Web PWA & AI Coach Ecosystem)
### Sistem Operasi Harian Pelari Endurance & Hybrid Bulking Berbasis Norwegian Singles Training Method

| Metadata Dokumen | Nilai |
|------------------|-------|
| **Versi** | 1.0 |
| **Tanggal Terbit** | 2026-11-12 |
| **Status** | Active / Approved for Implementation |
| **Penulis / Pemilik** | FadhilAlif (`i655618`) & AI Solution Architect |
| **Target Release / Deadline** | Fase Core Engine & MCP: Selesai (100%) \| Fase Web PWA MVP: 5 Hari Kerja |

---

## 1. Latar Belakang & Masalah Bisnis

### 1.1 Latar Belakang
Atlet endurance modern yang menjalani rutinitas latihan **Norwegian Singles Training Method** sambil bekerja penuh waktu di Jakarta (*Office Hours* 08:00–18:00 WIB maupun sistem *Shifting 12 Jam*) menghadapi tiga friksi operasional setiap hari:
1. **Beban Kognitif Dashboard Kompleks di Pagi Subuh**: Antarmuka web Intervals.icu dirancang untuk analisis layar besar, bukan untuk pengambilan keputusan cepat dalam 5 detik saat bangun tidur pukul 04:45 WIB (mengecek skor kesiapan *Readiness*, batas aman *Red Flags*, dan target Watt lari hari itu).
2. **Kegagalan Sinkronisasi Kalori Lari terhadap Target *Clean Bulking***: Pada postur **180 cm / 61–64 kg** dengan target naik ke **66–68 kg** (*lean muscle hypertrophy*), sesi lari membakar 450–950 kkal per sesi. Kalkulator nutrisi konvensional menggunakan TDEE statis tanpa menarik data pembakaran energi aktual (`icu_joules` / kalori aktif) dari Intervals.icu, menyebabkan atlet terus-menerus jatuh ke kondisi defisit kalori.
3. **Risiko *Interference Effect* & DOMS Kaki di Gym**: Aplikasi pencatat gym umum mendorong latihan kaki volume tinggi hingga *failure* yang merusak kualitas sesi lari *Sub-Threshold* (LT2). Atlet membutuhkan panduan gym terintegrasi yang memisahkan **Upper-Body Hypertrophy** (Dada, Punggung, Bahu, Lengan) dari **Lower-Body Neural & Spinal Stability** (Steve Magness 3–5 reps + timer isometrik *McGill Big 3*).

### 1.2 Pendekatan Solusi
Membangun **Daily Athlete OS** sebagai **Progressive Web App (PWA)** *mobile-first* yang berbagi satu **Shared Pure Physiology & Nutrition Engine (`src/utils/*.ts`)** dengan server **Model Context Protocol (MCP)** (`intervals-icu-mcp`). Seluruh perhitungan fisiologis (VDOT, matriks NSA, ACWR, Readiness, Cardiac Drift, BMR/TDEE/Makro, dan rasio *Power-to-Weight*) dieksekusi secara deterministik di sisi server/engine, sementara antarmuka PWA menyediakan pengalaman visual instan, *offline-capable* (untuk sesi di dalam gym dan garis start lomba), serta sinkronisasi dua arah ke kalender **Intervals.icu** dan jam tangan **Garmin Forerunner 165**.

---

## 2. Tujuan Produk & Indikator Keberhasilan

| Kode | Tujuan Produk (Goal) | Deskripsi | Indikator Keberhasilan (Success Metric / KPI) |
|------|----------------------|-----------|------------------------------------------------|
| **G-01** | **5-Second Morning Cockpit** | Menyajikan skor kesiapan harian (*Readiness*), status 5 *Red Flags*, dan target Watt/HR lari hari ini dalam satu layar ringkas. | Waktu muat layar utama < 1.5 detik; atlet dapat menentukan status latihan (*Go / Modify / Rest*) dalam < 5 detik. |
| **G-02** | **Dynamic Clean Bulking Synchronization** | Menghitung target kalori dan makronutrisi harian secara otomatis berdasarkan BMR + NEAT kantor + kalori lari aktual/terjadwal dari Intervals.icu. | Laju kenaikan berat badan terkendali di koridor **+0.25 s.d. +0.35 kg/minggu** menuju **66–68 kg** dengan rasio *Power-to-Weight* ($\ge 3.83\text{ W/kg}$) tetap terjaga. |
| **G-03** | **Zero-DOMS Hybrid Gym Studio** | Memandu eksekusi sesi Gym A (Push + Neural), Gym B (Pull + Pelvic), dan Gym C (Upper Pump) lengkap dengan timer isometrik *McGill Big 3*. | 0 insiden kegagalan sesi lari Sub-Threshold akibat DOMS kaki; 100% kepatuhan jeda $\ge 6$ jam antara lari pagi dan gym malam. |
| **G-04** | **1-Click Weekly NSA & Bulking Publisher** | Merancang jadwal 7 hari (`E-Q-E-Q-E-Q-LR` + 3 sesi Gym + 7 target kalori) dengan rasio durasi 75/25 dan menerbitkannya satu-klik ke Intervals.icu. | Pembuatan dan publikasi jadwal 1 pekan penuh selesai dalam < 30 detik dengan validasi Teks DSL 100% bebas error. |
| **G-05** | **Post-Run LT2 Auditor & Offline Race Center** | Mengevaluasi kepatuhan daya LT2 (85–95% CP), *Aerobic Decoupling* (< 5%), dan menyediakan kartu strategi *Race Day* yang dapat diakses tanpa sinyal internet. | Evaluasi pasca-lari selesai < 10 detik; kartu *Race Fueling & Pacing* tetap terbuka 100% saat mode pesawat (*offline*). |

---

## 3. Pengguna Target & Persona

| Role Pengguna | Deskripsi Tanggung Jawab | Kebutuhan Utama pada Sistem | Hak Akses |
|---------------|--------------------------|-----------------------------|-----------|
| **Hybrid Endurance Athlete (`FadhilAlif`)** | Menjalankan program lari *Norwegian Singles* pagi hari, bekerja kantor di Jakarta, mengejar surplus kalori harian, dan berlatih beban di gym. | Cek *Readiness* subuh, checklist 5 waktu makan + *Liquid Booster*, pencatatan beban gym & timer *McGill Big 3*, serta *1-click sync* ke Garmin/Intervals.icu. | Read, Create, Update, Delete, Publish/Sync, Export |
| **AI Running & Strength Coach (Antigravity / MCP Client)** | Membaca telemetri aktivitas dan wellness atlet melalui protokol MCP untuk memberikan analisis dan rekomendasi taktis. | Akses ke 37 MCP Tools deterministik, pembacaan histori beban latihan (CTL/ATL/TSB), serta penulisan workout/note ke kalender. | Read Telemetry, Execute Pure Calculators, Create/Update Calendar Events |

---

## 4. Ruang Lingkup Proyek (Scope)

### 4.1 Dalam Ruang Lingkup (In-Scope)
- [x] **Shared Pure Physiology & Nutrition Engine (`src/utils/*.ts`)**: 10 modul kalkulasi murni (VDOT, NSA Matrix, Training Load/ACWR, Readiness Score, Cardiac Drift, Weekly Plan Builder, DSL Validator, Race Predictor/Taper, Race Fueling, dan Bulking Planner) dengan 94 unit tests.
- [x] **MCP Server (`src/index.ts` & `src/tools/*.ts`)**: 37 MCP tools dan 16 Agent Skills (`.agents/skills/*`).
- [ ] **Modul 1 PWA — `Today Cockpit` (Home Dashboard)**: *Readiness Gauge* (0–100%), *5 Red Flags Toggle*, *Today's Planned Workout Card* (dengan *Tropical Heat Badge*), dan *Dynamic Calorie & 5-Meal Checklist*.
- [ ] **Modul 2 PWA — `Hybrid Bulking & Gym Studio`**: Grafik tren berat badan (*7-Day Moving Average* vs koridor 66–68 kg), *Power-to-Weight ($W/kg$) Guardrail Gauge*, *Interactive Gym Session Logger* (`GYM_A`, `GYM_B`, `GYM_C`), dan *Built-in 7s Isometric Timer* untuk *McGill Big 3*.
- [ ] **Modul 3 PWA — `Weekly Planner & Calendar Sync`**: Form generator jadwal mingguan (5–9 jam, preset Sub-T, mode *Office Hours* vs *Shift*), tabel pratinjau 7 hari, dan tombol *Batch Publish* ke Intervals.icu.
- [ ] **Modul 4 PWA — `Norwegian Singles Lab & Post-Run Auditor`**: Meteran rasio durasi 75/25, analisis *Aerobic Decoupling* ($H_1$ vs $H_2$), kalkulator matriks NSA interaktif, dan form *RPE Self-Report* + ekspor laporan CSV/Excel.
- [ ] **Modul 5 PWA — `Offline Race Command Center`**: Kalkulator prediksi finish & *A-Taper 14 Hari*, serta *Offline Pocket Card* untuk pacing Critical Power dan jadwal *EJ Sport Energy Gel (30g carb)*.
- [ ] **Local/Relational Persistence (`Database/schema.sql`)**: Penyimpanan terstruktur untuk log makanan harian (Header + Line Items) dan catatan progres beban latihan gym (Header + Set Details).

### 4.2 Di Luar Ruang Lingkup (Out-of-Scope)
- ⛔ Sistem manajemen pembayaran berlangganan (*Payment Gateway* / SaaS Billing multi-organisasi).
- ⛔ Aplikasi mobile native murni berbasis Swift (iOS) atau Kotlin (Android) di luar standar PWA.
- ⛔ Koneksi Bluetooth Low Energy (BLE) langsung dari browser ke sensor detak jantung/stride pod (perekaman aktivitas tetap melalui jam tangan Garmin).
- ⛔ Fitur jejaring sosial publik (feed publik, komentar antar-pengguna, atau *leaderboard* komunitas).

---

## 5. Spesifikasi Fungsional

### 5.1 Modul 1: `Today Cockpit` & Daftar Log Harian (Home & Daily Overview)

**Tujuan**: Menampilkan kesiapan fisik pagi hari, target latihan lari/gym hari ini, serta ringkasan pencapaian target kalori dan daftar log harian.

#### A. Komponen Antarmuka (UI Components)
| Komponen UI | Tipe Elemen | Fungsi & Perilaku (Behavior) |
|-------------|-------------|------------------------------|
| **Readiness Ring Gauge** | Radial Progress Card | Menampilkan skor 0–100% (`GREEN` $\ge 80$, `YELLOW` $50\text{–}79$, `RED` $< 50$) beserta rincian poin TSB, ACWR, dan Wellness. |
| **5 Red Flags Checklist** | Interactive Toggle Group | Memeriksa 5 sinyal kelelahan (termasuk *Flag 5: Nyeri Muskuloskeletal*). Jika $\ge 2$ aktif atau Flag 5 aktif, tampilkan rekomendasi *Adaptive Deload* / *Cross-Training*. |
| **Today's Workout Card** | Summary Card | Menampilkan sesi terencana dari kalender Intervals.icu (durasi, target Watt, HR ceiling, dan lencana *Tropical Heat Adjustment*). |
| **Dynamic Macro & Calorie Bar** | Stacked Progress Bar | Menampilkan progres kalori masuk vs target dinamis (`Baseline TDEE + Running Burn + Gym Burn + Surplus`) beserta gramasi Protein, Karbo, dan Lemak. |
| **Tabel Riwayat Log Harian** | Data Table / Grid | Menampilkan daftar log nutrisi & latihan harian dengan filter rentang tanggal dan pencarian kata kunci. |
| **Tombol Catat Makan / Gym** | Primary Button | Membuka form pencatatan nutrisi harian atau sesi gym baru. |
| **Tombol Export Laporan** | Secondary Button | Mengunduh data log nutrisi, berat badan, dan kepatuhan latihan yang sedang difilter ke format `.xlsx` / `.csv`. |

#### B. Struktur Kolom Grid Riwayat Harian (Daily Log Grid)
| Nama Kolom UI | Sumber Data (Field/DB) | Tipe Data | Format / Rumus Tampilan |
|---------------|------------------------|-----------|-------------------------|
| **Tanggal** | `DAILY_NUTRITION_LOG.LOG_DATE` | Date | `YYYY-MM-DD` (Contoh: `2026-11-12`) |
| **Tipe Hari** | `DAILY_NUTRITION_LOG.DAY_TYPE` | String (Enum) | Badge (`REST`, `EASY_RUN`, `QUALITY_SUB_T`, `LONG_RUN`) |
| **Berat Pagi (kg)** | `DAILY_NUTRITION_LOG.WEIGHT_KG` | Decimal(5,2) | `63.2 kg` (Sinkron dengan `wellness.weight`) |
| **Kalori Terbakar** | `TOTAL_EXPENDITURE_KCAL` | Integer | Dihitung di server: `Baseline TDEE + Run Burn + Gym Burn` |
| **Target Kalori** | `TARGET_INTAKE_KCAL` | Integer | Dihitung di server: `Total Expenditure + Surplus` |
| **Aktual Masuk** | `SUM(QTY * KCAL_PER_UNIT)` | Integer | Dihitung di server dari seluruh `MEAL_LINE_ITEM` |
| **Total Protein** | `SUM(QTY * PROTEIN_G)` | Decimal(6,1) | Dihitung di server (Format: `138.5 g`) |

---

### 5.2 Modul 2: Form Pencatatan Nutrisi Bulking & Sesi Gym (Create & Edit Mode)

**Tujuan**: Mencatat asupan makanan harian (termasuk *Liquid Calorie Booster*) dan progres angkatan beban gym (`GYM_A`, `GYM_B`, `GYM_C`) secara terukur dan atomik.

#### A. Field Header Form Log Harian
| Nama Field | Tipe Input | Wajib (Mandatory) | Aturan Validasi | Nilai Default / Sumber Opsi |
|------------|------------|-------------------|-----------------|-----------------------------|
| **Nomor Dokumen Log** | Text Input (Readonly/Auto) | Ya | Unik, format `LOG-YYYYMMDD`, maks 20 karakter | Auto-generated berdasarkan tanggal |
| **Tanggal Log** | Date Picker | Ya | Tidak boleh lebih besar dari hari ini (`<= TODAY`) | Tanggal hari ini (`TODAY`) |
| **Profil Atlet** | Dropdown / Select | Ya | ID atlet harus valid di tabel `ATHLETE_MASTER` | Default: `i655618` (`FadhilAlif`) |
| **Tipe Hari Latihan** | Select Dropdown | Ya | Nilai dalam enum (`REST`, `EASY_RUN`, `QUALITY_SUB_T`, `LONG_RUN`) | Otomatis dideteksi dari event Intervals.icu hari itu |
| **Preset Sesi Gym** | Select Dropdown | Tidak | Nilai dalam enum (`NONE`, `GYM_A`, `GYM_B`, `GYM_C`) | Selasa=`GYM_A`, Jumat=`GYM_B`, Sabtu=`GYM_C` |
| **Catatan Fisik / RPE** | Textarea | Tidak | Maks 500 karakter | Kosong |

#### B. Tabel Detail Item Makanan / Latihan (Dynamic Line Items)
| Nama Kolom Item | Tipe Input | Wajib | Validasi & Batasan | Catatan Logika |
|-----------------|------------|-------|--------------------|----------------|
| **Waktu / Kategori** | Select Dropdown | Ya | `PRE_RUN`, `BOOSTER_1`, `LUNCH`, `BOOSTER_2`, `DINNER` | Memastikan struktur 3 Solid + 2 Liquid Boosters |
| **Nama Menu / Gerakan** | Text Input / Preset | Ya | Min 3 karakter, maks 100 karakter | Contoh: `Liquid Shake #1 (UHT+Whey+Oat+PB)` |
| **Jumlah Porsi (`Quantity`)** | Number Input | Ya | Integer / Decimal $> 0$ | Tidak boleh 0 atau negatif |
| **Kalori per Porsi (`Kcal`)** | Number Input | Ya | Integer $> 0$ | Kalori per 1 porsi satuan |
| **Protein per Porsi (`Gram`)**| Number Input | Ya | Decimal $\ge 0$ | Kandungan protein per porsi |
| **Subtotal Kalori & Protein** | Readonly Display | - | Auto-calculate di Backend | **Dihitung di server**: `Quantity * Kcal` dan `Quantity * Protein` |

#### C. Fitur Khusus Modul Gym & Bulking
- **1-Tap Preset Loader**: Tombol *"Muat Template 5-Meal Jakarta"* dan *"Muat Gerakan Gym A/B/C"* untuk mengisi baris item secara otomatis sesuai hasil kalkulasi `calculate_bulking_plan`.
- **Built-in McGill Big 3 Timer**: Widget penghitung waktu mundur **7–8 detik** dengan indikator suara untuk memandu piramida repetisi `6 - 4 - 2` (*Modified Curl-Up*, *Side Bridge*, *Bird-Dog*) dan *Soleus Isometric Hold 30s*.
- **Power-to-Weight Guardrail Banner**: Menampilkan peringatan otomatis jika berat badan naik tetapi estimasi CP belum mengimbangi target rasio `3.83 W/kg`.

---

### 5.3 Modul 3: `Weekly Planner & 1-Click Intervals.icu Sync`

**Tujuan**: Merancang jadwal 1 pekan penuh (`E-Q-E-Q-E-Q-LR` + 3 sesi Gym + 7 Note Kalori) dan mempublikasikannya ke kalender Intervals.icu.

- **Input Parameter**: Tanggal Senin awal pekan (`YYYY-MM-DD`), Target Durasi Mingguan (`5.0` s.d. `9.0` jam), Jumlah Sesi Quality (`2` atau `3`), Preset Q1 & Q2 (`short_3m`, `medium_6m`, `long_10m`, `micro_1m`), serta Hari Puasa opsional.
- **Pratinjau & Guardrail Check**: Menampilkan tabel 7 hari lengkap dengan persentase waktu kerja Sub-Threshold (wajib lulus koridor 20–25% NSA) dan kode Teks DSL Intervals.icu.
- **Aksi Batch Publish**: Mengirimkan seluruh sesi lari (`create_running_workout`), sesi gym (`add_or_update_planned_workout` tipe `WeightTraining`), dan target kalori (`add_or_update_note`) ke API Intervals.icu.

---

### 5.4 Aturan Bisnis Utama (Business Rules)

| Kode Rule | Pernyataan Aturan Bisnis (Rule Statement) | Lapisan Penegakan (Enforcement Layer) | Penanganan Jika Melanggar (Error Response) |
|-----------|------------------------------------------|---------------------------------------|--------------------------------------------|
| **BR-01** | Identifier unik log harian (`LOG_NO` / kombinasi `ATHLETE_ID + LOG_DATE`) tidak boleh duplikat di database. | Backend Service + DB Unique Index | HTTP `400 Bad Request` / `409 Conflict`: "Log untuk tanggal ini sudah terdaftar." |
| **BR-02** | Tanggal pencatatan log aktual (nutrisi/berat badan/RPE) tidak boleh lebih besar dari tanggal hari ini (`<= TODAY`). | Backend Validation Service | HTTP `400 Bad Request`: "Tanggal log aktual tidak boleh di masa depan." |
| **BR-03** | Setiap transaksi log nutrisi/gym yang disimpan wajib memiliki minimal 1 (satu) baris detail item (`MEAL_LINE_ITEM` / `GYM_EXERCISE_DETAIL`). | Backend Service | HTTP `400 Bad Request`: "Minimal satu baris item makanan/latihan wajib diisi." |
| **BR-04** | Nilai kuantitas porsi/set (`QUANTITY`), kalori (`KCAL`), dan beban/durasi wajib bernilai positif ($> 0$). | Backend Service + Zod Schema | HTTP `400 Bad Request`: "Kuantitas dan nilai kalori harus lebih besar dari 0." |
| **BR-05** | **Larangan Kalkulasi Client**: Seluruh perhitungan fisiologis (VDOT, matriks NSA, ACWR, Readiness, Cardiac Drift) dan agregasi nutrisi (BMR, TDEE, Total Kalori, Subtotal, Grand Total Makro, W/kg) **WAJIB** dihitung di Backend / Shared Engine (`src/utils/*.ts`), bukan di JavaScript browser. | Backend Service & Pure Engine Layer | Mencegah manipulasi atau deviasi rumus fisiologis di sisi client. |
| **BR-06** | Penghapusan data log induk (`DAILY_NUTRITION_LOG` atau `GYM_WORKOUT_HEADER`) wajib menghapus baris detail anaknya terlebih dahulu secara atomik dalam satu transaksi database (`BEGIN TRANSACTION ... COMMIT`). | Repository Layer (Database Transaction) | HTTP `500 Internal Server Error` & Rollback penuh jika salah satu langkah gagal. |
| **BR-07** | **Aturan Durasi 75/25 & Plafon Sub-T NSA (§2.4, §6.2)**: Total waktu kerja Sub-Threshold mingguan dibatasi pada koridor 20–25% dari total durasi lari, dan waktu kerja Sub-T per sesi dilarang melebihi 40–50 menit. | `src/utils/plan.ts` & `src/utils/dsl.ts` | Return `guardrailCompliance.isCompliant = false` / HTTP `422 Unprocessable Entity` saat validasi DSL gagal. |
| **BR-08** | **Protokol Iklim Tropis & Dual-Control (§4.2)**: Pada suhu 24–28°C (RH > 75%), sesi Quality dikontrol oleh Power (85–96% CP), sedangkan plafon HR Easy Run diberikan toleransi naik dari 70% menjadi $\le 74\%$ HRmax selama Power tetap $\le 77\%$ CP. | `src/utils/readiness.ts` & Coach Auditor | Status sesi dikategorikan **OK (Tropical/Heat Adjusted)**, bukan pelanggaran zona. |
| **BR-09** | **Aturan Steve Magness ("Hard Days Hard, Easy Days Easy") & DOMS Shield**: Sesi gym yang memuat beban bawah (`GYM_A`, `GYM_B`) hanya boleh dijadwalkan pada hari lari Quality (Selasa & Jumat) dengan jeda $\ge 6$ jam, repetisi kaki $\le 4\text{–}8$ reps tanpa *failure*, dan sesi Sabtu (`GYM_C`) wajib **0 beban kaki**. | `src/utils/bulking.ts` & Planner Service | Menolak penjadwalan *heavy lower-body* pada hari Easy Run, Rest Day, atau H-1 sebelum Long Run. |
| **BR-10** | **Formula Kalori Bulking Dinamis**: `Target Intake = Baseline Office TDEE (BMR * 1.375) + Running Burn + Gym Burn + Clean Surplus (+350 s.d. +450 kkal)`, dengan Protein `2.1 g/kg`, Lemak `1.1 g/kg`, dan Karbohidrat dari sisa kalori. | `src/utils/bulking.ts` | Target kalori otomatis menyesuaikan jenis hari latihan (`REST`, `EASY_RUN`, `QUALITY_SUB_T`, `LONG_RUN`). |
| **BR-11** | Ekspor data laporan (`.xlsx` / `.csv`) hanya memproses record yang sesuai dengan filter pencarian dan rentang tanggal yang sedang aktif di layar. | Backend Export Query Generator | Isi berkas unduhan identik 100% dengan baris yang tampil pada grid UI. |
| **BR-12** | Dialog konfirmasi hapus pada UI wajib menampilkan nomor dokumen (`LOG_NO`) dan tanggal spesifik secara dinamis sebelum mengeksekusi penghapusan. | Frontend Modal Component | Mencegah penghapusan log harian secara tidak sengaja. |

---

## 6. Spesifikasi Non-Fungsional (NFR)

| Dimensi | Parameter | Spesifikasi / Target |
|---------|-----------|----------------------|
| **Teknologi Backend & Engine** | Runtime & Framework | Node.js `>=18.0.0`, TypeScript `^5.7.2` (Strict ESM), `@modelcontextprotocol/sdk` `^1.30.0`, Next.js Route Handlers |
| **Teknologi Frontend (PWA)** | Web Framework | Next.js (App Router) + React 19 + Tailwind CSS (Dark Sport UI) + PWA Service Worker (`manifest.json`) |
| **Penyimpanan Data** | Hybrid Storage | Primary Telemetry: **Intervals.icu Cloud API** \| Transactional Logs: **SQLite / PostgreSQL** (`/Database/schema.sql`) |
| **Protokol Komunikasi** | API & Agent Format | RESTful JSON API via HTTP/HTTPS (Web PWA) & JSON-RPC 2.0 via `stdio` (MCP Server) |
| **Performa & Response Time** | SLA API & Kalkulasi | < 50ms untuk kalkulasi *pure engine* lokal; < 500ms untuk query DB lokal; auto-retry eksponensial untuk rate limit HTTP 429 Intervals.icu |
| **Keamanan (Security)** | Autentikasi & Kredensial | `INTERVALS_API_KEY` terisolasi di server; proteksi endpoint mutasi lokal dengan header `X-Api-Key` / sesi terautentikasi |
| **Integritas Data** | Konsistensi Transaksi | ACID Compliant, Foreign Key constraints, transaksi atomik pada operasi multi-item, validasi schema dengan **Zod `^4.4.3`** |
| **Kualitas Kode & Testing** | Unit Testing | **Vitest `^4.1.10`** — Minimal 94 unit tests lulus 100% pada seluruh modul kalkulasi dan tool handlers |

---

## 7. Ketentuan Deliverables & Struktur Penyerahan

| Item Deliverable | Format / Path | Status Wajib |
|------------------|---------------|--------------|
| **Pure Physiology & Bulking Engine** | `src/utils/*.ts` (10 modul murni + unit tests `*.test.ts`) | **Wajib (Selesai 🟢)** |
| **MCP Server & 37 Tools** | `src/index.ts` & `src/tools/*.ts` | **Wajib (Selesai 🟢)** |
| **16 Agent Skills (Slash Commands)** | `.agents/skills/*/SKILL.md` (termasuk `/bulk-plan`) | **Wajib (Selesai 🟢)** |
| **Database Initialization Script** | `/Database/schema.sql` (DDL + Constraints + Seed Data atlet `i655618`) | **Wajib** |
| **Web PWA Application** | `web/` atau terintegrasi di monorepo (Next.js PWA + API Routes) | **Wajib** |
| **Dokumentasi Setup & Penggunaan** | `README.md`, `GUIDE.md`, dan `docs/WORKFLOWS-GUIDE.md` | **Wajib (Selesai 🟢)** |
| **Dokumen Desain & Arsitektur** | `docs/PRD.md`, `docs/ARCHITECTURE.md`, `AGENTS.md`, `docs/PROGRESS.md` | **Wajib (Selesai 🟢)** |

---

## 8. Kriteria Penerimaan (Acceptance Criteria & Definition of Done)

### 8.1 Kriteria Minimum (Minimum Viable - Wajib Terpenuhi)
- [x] Seluruh 10 modul *pure engine* (`vdot`, `nsa`, `load`, `readiness`, `drift`, `plan`, `dsl`, `race`, `fueling`, `bulking`) lulus 100% unit test (94 tests di 20 file).
- [x] Server MCP berhasil dikompilasi (`pnpm run build`) dan mengekspos 37 tools tanpa error.
- [ ] Skrip `/Database/schema.sql` dapat dieksekusi bersih dari nol beserta data awal profil atlet (`FadhilAlif`).
- [ ] Endpoint REST API untuk log nutrisi, sesi gym, dan jembatan Intervals.icu berfungsi sesuai kontrak API.
- [ ] Antarmuka PWA `Today Cockpit`, `Bulking & Gym Studio`, dan `Weekly Planner` menampilkan hasil kalkulasi dari backend tanpa duplikasi rumus di browser.
- [ ] Operasi simpan, ubah, dan hapus log harian (Header + Line Items) berjalan secara atomik.
- [ ] Fitur ekspor laporan (`.xlsx` / `.csv`) menghasilkan berkas yang sesuai dengan filter tanggal/kata kunci aktif.

### 8.2 Kriteria Tingkat Lanjut (Advanced / Nilai Plus)
- [x] Auto-retry dengan *exponential backoff + jitter* saat menghadapi HTTP 429 dari API Intervals.icu (`src/utils/retry.ts`).
- [x] *In-Memory Volatile Cache* dengan TTL pada data gear (30m) dan power curves (60m) (`src/utils/cache.ts`).
- [ ] Dukungan instalasi PWA (`manifest.json` + *Offline Caching* untuk *Gym Card*, *McGill Timer*, dan *Race Strategy Pocket Card*).
- [ ] Proteksi middleware autentikasi `X-Api-Key` pada seluruh endpoint mutasi data.

---

## 9. 🤖 Rubrik Asesmen Kelengkapan PRD oleh AI Agent

```markdown
### [AI AGENT PRD AUDIT REPORT — DAILY ATHLETE OS]
- [x] **Konteks & Scope Jelas**: In-Scope (Core Engine, 37 MCP Tools, 5 PWA Modules, DB Logs) vs Out-of-Scope (Billing, Native BLE, Social Feed) terdefinisi tegas.
- [x] **Spesifikasi Data Lengkap**: Struktur tabel log nutrisi & gym mencakup tipe data, batas karakter, dan aturan nullability.
- [x] **Business Rules Unik**: 12 aturan bisnis (BR-01 s/d BR-12) memiliki kode unik, rumus eksak, dan lapisan penegakan yang jelas.
- [x] **Pencegahan Kalkulasi Client**: BR-05 secara eksplisit melarang kalkulasi fisiologis maupun subtotal/makro di sisi browser.
- [x] **Non-Functional Spec Realistis**: Target SLA (<50ms engine, <500ms API), stack TypeScript/Node.js/Next.js, dan standar testing Vitest terukur.
- [x] **Acceptance Criteria Testable**: Seluruh kriteria penerimaan dapat diverifikasi secara objektif (lulus/gagal).

Skor Kelengkapan: 100 / 100
Rekomendasi Perbaikan: Dokumen PRD telah lengkap dan siap dijadikan acuan eksekusi Fase Database & Web PWA.
```
