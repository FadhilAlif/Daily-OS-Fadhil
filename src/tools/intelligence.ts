import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { analyzeCardiacDrift } from "../utils/drift.js";
import { calculateBulkingPlan } from "../utils/bulking.js";
import { calculateRaceFuelingPlan } from "../utils/fueling.js";
import { calculateTaperPlan, predictRaceTime } from "../utils/race.js";
import { calculateReadinessScore } from "../utils/readiness.js";

/**
 * Register MCP Tools for Endurance Intelligence Suite.
 */
export function registerIntelligenceTools(server: McpServer): void {
  // 1. predict_race_time
  server.tool(
    "predict_race_time",
    "Memprediksi estimasi waktu finish & pace race (5K, 10K, Half Marathon, Full Marathon, atau jarak kustom) berbasis VDOT dengan koreksi CTL (kebugaran) & TSB (kesiapan).",
    {
      vdot: z.number().describe("Nilai VDOT atlet (misal 50)."),
      targetDistanceKm: z.number().describe("Jarak race dalam kilometer (misal 21.0975 untuk Half Marathon, 42.195 untuk Full Marathon)."),
      ctl: z.number().optional().describe("Nilai kebugaran kronis (CTL 42d). Default 50."),
      tsb: z.number().optional().describe("Nilai kesiapan akut (TSB/Form). Default 0."),
    },
    async ({ vdot, targetDistanceKm, ctl, tsb }) => {
      const result = predictRaceTime({ vdot, targetDistanceKm, ctl, tsb });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // 2. calculate_taper_plan
  server.tool(
    "calculate_taper_plan",
    "Menghitung jadwal dan pola tapering (A-Taper full 10-14d, B-Taper mini 4-6d, atau C-Taper no taper/workout swap) untuk memuncakkan kesiapan fisik (TSB Freshness) di hari Race.",
    {
      raceDate: z.string().describe("Tanggal race format YYYY-MM-DD."),
      currentCtl: z.number().describe("CTL atlet saat ini."),
      currentTsb: z.number().describe("TSB atlet saat ini."),
      taperWeeks: z.number().optional().describe("Durasi minggu tapering untuk Race A (2 atau 3 minggu). Default 2."),
      racePriority: z.enum(["A", "B", "C"]).optional().describe("Kategori prioritas race: A (Target Utama, Full Taper 10-14d), B (Tune-Up / CP Test, Mini Taper 4-6d), C (Training Run / Simulasi Logistik, No Taper / Swap Workout). Default 'A'."),
    },
    async ({ raceDate, currentCtl, currentTsb, taperWeeks, racePriority }) => {
      const result = calculateTaperPlan({ raceDate, currentCtl, currentTsb, taperWeeks, racePriority });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // 3. analyze_cardiac_drift
  server.tool(
    "analyze_cardiac_drift",
    "Menganalisis stream telemetri (HR vs Power/Speed) untuk menghitung Efficiency Factor (EF) paruh 1 vs paruh 2 dan persentase Aerobic Decoupling.",
    {
      heartrateStream: z.array(z.number()).describe("Array time-series Heart Rate (bpm)."),
      powerOrSpeedStream: z.array(z.number()).describe("Array time-series Power (Watt) atau Speed (m/s)."),
    },
    async ({ heartrateStream, powerOrSpeedStream }) => {
      const result = analyzeCardiacDrift({ heartrateStream, powerOrSpeedStream });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // 4. calculate_readiness_score
  server.tool(
    "calculate_readiness_score",
    "Memetakan TSB, ACWR, Sleep Score, HRV, dan RHR Spike ke dalam Skor Kesiapan Terpadu 0-100% (GREEN, YELLOW, RED).",
    {
      tsb: z.number().describe("Nilai TSB/Form atlet terkini."),
      acwr: z.number().describe("Nilai Acute:Chronic Workload Ratio terkini."),
      sleepScore: z.number().optional().describe("Skor kualitas tidur 0-100."),
      hrv: z.number().optional().describe("Nilai HRV rMSSD."),
      restingHr: z.number().optional().describe("Denyut jantung istirahat harian terkini."),
      baselineRestingHr: z.number().optional().describe("Baseline RHR normal atlet."),
    },
    async (input) => {
      const result = calculateReadinessScore(input);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // 5. calculate_race_fueling
  server.tool(
    "calculate_race_fueling",
    "Menghitung strategi nutrisi perlombaan berbasis energi gel (30g karbohidrat), estimasi laju keringat & hidrasi untuk iklim tropis hangat/lembab, serta strategi pacing KM-by-KM untuk Half Marathon.",
    {
      raceDistanceKm: z.number().optional().describe("Jarak lomba dalam kilometer (default: 21.0975 untuk Half Marathon)."),
      predictedTimeMinutes: z.number().optional().describe("Estimasi waktu tempuh lomba dalam menit (misal 138 untuk 2h18m)."),
      athleteWeightKg: z.number().optional().describe("Berat badan atlet dalam kg (default: 81 kg)."),
      temperatureCelsius: z.number().optional().describe("Estimasi suhu rata-rata saat lomba dalam derajat Celsius (default: 26°C)."),
      relativeHumidityPct: z.number().optional().describe("Estimasi kelembapan relatif saat lomba dalam persen (default: 80%)."),
      criticalPowerWatts: z.number().optional().describe("Critical Power (CP) atlet dalam Watt (default: 293 W)."),
      vdot: z.number().optional().describe("Skor VDOT atlet (default: 32)."),
    },
    async (input) => {
      const result = calculateRaceFuelingPlan(input);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // 6. calculate_bulking_plan
  server.tool(
    "calculate_bulking_plan",
    "Menghitung target kalori harian dinamis (BMR + NEAT kantor + kalori lari/gym), makronutrisi (protein 2.1 g/kg, lemak 1.1 g/kg, karbo sisa), Power-to-Weight guardrail, struktur 5 meal Jakarta (3 solid + 2 liquid booster), dan sesi gym Upper Hypertrophy + Lower Neural untuk lean bulking pelari.",
    {
      weightKg: z.number().positive().describe("Berat badan atlet terkini dalam kg (contoh: 63)."),
      heightCm: z.number().positive().optional().describe("Tinggi badan dalam cm (default: 180)."),
      age: z.number().positive().optional().describe("Usia dalam tahun (default: 23)."),
      gender: z.enum(["male", "female"]).optional().describe("Jenis kelamin (default: male)."),
      criticalPowerWatts: z.number().positive().optional().describe("Critical Power lari dalam Watt (default: 241)."),
      dayType: z
        .enum(["REST", "EASY_RUN", "QUALITY_SUB_T", "LONG_RUN"])
        .optional()
        .describe("Tipe hari latihan lari. Default REST."),
      dailyRunningBurnKcal: z
        .number()
        .nonnegative()
        .optional()
        .describe("Kalori lari aktual hari itu dari Intervals.icu (kkal). Jika kosong, diestimasi dari dayType."),
      gymSessionPlanned: z.boolean().optional().describe("True jika ada sesi gym hari itu. Default false."),
      gymSessionCode: z
        .enum(["GYM_A", "GYM_B", "GYM_C"])
        .optional()
        .describe("Pilih preset sesi gym: GYM_A (Push + Neural), GYM_B (Pull + Pelvic), GYM_C (Arms & Upper Pump)."),
      targetSurplusKcal: z.number().optional().describe("Surplus kalori harian (default: 400 kkal)."),
      targetWeightKg: z.number().positive().optional().describe("Target berat badan akhir (default: 67 kg)."),
    },
    async (input) => {
      try {
        const result = calculateBulkingPlan(input);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: "text", text: err instanceof Error ? err.message : String(err) }],
        };
      }
    }
  );
}
