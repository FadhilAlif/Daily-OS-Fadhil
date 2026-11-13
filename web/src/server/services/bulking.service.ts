import { z } from "zod";
import { calculateBulkingPlan } from "@engine/utils/bulking";
import { todayJakarta } from "@/lib/date";
import { getAthleteById, getPrimaryAthlete } from "../repositories/athlete.repo";
import {
  createDailyLogAtomic,
  deleteDailyLogAtomic,
  getDailyLogById,
  getDailyLogByNo,
  listDailyLogs,
  updateDailyLogAtomic,
  type DailyLogFilter,
} from "../repositories/daily-log.repo";

export const DailyLogItemSchema = z.object({
  itemCategory: z.enum(["MEAL_SOLID", "LIQUID_BOOSTER", "GYM_SET"]),
  itemName: z.string().min(3, "Nama menu/gerakan minimal 3 karakter").max(100),
  quantity: z.number().int("BR-04: Quantity wajib bilangan bulat").gt(0, "BR-04: Quantity wajib > 0"),
  unitKcalOrLoad: z.number().gt(0, "BR-05: Kalori/beban wajib > 0"),
  proteinGrams: z.number().min(0, "Protein tidak boleh negatif").default(0),
});

export const CreateDailyLogSchema = z.object({
  logNo: z.string().min(3).max(20),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal wajib YYYY-MM-DD"),
  athleteId: z.number().int().positive(),
  dayType: z.enum(["REST", "EASY_RUN", "QUALITY_SUB_T", "LONG_RUN"]),
  gymSessionCode: z.enum(["NONE", "GYM_A", "GYM_B", "GYM_C"]).default("NONE"),
  morningWeightKg: z.number().gt(0),
  runningBurnKcal: z.number().int().min(0).default(0),
  targetSurplusKcal: z.number().int().default(400),
  remarks: z.string().max(500).optional(),
  items: z.array(DailyLogItemSchema).min(1, "BR-03: Wajib memiliki minimal 1 line item makanan/latihan"),
});

export class BusinessRuleError extends Error {
  statusCode: number;
  errors: string[];
  constructor(message: string, errors: string[], statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

function getTodayJakartaIso(): string {
  return todayJakarta();
}

export function enrichDailyLogWithServerMath(
  record: NonNullable<Awaited<ReturnType<typeof getDailyLogById>>>,
  athlete: NonNullable<Awaited<ReturnType<typeof getPrimaryAthlete>>>
) {
  const { header, items } = record;
  const weightKg = Number(header.morningWeightKg);
  const heightCm = athlete.heightCm;
  const criticalPowerWatts = athlete.criticalPowerW;
  const targetWeightKg = Number(athlete.targetWeightKg);

  // BR-07: Server-side subtotal per line item
  const enrichedItems = items.map((item) => {
    const unitVal = Number(item.unitKcalOrLoad);
    const proteinVal = Number(item.proteinGrams);
    const isNutrition =
      item.itemCategory === "MEAL_SOLID" || item.itemCategory === "LIQUID_BOOSTER";
    return {
      ...item,
      unitKcalOrLoad: unitVal,
      proteinGrams: proteinVal,
      subtotalKcal: isNutrition ? Math.round(item.quantity * unitVal) : 0,
      subtotalLoadKg: !isNutrition ? Number((item.quantity * unitVal).toFixed(2)) : 0,
      subtotalProteinGrams: isNutrition
        ? Number((item.quantity * proteinVal).toFixed(1))
        : 0,
    };
  });

  // BR-08: Server-side Grand Total & Dynamic Target via Shared Pure Engine
  const grandTotalKcal = enrichedItems.reduce((acc, i) => acc + i.subtotalKcal, 0);
  const grandTotalProteinGrams = Number(
    enrichedItems.reduce((acc, i) => acc + i.subtotalProteinGrams, 0).toFixed(1)
  );

  const gymPlanned = header.gymSessionCode !== "NONE";
  const bulkingPlan = calculateBulkingPlan({
    weightKg,
    heightCm,
    criticalPowerWatts,
    dailyRunningBurnKcal: header.runningBurnKcal,
    dayType: header.dayType as "REST" | "EASY_RUN" | "QUALITY_SUB_T" | "LONG_RUN",
    gymSessionPlanned: gymPlanned,
    gymSessionCode: gymPlanned
      ? (header.gymSessionCode as "GYM_A" | "GYM_B" | "GYM_C")
      : undefined,
    targetSurplusKcal: header.targetSurplusKcal,
    targetWeightKg,
  });

  const calorieProgressPercent = Math.min(
    100,
    Math.round((grandTotalKcal / bulkingPlan.targetIntakeKcal) * 100)
  );
  const proteinProgressPercent = Math.min(
    100,
    Math.round((grandTotalProteinGrams / bulkingPlan.macros.proteinGrams) * 100)
  );

  return {
    header: {
      ...header,
      morningWeightKg: weightKg,
    },
    items: enrichedItems,
    summary: {
      grandTotalKcal,
      grandTotalProteinGrams,
      targetIntakeKcal: bulkingPlan.targetIntakeKcal,
      targetProteinGrams: bulkingPlan.macros.proteinGrams,
      totalExpenditureKcal: bulkingPlan.totalExpenditureKcal,
      calorieProgressPercent,
      proteinProgressPercent,
      wattsPerKg: bulkingPlan.powerToWeight.currentWPerKg,
      powerToWeightStatus: bulkingPlan.powerToWeight.status,
    },
    bulkingPlan,
  };
}

export async function getFilteredDailyLogsWithSummary(filter: DailyLogFilter = {}) {
  const athlete = await getPrimaryAthlete();
  if (!athlete) {
    return [];
  }
  const rows = await listDailyLogs(filter);
  return rows.map((row) => enrichDailyLogWithServerMath(row, athlete));
}

export async function createValidatedDailyLog(rawPayload: unknown) {
  const parsed = CreateDailyLogSchema.safeParse(rawPayload);
  if (!parsed.success) {
    throw new BusinessRuleError(
      "Validasi input log harian gagal",
      parsed.error.issues.map((i) => i.message),
      400
    );
  }
  const data = parsed.data;

  // BR-02: Log date <= TODAY
  const today = getTodayJakartaIso();
  if (data.logDate > today) {
    throw new BusinessRuleError(
      "BR-02: Tanggal log tidak boleh di masa depan",
      [`Tanggal log (${data.logDate}) melebihi hari ini (${today})`],
      400
    );
  }

  // BR-01: Unique logNo check
  const existing = await getDailyLogByNo(data.logNo);
  if (existing) {
    throw new BusinessRuleError(
      "BR-01: Nomor dokumen log sudah terdaftar",
      [`Log dengan nomor ${data.logNo} sudah ada di database`],
      409
    );
  }

  // BR-06: Athlete ID must exist
  const athlete = await getAthleteById(data.athleteId);
  if (!athlete) {
    throw new BusinessRuleError(
      "BR-06: Profil atlet tidak ditemukan",
      [`Athlete ID ${data.athleteId} tidak terdaftar di ATHLETE_MASTER`],
      400
    );
  }

  const created = await createDailyLogAtomic(
    {
      logNo: data.logNo,
      logDate: data.logDate,
      athleteId: data.athleteId,
      dayType: data.dayType,
      gymSessionCode: data.gymSessionCode,
      morningWeightKg: data.morningWeightKg,
      runningBurnKcal: data.runningBurnKcal,
      targetSurplusKcal: data.targetSurplusKcal,
      remarks: data.remarks,
    },
    data.items
  );

  return enrichDailyLogWithServerMath(created, athlete);
}

export async function updateValidatedDailyLog(logId: number, rawPayload: unknown) {
  const UpdateSchema = CreateDailyLogSchema.omit({ logNo: true });
  const parsed = UpdateSchema.safeParse(rawPayload);
  if (!parsed.success) {
    throw new BusinessRuleError(
      "Validasi perubahan log harian gagal",
      parsed.error.issues.map((i) => i.message),
      400
    );
  }
  const data = parsed.data;

  const today = getTodayJakartaIso();
  if (data.logDate > today) {
    throw new BusinessRuleError(
      "BR-02: Tanggal log tidak boleh di masa depan",
      [`Tanggal log (${data.logDate}) melebihi hari ini (${today})`],
      400
    );
  }

  const athlete = await getAthleteById(data.athleteId);
  if (!athlete) {
    throw new BusinessRuleError(
      "BR-06: Profil atlet tidak ditemukan",
      [`Athlete ID ${data.athleteId} tidak terdaftar di ATHLETE_MASTER`],
      400
    );
  }

  const updated = await updateDailyLogAtomic(
    logId,
    {
      logDate: data.logDate,
      athleteId: data.athleteId,
      dayType: data.dayType,
      gymSessionCode: data.gymSessionCode,
      morningWeightKg: data.morningWeightKg,
      runningBurnKcal: data.runningBurnKcal,
      targetSurplusKcal: data.targetSurplusKcal,
      remarks: data.remarks,
    },
    data.items
  );

  if (!updated) {
    throw new BusinessRuleError("Log harian tidak ditemukan", [`ID ${logId} tidak ada`], 404);
  }

  return enrichDailyLogWithServerMath(updated, athlete);
}

export async function removeDailyLog(logId: number) {
  const ok = await deleteDailyLogAtomic(logId);
  if (!ok) {
    throw new BusinessRuleError("Log harian tidak ditemukan", [`ID ${logId} tidak ada`], 404);
  }
  return true;
}
