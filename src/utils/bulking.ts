/**
 * Pure Engine: Runner Lean Bulking & Dynamic Nutrition Planner.
 *
 * Menghitung kebutuhan kalori harian dinamis (BMR Mifflin-St Jeor + Office NEAT + Lari Intervals.icu),
 * makronutrisi hibrida (Protein 2.0-2.2 g/kg, Lemak 1.0-1.2 g/kg, Karbohidrat fleksibel),
 * Power-to-Weight Guardrail (mempertahankan W/kg terhadap kenaikan bobot),
 * serta program gym Upper Hypertrophy + Lower Neural (Steve Magness & McGill Big 3).
 */

export interface BulkingInput {
  weightKg: number;
  heightCm?: number;
  age?: number;
  gender?: "male" | "female";
  criticalPowerWatts?: number;
  dailyRunningBurnKcal?: number;
  dayType?: "REST" | "EASY_RUN" | "QUALITY_SUB_T" | "LONG_RUN";
  gymSessionPlanned?: boolean;
  /** Pilih sesi gym eksplisit (Selasa=GYM_A, Jumat=GYM_B, Sabtu=GYM_C). Default ditentukan dari dayType. */
  gymSessionCode?: "GYM_A" | "GYM_B" | "GYM_C";
  targetSurplusKcal?: number;
  targetWeightKg?: number;
}

export interface MacroTarget {
  proteinGrams: number;
  fatGrams: number;
  carbsGrams: number;
  proteinKcal: number;
  fatKcal: number;
  carbsKcal: number;
}

export interface PowerToWeightTarget {
  currentWeightKg: number;
  currentCpWatts: number;
  currentWPerKg: number;
  targetWeightKg: number;
  projectedMinCpWatts: number;
  status: "OPTIMAL" | "ACTION_REQUIRED";
  note: string;
}

export interface GymExercise {
  name: string;
  sets: number;
  reps: string;
  rpe: string;
  notes: string;
}

export interface GymSessionPreset {
  code: "GYM_A" | "GYM_B" | "GYM_C";
  title: string;
  focus: string;
  durationMinutes: number;
  estimatedBurnKcal: number;
  exercises: GymExercise[];
  legSafeguardNote: string;
}

export interface MealPlanTemplateItem {
  meal: string;
  timing: string;
  estimatedKcal: number;
  proteinGrams: number;
  description: string;
  isLiquidBooster?: boolean;
}

export interface BulkingPlanResult {
  bmrKcal: number;
  baselineTdeeKcal: number;
  runningBurnKcal: number;
  gymBurnKcal: number;
  totalExpenditureKcal: number;
  targetSurplusKcal: number;
  targetIntakeKcal: number;
  dayType: "REST" | "EASY_RUN" | "QUALITY_SUB_T" | "LONG_RUN";
  macros: MacroTarget;
  weeklyWeightGainRateKg: number;
  powerToWeight: PowerToWeightTarget;
  suggestedGymSession?: GymSessionPreset;
  mealStructure: MealPlanTemplateItem[];
  guardrails: {
    mTorAmpkShield: string;
    domsProtection: string;
    liquidBoosterRule: string;
  };
}

export const GYM_SESSIONS: Record<"GYM_A" | "GYM_B" | "GYM_C", GymSessionPreset> = {
  GYM_A: {
    code: "GYM_A",
    title: "Gym A: Upper Push Hypertrophy + Lower Neural (Steve Magness)",
    focus: "Chest, Shoulders, Triceps Hypertrophy + Lower-Body Neural Drive",
    durationMinutes: 45,
    estimatedBurnKcal: 230,
    exercises: [
      {
        name: "Incline DB Bench Press",
        sets: 3,
        reps: "8-10 reps",
        rpe: "8/10",
        notes: "Fokus kontraksi dada atas; kontrol tempo turun 2-3 detik.",
      },
      {
        name: "Seated DB Overhead Shoulder Press",
        sets: 3,
        reps: "8-10 reps",
        rpe: "8/10",
        notes: "Bahu anterior & lateral; core tetap kencang bertumpu di sandaran kursi.",
      },
      {
        name: "DB Lateral Raise + Cable Tricep Pushdown",
        sets: 3,
        reps: "12-15 reps (Superset)",
        rpe: "8.5/10",
        notes: "Membentuk bahu lebar dan lengan atas tanpa beban aksial tulang belakang.",
      },
      {
        name: "Trap Bar / Romanian Deadlift (Magness Neural)",
        sets: 3,
        reps: "4 reps",
        rpe: "7.5/10",
        notes: "Beban berat terkontrol, konsentrik eksplosif, STOP jauh sebelum gagal (anti-DOMS).",
      },
      {
        name: "McGill Big 3 (Curl-Up, Side Bridge, Bird-Dog)",
        sets: 1,
        reps: "Piramida 6-4-2 reps (tahan 7s)",
        rpe: "Teknik murni",
        notes: "Proteksi lumbar dan stabilitas postur pelari.",
      },
    ],
    legSafeguardNote:
      "Kaki dibatasi strictly 3x4 reps neural. DILARANG squat/leg press hingga failure demi melindungi kualitas lari Sub-T.",
  },
  GYM_B: {
    code: "GYM_B",
    title: "Gym B: Upper Pull (V-Taper) + Pelvic & Tendon Armor",
    focus: "Back Width, Biceps Hypertrophy + Runner Tendon Stiffness",
    durationMinutes: 45,
    estimatedBurnKcal: 230,
    exercises: [
      {
        name: "Lat Pulldown / Neutral Grip Pull-Up",
        sets: 3,
        reps: "8-10 reps",
        rpe: "8/10",
        notes: "Pelebaran sayap lats (V-taper) untuk proporsi atletis di tinggi 180 cm.",
      },
      {
        name: "Chest-Supported Machine / DB Row",
        sets: 3,
        reps: "10-12 reps",
        rpe: "8/10",
        notes: "Penebalan punggung tengah dan romboid penopang postur tegak saat lari.",
      },
      {
        name: "Face Pulls + Incline DB Bicep Curl",
        sets: 3,
        reps: "12-15 reps",
        rpe: "8/10",
        notes: "Kesehatan rotator cuff bahu dan hipertrofi bicep.",
      },
      {
        name: "Single-Leg RDL (Pelvic Armor)",
        sets: 2,
        reps: "8 reps/sisi",
        rpe: "7/10",
        notes: "Stabilitas panggul dan penguatan eksentrik hamstring pelari.",
      },
      {
        name: "Soleus Isometric Wall Hold (Bent-Knee)",
        sets: 2,
        reps: "Tahan 30-40 detik",
        rpe: "Isometrik",
        notes: "Merangsang kolagen tendon Achilles tanpa merusak serat otot aktif.",
      },
      {
        name: "McGill Big 3",
        sets: 1,
        reps: "Piramida 6-4-2 reps (tahan 7s)",
        rpe: "Teknik murni",
        notes: "Stabilisasi spinal.",
      },
    ],
    legSafeguardNote:
      "Hanya gerakan stabilitas unilateral dan tendon isometrik. Tanpa kontraksi eksentrik berat pada quad/betis.",
  },
  GYM_C: {
    code: "GYM_C",
    title: "Gym C: Pure Upper Hypertrophy Pump & Arms",
    focus: "Chest, Upper Back, Delts & Arms Hypertrophy (Zero Legs)",
    durationMinutes: 40,
    estimatedBurnKcal: 200,
    exercises: [
      {
        name: "Flat DB / Machine Chest Press",
        sets: 3,
        reps: "10-12 reps",
        rpe: "8.5/10",
        notes: "Hipertrofi dada menyeluruh.",
      },
      {
        name: "Seated Cable Row / Straight-Arm Pulldown",
        sets: 3,
        reps: "10-12 reps",
        rpe: "8/10",
        notes: "Ketebalan punggung dan isolasi lats.",
      },
      {
        name: "Cable / DB Lateral Raise Dropset",
        sets: 3,
        reps: "12 + 8 reps dropset",
        rpe: "9/10",
        notes: "Round deltoid pump.",
      },
      {
        name: "DB Hammer Curl + Overhead Tricep Extension",
        sets: 3,
        reps: "12-15 reps (Superset)",
        rpe: "8.5/10",
        notes: "Penebalan lengan atas (brachialis & triceps long head).",
      },
    ],
    legSafeguardNote:
      "ZERO beban pada kaki/pinggul. Kaki diistirahatkan 100% untuk Long Run aerobik hari Minggu.",
  },
};

export function calculateBulkingPlan(input: BulkingInput): BulkingPlanResult {
  const {
    weightKg,
    heightCm = 180,
    age = 23,
    gender = "male",
    criticalPowerWatts = 241,
    dayType = "REST",
    dailyRunningBurnKcal,
    gymSessionPlanned = false,
    gymSessionCode,
    targetSurplusKcal = 400,
    targetWeightKg = 67,
  } = input;

  if (weightKg <= 0) throw new RangeError("weightKg harus bilangan positif > 0.");
  if (heightCm <= 0) throw new RangeError("heightCm harus bilangan positif > 0.");
  if (age <= 0) throw new RangeError("age harus bilangan positif > 0.");

  // 1. BMR Mifflin-St Jeor
  const genderConstant = gender === "male" ? 5 : -161;
  const rawBmr = 10 * weightKg + 6.25 * heightCm - 5 * age + genderConstant;
  const bmrKcal = Math.round(rawBmr);

  // 2. Baseline Office NEAT TDEE (1.375 desk work + commuting)
  const baselineTdeeKcal = Math.round(bmrKcal * 1.375);

  // 3. Running Energy Expenditure (Default derived from dayType if not provided)
  let runningBurn = dailyRunningBurnKcal;
  if (runningBurn === undefined) {
    switch (dayType) {
      case "REST":
        runningBurn = 0;
        break;
      case "EASY_RUN":
        runningBurn = Math.round(weightKg * 7.0); // ~7 km Easy Run
        break;
      case "QUALITY_SUB_T":
        runningBurn = Math.round(weightKg * 9.0); // ~9 km Sub-T session with Warmup/Cooldown
        break;
      case "LONG_RUN":
        runningBurn = Math.round(weightKg * 13.0); // ~13 km (75-80m Long Run)
        break;
    }
  }

  // 4. Gym Energy Expenditure
  let gymBurnKcal = 0;
  let suggestedGymSession: GymSessionPreset | undefined;

  if (gymSessionPlanned) {
    if (gymSessionCode) {
      suggestedGymSession = GYM_SESSIONS[gymSessionCode];
    } else if (dayType === "QUALITY_SUB_T") {
      suggestedGymSession = GYM_SESSIONS.GYM_A; // Default Gym A pada hari Quality Sub-T
    } else if (dayType === "REST" || dayType === "EASY_RUN") {
      suggestedGymSession = GYM_SESSIONS.GYM_C; // Upper-only, nol beban kaki
    }
    // LONG_RUN: tanpa gym agar kaki segar.
    if (suggestedGymSession) gymBurnKcal = suggestedGymSession.estimatedBurnKcal;
  }

  const totalExpenditureKcal = baselineTdeeKcal + runningBurn + gymBurnKcal;
  const targetIntakeKcal = totalExpenditureKcal + targetSurplusKcal;

  // 5. Macro Partitioning (Hybrid Runner)
  // Protein: 2.1 g/kg
  const proteinGrams = Math.round(weightKg * 2.1);
  const proteinKcal = proteinGrams * 4;

  // Fat: 1.1 g/kg
  const fatGrams = Math.round(weightKg * 1.1);
  const fatKcal = fatGrams * 9;

  // Carbohydrates: Remainder
  const remainingKcal = Math.max(0, targetIntakeKcal - (proteinKcal + fatKcal));
  const carbsGrams = Math.round(remainingKcal / 4);
  const carbsKcal = carbsGrams * 4;

  // 6. Power to Weight Calculation
  const currentWPerKg = Math.round((criticalPowerWatts / weightKg) * 100) / 100;
  const projectedMinCpWatts = Math.round(currentWPerKg * targetWeightKg);
  const powerNote =
    projectedMinCpWatts > criticalPowerWatts
      ? `Saat BB mencapai ${targetWeightKg} kg, target Critical Power perlu berprogresi ke minimal ${projectedMinCpWatts} W (+${projectedMinCpWatts - criticalPowerWatts} W) agar daya tahan menanjak & kecepatan lari tetap konstan (${currentWPerKg} W/kg).`
      : `Rasio Power-to-weight ${currentWPerKg} W/kg tetap aman.`;

  // 7. Meal Structure (5-Meal: 3 Solid + 2 Boosters)
  const mealStructure: MealPlanTemplateItem[] = [
    {
      meal: "Pre-Run Subuh",
      timing: "04:45 WIB",
      estimatedKcal: 200,
      proteinGrams: 4,
      description: "1 Pisang Cavendish / 2 Lembar Roti Tawar Gandum + 1 sdt Madu + 200ml air hangat.",
    },
    {
      meal: "Post-Run & Sarapan Kantor (Liquid Booster #1)",
      timing: "07:15 WIB",
      estimatedKcal: Math.round(targetIntakeKcal * 0.22),
      proteinGrams: Math.round(proteinGrams * 0.28),
      description:
        "Blender / Shake: 250ml Susu UHT Full Cream + 1 scoop Whey (25g P) + 40g Instant Oats + 1 sdm Selai Kacang + 1 Pisang.",
      isLiquidBooster: true,
    },
    {
      meal: "Makan Siang Kantor (Double Protein Warteg/Padang)",
      timing: "12:30 WIB",
      estimatedKcal: Math.round(targetIntakeKcal * 0.28),
      proteinGrams: Math.round(proteinGrams * 0.3),
      description:
        "Nasi putih 1.5 centong + Dada/Paha Ayam Bakar + 2 Telur Balado/Dadar + Tempe Orek/Tahu + Sayur Bayam/Capcay.",
    },
    {
      meal: "Snack Sore Pre-Gym / Pulang Kantor (Liquid Booster #2)",
      timing: "16:45 WIB",
      estimatedKcal: Math.round(targetIntakeKcal * 0.15),
      proteinGrams: Math.round(proteinGrams * 0.15),
      description:
        "1 Onigiri / Roti Isi Minimarket + 250ml Susu Tinggi Protein (Ultra Milk / MilkLife / Cimory) + 1 Pisang.",
      isLiquidBooster: true,
    },
    {
      meal: "Makan Malam Post-Gym & Recovery",
      timing: "19:45 WIB",
      estimatedKcal: Math.round(targetIntakeKcal * 0.28),
      proteinGrams: Math.round(proteinGrams * 0.27),
      description:
        "Nasi putih 1.5 centong + Daging Sapi / Ikan / Ayam (Double Protein) + Sayur tumis. Jika kalori masih kurang, tambahkan 1 gelas susu hangat sebelum tidur.",
    },
  ];

  return {
    bmrKcal,
    baselineTdeeKcal,
    runningBurnKcal: runningBurn,
    gymBurnKcal,
    totalExpenditureKcal,
    targetSurplusKcal,
    targetIntakeKcal,
    dayType,
    macros: {
      proteinGrams,
      fatGrams,
      carbsGrams,
      proteinKcal,
      fatKcal,
      carbsKcal,
    },
    weeklyWeightGainRateKg: 0.3,
    powerToWeight: {
      currentWeightKg: weightKg,
      currentCpWatts: criticalPowerWatts,
      currentWPerKg,
      targetWeightKg,
      projectedMinCpWatts,
      status: "OPTIMAL",
      note: powerNote,
    },
    suggestedGymSession,
    mealStructure,
    guardrails: {
      mTorAmpkShield:
        "Jeda minimal 4-6 jam antara lari sub-threshold pagi dan gym sore untuk menghindari interferensi sinyal AMPK terhadap sintesis protein otot mTOR.",
      domsProtection:
        "Latihan kaki dibatasi pada adaptasi saraf Steve Magness (Heavy Neural 3-5 reps, RPE <= 8). Dilarang squat/leg extension hingga failure agar terbebas dari DOMS.",
      liquidBoosterRule:
        "Gunakan 2x Liquid Calorie Shake per hari untuk memenuhi 1.100-1.300 kkal tanpa membebani kapasitas lambung pelari saat bekerja di kantor.",
    },
  };
}
