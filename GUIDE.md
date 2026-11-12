# 📖 Panduan Penggunaan `intervals-icu-mcp`

Panduan komprehensif untuk memasang, mengonfigurasi, dan menggunakan server **Intervals.icu MCP** beserta seluruh **37 MCP Tools** dan **14 AI Slash Commands** (termasuk modul baru `/bulk-plan`).

---

## 📌 Daftar Isi
1. [Tentang Sistem](#1-tentang-sistem)
2. [Prasyarat & Setup Awal](#2-prasyarat--setup-awal)
3. [Instalasi & Kompilasi](#3-instalasi--kompilasi)
4. [Konfigurasi MCP Client](#4-konfigurasi-mcp-client)
5. [Daftar 37 MCP Tools](#5-daftar-37-mcp-tools)
6. [Daftar 14 AI Slash Commands (Skills)](#6-daftar-14-ai-slash-commands-skills)
7. [Panduan Praktis Penggunaan Alur Nyata](#7-panduan-praktis-penggunaan-alur-nyata)
8. [Troubleshooting & Pemecahan Masalah](#8-troubleshooting--pemecahan-masalah)

---

## 1. Tentang Sistem

`intervals-icu-mcp` adalah server berbasis **Model Context Protocol (MCP)** dengan protokol transport `stdio`. Server ini menghubungkan AI Assistant (Antigravity, Claude Desktop, Cursor, VS Code Cline/Roo) dengan API **Intervals.icu** dan mesin kecerdasan fisiologi endurance:
- **Metodologi Lari**: *Norwegian Singles Training Method* (kontrol ambang laktat Sub-T LT2, durasi 75/25, rest pasif).
- **Metodologi Kekuatan**: *Steve Magness 5-Tool Framework* & *Dr. Stuart McGill Big 3*.
- **Metodologi Komposisi Tubuh**: *Clean Bulking Hybrid Runner* (+0.25 s.d. +0.35 kg/minggu, upper hypertrophy + lower neural).

---

## 2. Prasyarat & Setup Awal

### A. Kebutuhan Perangkat Lunak
- **Node.js**: Versi `v18.0.0` atau lebih baru (`node -v`).
- **pnpm**: Direkomendasikan sebagai package manager (`npm install -g pnpm`).
- **Git**: Untuk clone repositori.

### B. Kredensial Intervals.icu
1. Masuk ke akun [Intervals.icu](https://intervals.icu).
2. Buka menu **Settings** > gulir ke bagian **Developer Settings**.
3. Buat atau salin **API Key**.
4. Catat **Athlete ID** Anda (tertera di URL profil atau kolom pengaturan, contoh: `i655618` atau angka murni `655618`).

### C. Konfigurasi Environment (`.env`)
Salin file template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi dalam file `.env`:
```env
INTERVALS_API_KEY="api_key_anda_di_sini"
INTERVALS_ATHLETE_ID="i655618"
INTERVALS_API_BASE_URL="https://intervals.icu/api/v1"
```

---

## 3. Instalasi & Kompilasi

Jalankan perintah berikut di terminal root proyek:

```bash
# 1. Install seluruh dependensi
pnpm install

# 2. Jalankan test suite untuk memastikan semua unit lulus (94 tests)
pnpm test

# 3. Kompilasi TypeScript ke folder dist/
pnpm run build
```

---

## 4. Konfigurasi MCP Client

Server ini berkomunikasi lewat transport **stdio**. Path absolut ke berkas output kompilasi adalah `dist/index.js`.

### A. Konfigurasi di Claude Desktop
Buka file konfigurasi Claude Desktop:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Tambahkan server di bawah blok `mcpServers`:

```json
{
  "mcpServers": {
    "intervals-icu": {
      "command": "node",
      "args": [
        "C:\\Users\\<USER>\\.gemini\\antigravity\\scratch\\intervals-icu-mcp\\dist\\index.js"
      ],
      "env": {
        "INTERVALS_API_KEY": "YOUR_INTERVALS_API_KEY",
        "INTERVALS_ATHLETE_ID": "YOUR_ATHLETE_ID"
      }
    }
  }
}
```
*(Ganti `<USER>` dan path sesuai direktori absolut komputer Anda).*

### B. Konfigurasi di Antigravity / Cursor / VS Code (Cline / Roo-Code)
Tambahkan ke konfigurasi MCP client bawaan (contoh `.cline/mcp_settings.json` atau pengaturan MCP Workspace):

```json
{
  "mcpServers": {
    "intervals-icu": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "C:\\Users\\<USER>\\.gemini\\antigravity\\scratch\\intervals-icu-mcp",
      "env": {
        "INTERVALS_API_KEY": "YOUR_INTERVALS_API_KEY",
        "INTERVALS_ATHLETE_ID": "YOUR_ATHLETE_ID"
      }
    }
  }
}
```

---

## 5. Daftar 37 MCP Tools

Tools berikut otomatis dapat dipanggil langsung oleh AI assistant melalui MCP:

| No | Nama Tool | Domain | Deskripsi Singkat |
|:--:|---|---|---|
| 1 | `get_activities` | Activities | Daftar riwayat aktivitas lari/olahraga rentang tanggal |
| 2 | `get_activity_details` | Activities | Detail lengkap aktivitas (pace, HR, cad, watts) |
| 3 | `get_activity_intervals` | Activities | Data interval split putaran/lap aktivitas |
| 4 | `get_activity_streams` | Activities | Telemetri detik-per-detik (watts, HR, cad, speed) |
| 5 | `get_activity_messages` | Activities | Riwayat komentar/pesan coaching pada aktivitas |
| 6 | `add_activity_message` | Activities | Kirim komentar / catatan evaluasi ke aktivitas |
| 7 | `get_athlete_profile` | Athlete | Profil fisiologis atlet (FTP/CP, LTHR, BB, resting HR) |
| 8 | `get_training_zones` | Athlete | Zona latihan (7 Power Zones, Friel HR, Pace zones) |
| 9 | `calculate_vdot` | Calculator | Hitung skor Jack Daniels VDOT dari hasil race/time trial |
| 10| `calculate_pace_zones` | Calculator | Hitung 5 zona pace lari berdasarkan skor VDOT |
| 11| `calculate_nsa_matrix` | Calculator | Matriks interval waktu resmi NSA (1m s.d. 15m) |
| 12| `get_events` | Calendar | Ambil daftar event kalender (planned workout & notes) |
| 13| `get_event_by_id` | Calendar | Ambil detail 1 event berdasarkan Event ID |
| 14| `delete_event` | Calendar | Hapus 1 event latihan dari kalender |
| 15| `add_or_update_planned_workout` | Calendar | Buat/update planned workout (Run, WeightTraining, dll) |
| 16| `add_or_update_note` | Calendar | Buat/update catatan teks (kategori NOTE) di kalender |
| 17| `get_workout_library` | Calendar | Ambil pustaka template workout tersimpan |
| 18| `get_workout_by_id` | Calendar | Detail 1 template workout beserta target watt/pace |
| 19| `create_running_workout` | Calendar | Jadwalkan running workout via format Teks DSL resmi |
| 20| `get_custom_items` | Custom Items | Daftar custom chart, field, atau interval field |
| 21| `get_custom_item_by_id` | Custom Items | Detail satu custom item |
| 22| `create_custom_item` | Custom Items | Buat custom item baru |
| 23| `update_custom_item` | Custom Items | Perbarui metadata custom item |
| 24| `delete_custom_item` | Custom Items | Hapus custom item |
| 25| `get_gear_list` | Gear | Daftar perlengkapan / rotasi sepatu lari atlet |
| 26| `predict_race_time` | Intelligence | Prediksi finish time & pace berbasis VDOT + CTL/TSB |
| 27| `calculate_taper_plan` | Intelligence | Pola tapering 10-14 hari (A-Taper NSA: -35% lalu -50%) |
| 28| `analyze_cardiac_drift` | Intelligence | Aerobic Decoupling EF paruh 1 vs paruh 2 dari stream |
| 29| `calculate_readiness_score` | Intelligence | Skor kesiapan 0-100% (TSB, ACWR, Sleep, RHR Spike) |
| 30| `calculate_race_fueling` | Intelligence | Strategi nutrisi race day, gel 30g carb, hidrasi tropis |
| 31| `calculate_bulking_plan` | Intelligence | Kalori dinamis lari+kantor, makro, gym upper hypertrophy |
| 32| `analyze_training_load` | Load | Evaluasi CTL, ATL, TSB, Ramp Rate, & ACWR |
| 33| `calculate_weekly_budget` | Load | Hitung alokasi durasi mingguan 75/25 NSA (5–9 jam) |
| 34| `get_athlete_power_curves` | Power Curves | Kurva daya lari (Power Duration Curve) |
| 35| `get_wellness_data` | Wellness | Catatan harian berat badan, sleep, RHR, HRV |
| 36| `get_fitness_chart` | Wellness | Time series fitness chart (CTL, ATL, TSB, Ramp Rate) |
| 37| `generate_weekly_plan` | Calendar | Generator susunan rencana mingguan NSA terstruktur |

---

## 6. Daftar 14 AI Slash Commands (Skills)

Gunakan slash command ini langsung di ruang chat Antigravity / Claude Code:

### A. Rutinitas Mingguan (Setiap Hari Minggu)
| Perintah | Deskripsi |
|---|---|
| **`/fitness-status`** | Audit kebugaran beban latihan (CTL, TSB, Green Zone, ACWR). |
| **`/weekly-budget`** | Hitung budget durasi latihan mingguan (5–9 jam) dengan aturan 75/25. |
| **`/plan-week`** | Rancang jadwal lari 1 pekan penuh (`E-Q-E-Q-E-Q-LR`) & opsi publish ke kalender. |
| **`/bulk-plan`** | Rancang surplus kalori harian dinamis (lari + kantor Jakarta) & program gym upper hypertrophy. |
| **`/check-workout 7`** | Verifikasi kalender 7 hari ke depan (memastikan Senin Rest Total). |

### B. Rutinitas Harian (Daily Training Cycle)
| Perintah | Waktu Eksekusi | Deskripsi |
|---|---|---|
| **`/readiness-check`** | Pagi hari (04:30 WIB) | Cek skor kesiapan fisik (0-100% Green/Yellow/Red). |
| **`/check-workout`** | Sebelum sesi lari | Cek detail target watt, durasi, dan HR batas sesi hari ini. |
| **`/run-report`** | 15–30m pasca-lari | Evaluasi kepatuhan lari LT2, rest pasif, dan RPE. |
| **`/cardiac-drift`** | Pasca-Long Run | Cek penurunan efisiensi jantung (*Aerobic Decoupling* < 5%). |
| **`/strength-guide`** | Selasa & Jumat sore | Panduan latihan kekuatan fungsional 20-25m (McGill Big 3). |

### C. Kalibrasi Benchmark & Perlombaan
| Perintah | Momen Penggunaan | Deskripsi |
|---|---|---|
| **`/calc-vdot`** | Pasca-Time Trial (4–8 pekan) | Hitung skor VDOT dan zona pace Sub-T terkini. |
| **`/calc-nsa`** | Awal fase / benchmark baru | Matriks durasi interval resmi NSA (1m s.d. 15m). |
| **`/create-workout`** | Kapan saja | Terbitkan sesi workout Teks DSL kustom ke kalender. |
| **`/predict-race`** | 10–14 hari jelang race | Prediksi waktu finish & jadwal tapering A-Taper NSA. |
| **`/race-strategy`** | Race week / Pagi race | Strategi intake gel 30g carb, batas cairan lambung, pacing CP. |

---

## 7. Panduan Praktis Penggunaan Alur Nyata

### Skenario 1: Merancang Jadwal Bulking Bersih & Gym (`/bulk-plan`)
1. Ketik di chat:
   ```text
   /bulk-plan
   ```
2. AI otomatis memanggil:
   - `get_wellness_data` (membaca rata-rata BB dan resting HR 14 hari).
   - `get_athlete_profile` (membaca CP aktif, contoh: 241W).
   - `get_events` (membaca jadwal lari minggu ini).
   - `calculate_bulking_plan` (menghitung surplus bersih +400 kkal, protein 2.1 g/kg, lemak 1.1 g/kg, dan sisa karbohidrat).
3. AI menyajikan:
   - Tabel kebutuhan kalori dinamis (Rest: ~2.650 kkal, Easy: ~3.100 kkal, Quality+Gym: ~3.500 kkal, Long Run: ~3.450 kkal).
   - Menu harian Jakarta (3 solid meals + 2 liquid boosters).
   - Menu latihan gym Upper Push, Upper Pull, dan Upper Pump (zero beban kaki).
4. Untuk menyimpan ke kalender, cukup balas:
   ```text
   Publish
   ```
   AI otomatis menjadwalkan 3 sesi `WeightTraining` via `add_or_update_planned_workout` dan catatan target kalori via `add_or_update_note` ke kalender Intervals.icu.

---

### Skenario 2: Merancang Jadwal Lari 1 Pekan Penuh (`/plan-week`)
1. Ketik di chat:
   ```text
   /plan-week 6h
   ```
2. AI menghitung rasio durasi 75/25 NSA (60 menit Sub-T, 300 menit Easy/LR).
3. AI menampilkan pratinjau tabel 7 hari (`E-Q-E-Q-E-Q-LR`).
4. Ketik `Publish` untuk mengirimkan seluruh sesi terstruktur via Teks DSL langsung ke jam tangan pintar Anda (Garmin).

---

### Skenario 3: Evaluasi Harian Lari Pagi (`/readiness-check` ➔ `/run-report`)
1. **Pagi hari sebelum lari**:
   ```text
   /readiness-check
   ```
   Jika status **GREEN**, laksanakan sesi Quality Sub-T sesuai kalender.
2. **Setelah selesai lari dan jam tersinkronisasi**:
   ```text
   /run-report
   - Sesi Eksekusi: Quality 1: Short Sub-T 10x 3m
   - RPE: 6/10
   - Catatan Fisik: Nyaman, napas terkontrol
   ```
   AI menganalisis apakah daya mekanik (Watt) berada tepat di koridor 85–95% CP dan jeda istirahat jalan santai ditaati.

---

## 8. Troubleshooting & Pemecahan Masalah

### 1. `Error: INTERVALS_API_KEY wajib diisi`
- **Penyebab**: Variabel lingkungan API key belum disetel.
- **Solusi**: Pastikan file `.env` sudah memuat `INTERVALS_API_KEY="xxx"` atau tambahkan langsung pada blok `env` di konfigurasi MCP client Anda.

### 2. `Athlete ID tidak ditemukan / 404 Not Found`
- **Penyebab**: Format Athlete ID tidak valid.
- **Solusi**: Gunakan prefix `i` untuk atlet eksternal (misal `i655618`) atau angka murni jika akun utama. Parameter `INTERVALS_ATHLETE_ID` di `.env` akan menjadi default otomatis.

### 3. Perubahan Kode TypeScript Tidak Berdampak pada MCP Client
- **Penyebab**: Kode belum dikompilasi ulang ke JavaScript (`dist/`).
- **Solusi**: Jalankan `pnpm run build` dan restart MCP client Anda (Claude Desktop atau Antigravity session).

### 4. Perintah Slash Command Tidak Muncul
- **Penyebab**: Folder `.agents/skills/` belum terbaca oleh agent session.
- **Solusi**: Pastikan Anda membuka workspace di root folder `intervals-icu-mcp`. Antigravity secara otomatis memuat seluruh skill yang terdaftar di `.agents/skills/`.

---

*Versi Dokumen: 1.0.0 (Diperbarui 12 November 2026).*
