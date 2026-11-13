export const athlete = {
  name: "Fadhil Alif",
  weightKg: 63.2,
  targetWeightKg: 67,
  criticalPowerW: 241,
  // Server-computed values (mock). Never derive these in the browser (AGENTS.md §3.B).
  wattsPerKg: 3.81,
  caloriePercent: 59,
  proteinPercent: 69,
  readiness: 86,
  status: "GREEN" as const,
  ctl: 72,
  atl: 68,
  tsb: 4,
  sleepHours: 7.4,
  rhr: 48,
  caloriesConsumed: 1840,
  calorieTarget: 3120,
  proteinConsumed: 92,
  proteinTarget: 133,
};

export const flags = [
  "Tidur buruk (<6 jam)",
  "RHR naik >7 bpm dari baseline",
  "HRV turun signifikan",
  "Kaki terasa berat / kelelahan tinggi",
  "Nyeri muskuloskeletal",
];

export const workout = {
  title: "Sub-Threshold · 6 × 6 menit",
  type: "QUALITY RUN",
  duration: "62 menit",
  target: "205–224 W",
  recovery: "2 menit jog",
  note: "Heat adjusted · jaga power, pantau HR",
};

export const recentLogs = [
  { date: "Hari ini", type: "QUALITY_SUB_T", weight: "63.2 kg", calories: "1,840 / 3,120", protein: "92 / 133 g" },
  { date: "Kemarin", type: "EASY_RUN", weight: "63.1 kg", calories: "2,940 / 3,050", protein: "128 / 133 g" },
  { date: "12 Nov", type: "REST", weight: "63.0 kg", calories: "2,620 / 2,750", protein: "131 / 133 g" },
];

export const meals = [
  { name: "Pre-run snack", detail: "Pisang + roti", kcal: 260, done: true },
  { name: "Liquid Booster 1", detail: "UHT · whey · oat · peanut butter", kcal: 560, done: true },
  { name: "Lunch", detail: "Nasi · ayam · sayur", kcal: 680, done: true },
  { name: "Liquid Booster 2", detail: "Susu · pisang · oat", kcal: 520, done: false },
  { name: "Dinner", detail: "Nasi · protein · sayur", kcal: 720, done: false },
];

export const gymSessions = {
  GYM_A: ["DB bench press · 4 × 8", "Incline DB press · 3 × 10", "Split squat · 3 × 4 / sisi", "McGill Big 3 · 6-4-2"],
  GYM_B: ["Chest-supported row · 4 × 8", "Lat pulldown · 3 × 10", "Hip hinge · 3 × 4", "McGill Big 3 · 6-4-2"],
  GYM_C: ["Lateral raise · 3 × 15", "Cable fly · 3 × 12", "Biceps + triceps · 3 × 12", "McGill Big 3 · 6-4-2"],
};
