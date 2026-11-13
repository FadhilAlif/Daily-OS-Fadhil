-- ============================================================================
-- Daily Athlete OS (intervals-icu-mcp) — PostgreSQL Database Schema (Neon DB)
-- ============================================================================

-- 1. TABEL MASTER PROFIL ATLET
CREATE TABLE IF NOT EXISTS athlete_master (
    athlete_id          SERIAL PRIMARY KEY,
    intervals_id        VARCHAR(20) NOT NULL UNIQUE,
    full_name           VARCHAR(100) NOT NULL,
    height_cm           INT NOT NULL DEFAULT 180 CHECK (height_cm > 0),
    baseline_weight_kg  NUMERIC(5,2) NOT NULL DEFAULT 63.00 CHECK (baseline_weight_kg > 0),
    target_weight_kg    NUMERIC(5,2) NOT NULL DEFAULT 67.00 CHECK (target_weight_kg > 0),
    critical_power_w    INT NOT NULL DEFAULT 241 CHECK (critical_power_w > 0),
    lthr_bpm            INT NOT NULL DEFAULT 179 CHECK (lthr_bpm > 0),
    max_hr_bpm          INT NOT NULL DEFAULT 204 CHECK (max_hr_bpm > 0),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. TABEL TRANSAKSI INDUK LOG NUTRISI & LATIHAN HARIAN (HEADER)
CREATE TABLE IF NOT EXISTS daily_log_header (
    log_id              SERIAL PRIMARY KEY,
    log_no              VARCHAR(20) NOT NULL UNIQUE,
    log_date            DATE NOT NULL,
    athlete_id          INT NOT NULL,
    day_type            VARCHAR(20) NOT NULL CHECK (day_type IN ('REST', 'EASY_RUN', 'QUALITY_SUB_T', 'LONG_RUN')),
    gym_session_code    VARCHAR(10) NOT NULL DEFAULT 'NONE' CHECK (gym_session_code IN ('NONE', 'GYM_A', 'GYM_B', 'GYM_C')),
    morning_weight_kg   NUMERIC(5,2) NOT NULL CHECK (morning_weight_kg > 0),
    running_burn_kcal   INT NOT NULL DEFAULT 0 CHECK (running_burn_kcal >= 0),
    target_surplus_kcal INT NOT NULL DEFAULT 400,
    remarks             VARCHAR(500) NULL,
    CONSTRAINT fk_daily_log_athlete FOREIGN KEY (athlete_id)
        REFERENCES athlete_master(athlete_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_log_date ON daily_log_header(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_log_athlete ON daily_log_header(athlete_id);

-- 3. TABEL DETAIL ITEM MAKANAN / LIQUID BOOSTER / SET GYM (LINE ITEMS)
CREATE TABLE IF NOT EXISTS daily_log_item (
    item_id             SERIAL PRIMARY KEY,
    log_id              INT NOT NULL,
    item_category       VARCHAR(30) NOT NULL CHECK (item_category IN ('MEAL_SOLID', 'LIQUID_BOOSTER', 'GYM_SET')),
    item_name           VARCHAR(100) NOT NULL,
    quantity            INT NOT NULL CHECK (quantity > 0),
    unit_kcal_or_load   NUMERIC(18,2) NOT NULL CHECK (unit_kcal_or_load > 0),
    protein_grams       NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (protein_grams >= 0),
    CONSTRAINT fk_item_daily_log FOREIGN KEY (log_id)
        REFERENCES daily_log_header(log_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_log_item_log_id ON daily_log_item(log_id);

-- 4. DEFAULT DYNAMIC SEED (Dapat diubah kapan saja melalui layar /onboarding)
INSERT INTO athlete_master (
    intervals_id,
    full_name,
    height_cm,
    baseline_weight_kg,
    target_weight_kg,
    critical_power_w,
    lthr_bpm,
    max_hr_bpm
) VALUES (
    'i655618',
    'Fadhil Alif',
    180,
    63.20,
    67.00,
    241,
    179,
    204
) ON CONFLICT (intervals_id) DO NOTHING;
