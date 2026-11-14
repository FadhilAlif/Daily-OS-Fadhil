/**
 * Pure Engine: Race Day & Fueling Execution Planner.
 *
 * Mengoptimalkan strategi nutrisi perlombaan (5K, 10K, Half Marathon, Full Marathon)
 * dengan spesifikasi nutrisi resmi EJ Sport Energy Gel (30g karbohidrat per sachet:
 * 12g Maltodextrin + 18g Dextrose), hidrasi iklim tropis hangat/lembab (suhu 24–28°C, RH 75–85%),
 * serta segmentasi pacing KM-by-KM berbasis Critical Power dan VDOT atlet.
 */

export interface EnergyGelSpec {
  name: string;
  carbsGrams: number;
  maltodextrinGrams: number;
  dextroseGrams: number;
  details: string;
}

export const EJ_SPORT_GEL: EnergyGelSpec = {
  name: "EJ Sport",
  carbsGrams: 30,
  maltodextrinGrams: 12,
  dextroseGrams: 18,
  details:
    "12g Maltodextrin + 18g Dextrose (Dual-Carb), 100mg L-Carnitine, Vitamin B Complex (B3 15mg, B6 1.2mg, B5 5mg).",
};

export interface RaceFuelingInput {
  raceName?: string;
  raceDistanceKm?: number;        // Default: 21.0975 km (Half Marathon)
  predictedTimeMinutes?: number;  // Default: 138 menit (~2 jam 18 menit)
  athleteWeightKg?: number;       // Default: 81 kg
  temperatureCelsius?: number;    // Default: 26 °C
  relativeHumidityPct?: number;   // Default: 80 %
  criticalPowerWatts?: number;    // Default: 293 W
  vdot?: number;                  // Default: 32
  gelSpec?: EnergyGelSpec;        // Default: EJ_SPORT_GEL
}

export interface FuelingMilestone {
  timing: string;
  distanceKm?: number;
  action: string;
  carbsGrams: number;
  fluidMl: number;
  sodiumMg: number;
  tacticalNote: string;
}

export interface PacingSegment {
  segment: string;
  title: string;
  paceRangeFormatted: string;
  powerWattsRange: { min: number; max: number };
  powerPercentageRange: { min: number; max: number };
  focus: string;
}

export interface RaceFuelingPlanResult {
  raceName: string;
  raceDistanceKm: number;
  predictedTimeMinutes: number;
  predictedTimeFormatted: string;
  hourlyCarbsTargetGrams: number;
  totalCarbsPlannedGrams: number;
  estimatedSweatRateMlPerHour: number;
  targetFluidIntakeMlPerHour: number;
  targetSodiumMgPerHour: number;
  gelBrand: string;
  gelCount: number;
  fuelingSchedule: FuelingMilestone[];
  pacingStrategy: PacingSegment[];
  climateContext: {
    temperatureCelsius: number;
    relativeHumidityPct: number;
    heatRisk: "LOW" | "MODERATE" | "HIGH";
    notes: string[];
  };
}

function formatMinutesToTime(minutes: number): string {
  const totalSeconds = Math.round(minutes * 60);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h${m.toString().padStart(2, "0")}m${s.toString().padStart(2, "0")}s`;
}

function formatPaceString(secPerKm: number): string {
  const safeSec = Math.max(120, Math.round(secPerKm));
  const m = Math.floor(safeSec / 60);
  const s = safeSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function calculateRaceFuelingPlan(input: RaceFuelingInput = {}): RaceFuelingPlanResult {
  const {
    raceName = "Target Race (Half Marathon)",
    raceDistanceKm = 21.0975,
    predictedTimeMinutes = 138,
    athleteWeightKg = 81,
    temperatureCelsius = 26,
    relativeHumidityPct = 80,
    criticalPowerWatts = 293,
    gelSpec = EJ_SPORT_GEL,
  } = input;

  if (raceDistanceKm <= 0) {
    throw new RangeError("raceDistanceKm harus bilangan positif > 0.");
  }
  if (athleteWeightKg <= 0) {
    throw new RangeError("athleteWeightKg harus bilangan positif > 0.");
  }
  if (predictedTimeMinutes <= 0) {
    throw new RangeError("predictedTimeMinutes harus bilangan positif > 0.");
  }

  // 1. Estimasi Laju Keringat (Sweat Rate) & Hidrasi Tropis
  // Baseline ~10 ml/kg/jam di 20°C, naik ~3.5% per derajat di atas 20°C
  const tempDelta = Math.max(0, temperatureCelsius - 20);
  const tempFactor = 1 + tempDelta * 0.035;
  const rawSweatRate = athleteWeightKg * 10 * tempFactor;
  const estimatedSweatRateMlPerHour = Math.round(rawSweatRate / 10) * 10;

  // Batas aman penyerapan cairan lambung pelari: 500 - 700 ml/jam
  const targetFluidIntakeMlPerHour = 600;
  const targetSodiumMgPerHour = 400; // 350 - 500 mg / jam

  // 2. Rencana Nutrisi Karbohidrat Gel (EJ Sport: 30g per sachet)
  // Menentukan alokasi sachet & timeline spesifik berdasarkan jarak perlombaan
  const cp = criticalPowerWatts;
  const avgSecPerKm = (predictedTimeMinutes * 60) / raceDistanceKm;
  const isDefaultHm = Math.abs(raceDistanceKm - 21.0975) < 0.1 && predictedTimeMinutes === 138;

  let gelCount = 4;
  let fuelingSchedule: FuelingMilestone[] = [];
  let pacingStrategy: PacingSegment[] = [];

  if (raceDistanceKm <= 7) {
    // === TARGET 5K ===
    // Durasi singkat (< 45m). Glikogen otot mencukupi. 1 sachet pre-race, hidrasi ringan opsional.
    gelCount = 1;
    fuelingSchedule = [
      {
        timing: "T-15m",
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml air mineral`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 150,
        sodiumMg: 50,
        tacticalNote:
          "Konsumsi 15 menit sebelum start di garis start. Jarak 5K tidak membutuhkan gel intra-race karena cadangan glikogen otot sudah mencukupi.",
      },
      {
        timing: "KM 2.5 (~12m)",
        distanceKm: 2.5,
        action: "Hidrasi Ringan (50–100ml air mineral)",
        carbsGrams: 0,
        fluidMl: 100,
        sodiumMg: 40,
        tacticalNote:
          "Water Station KM 2.5: basahi mulut atau teguk sedikit air jika cuaca tropis terasa panas dan lembap.",
      },
    ];

    const p1 = `${formatPaceString(avgSecPerKm + 5)}–${formatPaceString(avgSecPerKm + 12)} /km`;
    const p2 = `${formatPaceString(avgSecPerKm - 4)}–${formatPaceString(avgSecPerKm + 3)} /km`;
    const p3 = `${formatPaceString(avgSecPerKm - 15)}–${formatPaceString(avgSecPerKm - 5)} /km`;

    pacingStrategy = [
      {
        segment: "KM 1 - 1.5",
        title: "Calm Adrenaline Guard",
        paceRangeFormatted: p1,
        powerWattsRange: {
          min: Math.round(cp * 0.96),
          max: Math.round(cp * 0.99),
        },
        powerPercentageRange: { min: 96, max: 99 },
        focus:
          "Kendalikan lonjakan adrenalin awal. Buka ritme cepat namun terkontrol tanpa langsung memicu penumpukan asam laktat berlebih.",
      },
      {
        segment: "KM 1.5 - 4",
        title: "VO2 & Threshold Rhythm Lock",
        paceRangeFormatted: p2,
        powerWattsRange: {
          min: Math.round(cp * 1.00),
          max: Math.round(cp * 1.03),
        },
        powerPercentageRange: { min: 100, max: 103 },
        focus:
          "Zona inti 5K pada ambang batas VO2 max. Pertahankan kadens langkah tinggi dan pernapasan ritmis 2:2.",
      },
      {
        segment: "KM 4 - 5",
        title: "Empty the Tank Kick",
        paceRangeFormatted: p3,
        powerWattsRange: {
          min: Math.round(cp * 1.04),
          max: Math.round(cp * 1.08),
        },
        powerPercentageRange: { min: 104, max: 108 },
        focus:
          "Maksimalkan sisa kapasitas anaerobik dan dorongan energi hingga melintasi garis finish!",
      },
    ];
  } else if (raceDistanceKm <= 15) {
    // === TARGET 10K ===
    // Durasi 35-70m. 2 Sachet (1 pre-race + 1 di pertengahan rute KM 5).
    gelCount = 2;
    fuelingSchedule = [
      {
        timing: "T-15m",
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml air mineral`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 150,
        sodiumMg: 50,
        tacticalNote:
          "Konsumsi 15 menit sebelum start untuk mengisi ketersediaan glukosa darah awal tanpa lonjakan insulin prematur.",
      },
      {
        timing: "KM 5 (~25m)",
        distanceKm: 5,
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml air mineral`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 150,
        sodiumMg: 100,
        tacticalNote:
          "Water Station KM 5: Ambil air mineral dan dorong gel untuk mempertahankan ketersediaan karbohidrat di paruh akhir 10K.",
      },
      {
        timing: "KM 7.5 (~38m)",
        distanceKm: 7.5,
        action: "Hidrasi Air Mineral / Isotonik (100ml)",
        carbsGrams: 0,
        fluidMl: 100,
        sodiumMg: 80,
        tacticalNote:
          "Water Station KM 7–8: ambil sedikit hidrasi untuk menekan risiko stres termal sebelum dorongan 2 km penutup.",
      },
    ];

    const p1 = `${formatPaceString(avgSecPerKm + 8)}–${formatPaceString(avgSecPerKm + 15)} /km`;
    const p2 = `${formatPaceString(avgSecPerKm - 4)}–${formatPaceString(avgSecPerKm + 4)} /km`;
    const p3 = `${formatPaceString(avgSecPerKm - 12)}–${formatPaceString(avgSecPerKm - 4)} /km`;

    pacingStrategy = [
      {
        segment: "KM 1 - 2",
        title: "Calm Adrenaline Guard",
        paceRangeFormatted: p1,
        powerWattsRange: {
          min: Math.round(cp * 0.93),
          max: Math.round(cp * 0.96),
        },
        powerPercentageRange: { min: 93, max: 96 },
        focus:
          "Disiplin menahan nafsu agar tidak over-pace di 2 km awal. Bangun efisiensi langkah dan biarkan HR naik secara terukur.",
      },
      {
        segment: "KM 3 - 8",
        title: "Threshold Cruise Control",
        paceRangeFormatted: p2,
        powerWattsRange: {
          min: Math.round(cp * 0.96),
          max: Math.round(cp * 0.99),
        },
        powerPercentageRange: { min: 96, max: 99 },
        focus:
          "Zona jelajah utama 10K pada ambang laktat (LT2). Pertahankan kadens stabil >= 175 rpm dan ambil air di WS KM 5.",
      },
      {
        segment: "KM 9 - 10",
        title: "Empty the Tank Finish",
        paceRangeFormatted: p3,
        powerWattsRange: {
          min: Math.round(cp * 1.00),
          max: Math.round(cp * 1.04),
        },
        powerPercentageRange: { min: 100, max: 104 },
        focus:
          "Buka ayunan lengan, tingkatkan stride turnover progresif, dan kerahkan sisa daya hingga garis finish!",
      },
    ];
  } else if (raceDistanceKm <= 28) {
    // === TARGET HALF MARATHON (21.1 km) ===
    // 4 Sachet Total (1 pre-race + 3 intra-race pada KM 6, 12, 17)
    gelCount = 4;
    fuelingSchedule = [
      {
        timing: "T-15m",
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml air mineral`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 150,
        sodiumMg: 50,
        tacticalNote:
          "Konsumsi 15 menit sebelum gun start di garis start. Memastikan ketersediaan glukosa darah awal tanpa memicu insulin shock prematur.",
      },
      {
        timing: "KM 6 (~38m)",
        distanceKm: 6,
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 120–150ml air mineral`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 130,
        sodiumMg: 100,
        tacticalNote:
          "Ambil air di Water Station KM 6–7. Telan gel bersama air mineral untuk mempercepat pengosongan lambung (gastric emptying).",
      },
      {
        timing: "KM 12 (~78m)",
        distanceKm: 12,
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 120–150ml air / isotonik`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 140,
        sodiumMg: 150,
        tacticalNote:
          "Titik krusial pertengahan rute: Mencegah penurunan glikogen otot sebelum memasuki KM 14–17. Minum isotonik jika tersedia.",
      },
      {
        timing: "KM 17 (~108m)",
        distanceKm: 17,
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 100ml air mineral`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 100,
        sodiumMg: 100,
        tacticalNote:
          "Booster dorongan akhir untuk 4 kilometer penutup menuju garis finish.",
      },
    ];

    const p1 = isDefaultHm
      ? "6:40–6:55 /km"
      : `${formatPaceString(avgSecPerKm + 8)}–${formatPaceString(avgSecPerKm + 23)} /km`;
    const p2 = isDefaultHm
      ? "6:25–6:38 /km"
      : `${formatPaceString(avgSecPerKm - 7)}–${formatPaceString(avgSecPerKm + 6)} /km`;
    const p3 = isDefaultHm
      ? "6:15–6:25 /km"
      : `${formatPaceString(avgSecPerKm - 17)}–${formatPaceString(avgSecPerKm - 7)} /km`;

    pacingStrategy = [
      {
        segment: "KM 1 - 3",
        title: "Calm Adrenaline Guard",
        paceRangeFormatted: p1,
        powerWattsRange: {
          min: Math.round(cp * 0.87), // ~255 W pada CP 293
          max: Math.round(cp * 0.90), // ~264 W pada CP 293
        },
        powerPercentageRange: { min: 87, max: 90 },
        focus:
          "Jangan terbawa euforia kerumunan di kilometer awal. Biarkan denyut jantung (HR) beradaptasi secara bertahap tanpa lonjakan asam laktat prematur.",
      },
      {
        segment: "KM 4 - 17",
        title: "Sub-Threshold Cruise Control",
        paceRangeFormatted: p2,
        powerWattsRange: {
          min: Math.round(cp * 0.92), // ~270 W pada CP 293
          max: Math.round(cp * 0.94), // ~275 W pada CP 293
        },
        powerPercentageRange: { min: 92, max: 94 },
        focus:
          "Zona target utama Sub-Threshold. Pertahankan kadens stabil >= 175 rpm untuk efisiensi mekanis dan peredaman impak sendi. Ambil hidrasi di setiap water station.",
      },
      {
        segment: "KM 18 - 21.1",
        title: "Empty the Tank Finish",
        paceRangeFormatted: p3,
        powerWattsRange: {
          min: Math.round(cp * 0.94), // ~275 W pada CP 293
          max: Math.round(cp * 0.97), // ~284 W pada CP 293
        },
        powerPercentageRange: { min: 94, max: 97 },
        focus:
          "Maksimalkan sisa glikogen dan dorongan energy return sepatu balap. Buka langkah secara bertahap hingga garis finish.",
      },
    ];
  } else {
    // === TARGET FULL MARATHON (42.195 km) ===
    // 7 Sachet Total (1 pre-race + 6 intra-race di KM 7, 14, 21, 27, 33, 38)
    gelCount = 7;
    fuelingSchedule = [
      {
        timing: "T-15m",
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml air mineral`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 150,
        sodiumMg: 50,
        tacticalNote:
          "Konsumsi 15 menit sebelum start. Menjaga cadangan glikogen hati tanpa lonjakan insulin prematur.",
      },
      {
        timing: "KM 7 (~42m)",
        distanceKm: 7,
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml air mineral`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 150,
        sodiumMg: 100,
        tacticalNote:
          "Nutrisi awal: Telan gel lebih awal sebelum timbul rasa haus atau lapar untuk mencegah deplesi dini.",
      },
      {
        timing: "KM 14 (~84m)",
        distanceKm: 14,
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml air / isotonik`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 150,
        sodiumMg: 120,
        tacticalNote:
          "Ambil isotonik di Water Station KM 14 untuk mengganti elektrolit natrium yang hilang lewat keringat tropis.",
      },
      {
        timing: "KM 21 (~126m)",
        distanceKm: 21,
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml isotonik`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 150,
        sodiumMg: 150,
        tacticalNote:
          "Titik paruh rute (Halfway): Wajib isi bahan bakar secara disiplin untuk mengantisipasi paruh kedua yang menantang.",
      },
      {
        timing: "KM 27 (~165m)",
        distanceKm: 27,
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 150ml air mineral`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 150,
        sodiumMg: 120,
        tacticalNote:
          "Fase transisi menuju KM 30+: Jaga asupan karbohidrat tetap stabil agar saluran cerna terus menyalurkan energi ke otot.",
      },
      {
        timing: "KM 33 (~205m)",
        distanceKm: 33,
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 120ml air / isotonik`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 120,
        sodiumMg: 120,
        tacticalNote:
          "Benteng Anti-The Wall: Titik paling krusial untuk mencegah drop glukosa drastis (bonking/hit the wall).",
      },
      {
        timing: "KM 38 (~235m)",
        distanceKm: 38,
        action: `1 Sachet ${gelSpec.name} (${gelSpec.carbsGrams}g karbohidrat) + 100ml air mineral`,
        carbsGrams: gelSpec.carbsGrams,
        fluidMl: 100,
        sodiumMg: 80,
        tacticalNote:
          "Booster penutup: Pasokan karbohidrat cepat untuk mengamankan 4 kilometer akhir menuju garis finish.",
      },
    ];

    const p1 = `${formatPaceString(avgSecPerKm + 10)}–${formatPaceString(avgSecPerKm + 18)} /km`;
    const p2 = `${formatPaceString(avgSecPerKm - 5)}–${formatPaceString(avgSecPerKm + 5)} /km`;
    const p3 = `${formatPaceString(avgSecPerKm - 3)}–${formatPaceString(avgSecPerKm + 7)} /km`;
    const p4 = `${formatPaceString(avgSecPerKm - 10)}–${formatPaceString(avgSecPerKm)} /km`;

    pacingStrategy = [
      {
        segment: "KM 1 - 5",
        title: "Patient Aerobic Flow",
        paceRangeFormatted: p1,
        powerWattsRange: {
          min: Math.round(cp * 0.82),
          max: Math.round(cp * 0.85),
        },
        powerPercentageRange: { min: 82, max: 85 },
        focus:
          "Sangat konservatif di 5 km awal. Setiap detik yang Anda paksakan terlalu cepat di sini akan dibayar mahal di KM 32+.",
      },
      {
        segment: "KM 6 - 30",
        title: "Marathon Rhythm Engine",
        paceRangeFormatted: p2,
        powerWattsRange: {
          min: Math.round(cp * 0.85),
          max: Math.round(cp * 0.88),
        },
        powerPercentageRange: { min: 85, max: 88 },
        focus:
          "Zona jelajah maraton. Pertahankan efisiensi energi tertinggi, kadens stabil ~180 spm, dan tertib ambil gel/hidrasi tiap WS.",
      },
      {
        segment: "KM 31 - 38",
        title: "The Wall Fortress Guard",
        paceRangeFormatted: p3,
        powerWattsRange: {
          min: Math.round(cp * 0.84),
          max: Math.round(cp * 0.87),
        },
        powerPercentageRange: { min: 84, max: 87 },
        focus:
          "Titik krusial kelelahan neuromuskular (The Wall). Jaga postur tegak, ayunan tangan pendek, dan fokus mental KM-demi-KM.",
      },
      {
        segment: "KM 39 - 42.2",
        title: "Empty the Tank Marathon Finish",
        paceRangeFormatted: p4,
        powerWattsRange: {
          min: Math.round(cp * 0.87),
          max: Math.round(cp * 0.91),
        },
        powerPercentageRange: { min: 87, max: 91 },
        focus:
          "Keluarkan seluruh cadangan energi terakhir dan tuntaskan 42.195 km hingga garis finish!",
      },
    ];
  }

  const totalCarbsPlannedGrams = gelCount * gelSpec.carbsGrams;
  const raceHours = predictedTimeMinutes / 60;
  const hourlyCarbsTargetGrams = Math.round((totalCarbsPlannedGrams / raceHours) * 10) / 10;

  // 4. Evaluasi Konteks Iklim Tropis
  let heatRisk: "LOW" | "MODERATE" | "HIGH" = "HIGH";
  if (temperatureCelsius < 22 && relativeHumidityPct < 70) {
    heatRisk = "LOW";
  } else if (temperatureCelsius <= 24) {
    heatRisk = "MODERATE";
  }

  const climateNotes: string[] = [
    `Suhu pagi ${temperatureCelsius}°C dengan kelembapan ${relativeHumidityPct}%: Tingkat stres termal tergolong ${heatRisk}.`,
    "Cardiac drift wajar terjadi akibat stres termal, bukan penurunan kapasitas aerobik; jadikan RPE (5–6/10) dan target daya Watt sebagai acuan utama (§4.2).",
    "Gunakan topi/visor, basahi tengkuk dan kepala di setiap water station untuk menjaga suhu inti tubuh (core body temperature).",
  ];

  return {
    raceName,
    raceDistanceKm,
    predictedTimeMinutes,
    predictedTimeFormatted: formatMinutesToTime(predictedTimeMinutes),
    hourlyCarbsTargetGrams,
    totalCarbsPlannedGrams,
    estimatedSweatRateMlPerHour,
    targetFluidIntakeMlPerHour,
    targetSodiumMgPerHour,
    gelBrand: gelSpec.name,
    gelCount,
    fuelingSchedule,
    pacingStrategy,
    climateContext: {
      temperatureCelsius,
      relativeHumidityPct,
      heatRisk,
      notes: climateNotes,
    },
  };
}
