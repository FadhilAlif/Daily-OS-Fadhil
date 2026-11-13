import type { BulkingPlanResult } from "@engine/utils/bulking";
import type { enrichDailyLogWithServerMath } from "@/server/services/bulking.service";
import type { getLiveOrFallbackReadiness } from "@/server/services/telemetry.service";

export type DayType = "REST" | "EASY_RUN" | "QUALITY_SUB_T" | "LONG_RUN";
export type GymSessionCode = "NONE" | "GYM_A" | "GYM_B" | "GYM_C";
export type ItemCategory = "MEAL_SOLID" | "LIQUID_BOOSTER" | "GYM_SET";
export type ReadinessStatus = "GREEN" | "YELLOW" | "RED";

/** Response shapes are derived from the server so client and API cannot drift apart. */
export type DailyLogView = ReturnType<typeof enrichDailyLogWithServerMath>;
export type ReadinessView = Awaited<ReturnType<typeof getLiveOrFallbackReadiness>>;

export interface AthleteView {
  athleteId: number;
  intervalsId: string;
  fullName: string;
  heightCm: number;
  baselineWeightKg: number;
  targetWeightKg: number;
  criticalPowerW: number;
  lthrBpm: number;
  maxHrBpm: number;
  wattsPerKg: number;
  projectedMinCpWatts: number;
  powerToWeightStatus: "OPTIMAL" | "ACTION_REQUIRED";
}

export interface AthleteResponse {
  needsOnboarding: boolean;
  athlete: AthleteView | null;
  defaultPlan?: BulkingPlanResult;
}

export interface DailyLogsResponse {
  success: true;
  logs: DailyLogView[];
}

export interface LogItemInput {
  itemCategory: ItemCategory;
  itemName: string;
  quantity: number;
  unitKcalOrLoad: number;
  proteinGrams: number;
}
