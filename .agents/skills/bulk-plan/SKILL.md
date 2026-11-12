---
name: bulk-plan
description: Rancang perencanaan bulking dan surplus kalori bersih pelari (61-64 kg menuju 66-68 kg) terintegrasi dengan jadwal lari Norwegian Singles. Mengkalkulasi kalori dinamis harian (BMR, NEAT kantor Jakarta, pembakaran lari aktual Intervals.icu), makro terukur, power-to-weight guardrail, protokol 2x liquid calorie booster, serta program gym Upper Hypertrophy + Lower Neural (Steve Magness & McGill Big 3) dengan opsi publikasi ke kalender Intervals.icu.
---

# Skill: `/bulk-plan` — Runner Clean Bulking & Upper Hypertrophy Planner

Skill ini menyusun perencanaan *clean bulking* terstruktur (+0.25 s.d. +0.35 kg/minggu) bagi pelari endurance untuk menaikkan berat badan secara proporsional ke **66–68 kg** tanpa menimbulkan DOMS kaki atau merusak kualitas lari sub-threshold.

---

## 1. Format Perintah

**Evaluasi mingguan lengkap & susun menu/gym 7 hari ke depan:**
```text
/bulk-plan
```

**Evaluasi hari tertentu dengan tipe lari spesifik:**
```text
/bulk-plan today
/bulk-plan quality
/bulk-plan rest
```

**Set target kalori surplus atau target berat badan kustom:**
```text
/bulk-plan target=68kg surplus=450
```

---

## 2. Empat Pilar Inti (*Leading Words*)

1. **Clean Surplus (+350 s.d. +450 kkal)**:
   - Menghindari *dirty bulking*. Menaikkan bobot perlahan (+1.0–1.4 kg/bulan) agar pertambahan bobot murni serat otot fungsional dan glikogen, bukan jaringan adiposa abdominal.
2. **Interference Shield (mTOR vs. AMPK)**:
   - Sesi lari subuh (05:15 WIB) mengaktifkan AMPK. Latihan gym dijadwalkan sore/malam (18:30 WIB) dengan jeda $\ge 6$ jam agar kaskade mTOR dapat menyintesis protein otot secara optimal.
3. **DOMS Protection & Asymmetric Hypertrophy**:
   - *Upper Body*: Hipertrofi murni (8–12 reps, RPE 8–8.5) untuk mengisi postur atletis di tinggi 180 cm.
   - *Lower Body*: Murni adaptasi saraf Steve Magness (Heavy Neural 3–4 reps, RPE $\le 8$, berhenti jauh sebelum failure) + isometrik tendon pelari + McGill Big 3. **Dilarang keras melatih kaki hingga kelelahan eksentrik (leg extension/squat failure)**.
4. **Liquid Calorie Booster**:
   - Memenuhi 1.100–1.300 kkal melalui 2x shake cair (susu, oat, selai kacang, whey, pisang) untuk mencegah rasa begah dan gangguan pencernaan saat beraktivitas di kantor.

---

## 3. Matriks Mingguan Sesi Gym (Office Hours 08:00–18:00 WIB)

| Hari | Sesi Lari Pagi (05:15 WIB) | Sesi Gym Malam (18:30 WIB) / Akhir Pekan | Kode Preset Gym |
|---|---|---|---|
| **Senin** | REST TOTAL (Sunnah/Recovery) | REST Gym (Fokus Pemulihan Glikogen) | — |
| **Selasa** | **Quality 1: Sub-T Run (55m)** | **Gym A: Upper Push + Lower Neural (45m)** | `GYM_A` |
| **Rabu** | Easy Aerobic Run (45m) | REST Gym | — |
| **Kamis** | Easy Recovery Run (40m) | REST Gym | — |
| **Jumat** | **Quality 2: Sub-T Run (55m)** | **Gym B: Upper Pull (V-Taper) + Pelvic Armor (45m)** | `GYM_B` |
| **Sabtu** | Shakeout Run (30m) | **Gym C: Pure Upper Hypertrophy Pump & Arms (40m)** | `GYM_C` |
| **Minggu**| **Long Run Aerobic (75–90m)** | REST Gym (Zero lifting, proteksi kaki) | — |

*Pemberitahuan Guardrail*: Sesi `GYM_C` pada hari Sabtu wajib **NOL beban kaki** agar kaki 100% segar menyambut Long Run hari Minggu pagi.

---

## 4. Alur Prosedural Eksekusi (5 Steps)

### Step 1: Tarik Telemetri Atlet dari Intervals.icu
1. Panggil MCP `get_wellness_data`:
   - Rentang 14 hari terakhir untuk mengekstrak riwayat `weight` dan `restingHR`.
   - Hitung rata-rata bobot 7 hari terakhir dan tren laju kenaikan mingguan ($\Delta \text{BB}$).
2. Panggil MCP `get_athlete_profile`:
   - Dapatkan `ftp` (Critical Power aktif atlet, default 241W).
3. Panggil MCP `get_events`:
   - Baca agenda lari 7 hari ke depan untuk menentukan jenis hari (`REST`, `EASY_RUN`, `QUALITY_SUB_T`, `LONG_RUN`).
- **Completion Criterion**: Nilai berat badan terkini, CP aktif, dan jadwal lari 7 hari berhasil dipetakan.

### Step 2: Hitung Kalori & Makro via MCP `calculate_bulking_plan`
Panggil MCP tool `calculate_bulking_plan` untuk setiap hari latihan dengan parameter:
- `weightKg`: berat badan rata-rata terkini.
- `dayType`: `REST` | `EASY_RUN` | `QUALITY_SUB_T` | `LONG_RUN`.
- `gymSessionPlanned`: `true` untuk hari Selasa, Jumat, dan Sabtu.
- `gymSessionCode`: `GYM_A` (Selasa), `GYM_B` (Jumat), `GYM_C` (Sabtu).
- `criticalPowerWatts`: CP terkini atlet.
- **Completion Criterion**: Menghasilkan rincian BMR, TDEE, pembakaran lari/gym, target kalori surplus harian, dan pembagian makro (Protein ~2.1 g/kg, Lemak ~1.1 g/kg, Karbo sisa).

### Step 3: Evaluasi Power-to-Weight Guardrail
Periksa rasio daya mekanis terhadap bobot badan:
- Baseline atlet: $241\text{ W} / 63\text{ kg} = 3.83\text{ W/kg}$.
- Verifikasi batas aman target CP: saat bobot naik ke $67\text{ kg}$, atlet diingatkan target CP jangka menengah berada di kisaran $\ge 256\text{ W}$.
- **Completion Criterion**: Angka W/kg dan rekomendasi target CP disertakan dalam laporan.

### Step 4: Sajikan Laporan Terstruktur & Protokol Makan Jakarta
Tampilkan laporan dalam format standar:
1. Ringkasan Status & Evaluasi Kenaikan Berat Badan.
2. Tabel Kebutuhan Kalori Dinamis 7 Hari (Senin–Minggu).
3. Rincian Menu Praktis Jakarta (3 Solid Meals + 2 Liquid Boosters).
4. Kartu Latihan Gym Minggu Ini (Gym A, B, C).
5. Konfirmasi Publikasi Kalender.
- **Completion Criterion**: Output memuat tabel 7 hari dan petunjuk konfirmasi yang jelas.

### Step 5: Publikasi ke Kalender Intervals.icu (Setelah Konfirmasi)
Setelah atlet mengetik **"Publish"** atau **"Setuju"**:
1. Buat planned workout angkat beban via MCP `add_or_update_planned_workout`:
   - Kategori: `WORKOUT`
   - `workoutType`: `WeightTraining`
   - Hari Selasa: `Gym A: Upper Push + Lower Neural (Steve Magness)`
   - Hari Jumat: `Gym B: Upper Pull (V-Taper) + Pelvic Armor`
   - Hari Sabtu: `Gym C: Pure Upper Hypertrophy Pump & Arms`
2. Tambahkan catatan target nutrisi harian via MCP `add_or_update_note`:
   - Kategori: `NOTE`
   - Judul: `Bulking Target: [X] kcal (P:[X]g / C:[X]g / F:[X]g)`
   - Warna: `orange` / `blue`
- **Completion Criterion**: Event sesi gym dan note kalori terkonfirmasi terbit di kalender Intervals.icu atlet.

---

## 5. Referensi Protokol Nutrisi Praktis Jakarta

### Template Shake Liquid Booster (Mudah Dibuat di Kost/Kantor)
- **Liquid Booster #1 (Pagi Pasca-Lari — ~650 kkal, 40g Protein)**:
  - 250ml Susu UHT Full Cream (Ultra Milk / Greenfields).
  - 1 scoop Whey Protein (25g protein).
  - 40–50g Instant Oats (diseduh air panas sebentar atau langsung blender).
  - 1 sdm Selai Kacang (Peanut Butter).
  - 1 buah Pisang Cavendish.
- **Liquid Booster #2 (Sore Pre-Gym / Kantor — ~400 kkal, 20g Protein)**:
  - 1 botol (250–300ml) Susu Tinggi Protein Minimarket (MilkLife / Ultra Protein / Cimory).
  - 1 bungkus Roti Gandum isi / Onigiri Indomaret.
  - 1 buah Pisang.

### Panduan Double-Protein Warteg / Rumah Makan Padang
- **Nasi**: 1.5 porsi normal (karbohidrat fondasi pemulihan glikogen lari).
- **Lauk Utama**: 1 potong dada/paha ayam bakar atau panggang + 2 butir telur rebus/balado atau 2 potong tempe/tahu bacem.
- **Sayuran**: 1 porsi bayam, kangkung, atau capcay (serat dan mikronutrien).
