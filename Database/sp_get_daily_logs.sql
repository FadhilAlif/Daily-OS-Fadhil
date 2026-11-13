-- ============================================================================
-- View Rekapitulasi Log Harian Beserta Agregasi Kalori & Protein (Server-Side)
-- ============================================================================

CREATE OR REPLACE VIEW vw_daily_log_summary AS
SELECT
    h.log_id,
    h.log_no,
    h.log_date,
    h.athlete_id,
    a.intervals_id,
    a.full_name,
    h.day_type,
    h.gym_session_code,
    h.morning_weight_kg,
    h.running_burn_kcal,
    h.target_surplus_kcal,
    h.remarks,
    COALESCE(SUM(CASE WHEN i.item_category IN ('MEAL_SOLID', 'LIQUID_BOOSTER') THEN i.quantity * i.unit_kcal_or_load ELSE 0 END), 0)::INT AS total_intake_kcal,
    COALESCE(SUM(CASE WHEN i.item_category IN ('MEAL_SOLID', 'LIQUID_BOOSTER') THEN i.quantity * i.protein_grams ELSE 0 END), 0)::NUMERIC(8,2) AS total_protein_grams,
    COUNT(i.item_id)::INT AS item_count
FROM daily_log_header h
JOIN athlete_master a ON a.athlete_id = h.athlete_id
LEFT JOIN daily_log_item i ON i.log_id = h.log_id
GROUP BY
    h.log_id,
    h.log_no,
    h.log_date,
    h.athlete_id,
    a.intervals_id,
    a.full_name,
    h.day_type,
    h.gym_session_code,
    h.morning_weight_kg,
    h.running_burn_kcal,
    h.target_surplus_kcal,
    h.remarks;
