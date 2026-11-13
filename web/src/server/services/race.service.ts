import { z } from "zod";
import {
  predictRaceTime,
  calculateTaperPlan,
  type RacePredictionOutput,
  type TaperPlanOutput,
} from "@engine/utils/race";
import {
  calculateRaceFuelingPlan,
  EJ_SPORT_GEL,
  type RaceFuelingPlanResult,
} from "@engine/utils/fueling";
import { calculatePaceZones, type PaceZones } from "@engine/utils/vdot";
import { getPrimaryAthlete } from "../repositories/athlete.repo";
import { getLiveOrFallbackReadiness } from "./telemetry.service";
import { shiftIsoDate, todayJakarta } from "@/lib/date";

export const RaceQuerySchema = z.object({
  distanceKm: z.number().positive().default(21.0975),
  vdot: z.number().min(30).max(85).default(32.0),
  temperatureCelsius: z.number().min(10).max(45).default(26),
  relativeHumidityPct: z.number().min(20).max(100).default(80),
  raceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type RaceQueryInput = z.infer<typeof RaceQuerySchema>;

export interface RaceCommandResult {
  athlete: {
    fullName: string;
    criticalPowerW: number;
    baselineWeightKg: number;
    wattsPerKg: number;
    vdot: number;
  };
  telemetry: {
    ctl: number;
    tsb: number;
    readinessScore: number;
    readinessStatus: "GREEN" | "YELLOW" | "RED";
  };
  raceTarget: {
    raceName: string;
    distanceKm: number;
    raceDate: string;
  };
  prediction: RacePredictionOutput;
  fueling: RaceFuelingPlanResult;
  taper: TaperPlanOutput;
  paceZones: PaceZones;
}

export async function getRaceCommandPlan(
  rawInput: Partial<RaceQueryInput> = {},
): Promise<RaceCommandResult> {
  const input = RaceQuerySchema.parse(rawInput);
  const athlete = await getPrimaryAthlete();

  const criticalPowerW = athlete?.criticalPowerW ?? 241;
  const baselineWeightKg = Number(athlete?.baselineWeightKg ?? 63.2);
  const fullName = athlete?.fullName ?? "FadhilAlif";
  const wattsPerKg = Number((criticalPowerW / (baselineWeightKg || 1)).toFixed(2));
  const vdot = input.vdot;

  // Fetch current fitness telemetry (CTL, TSB, readiness)
  let ctl = 48;
  let tsb = 2;
  let readinessScore = 86;
  let readinessStatus: "GREEN" | "YELLOW" | "RED" = "GREEN";

  try {
    const today = todayJakarta();
    const readiness = await getLiveOrFallbackReadiness(today);
    ctl = readiness.ctl;
    tsb = readiness.tsb;
    readinessScore = readiness.readinessScore;
    readinessStatus = readiness.status;
  } catch {
    // Graceful fallback to default values
  }

  // 1. Predict Race Finish Time based on VDOT + CTL/TSB adjustments
  const prediction = predictRaceTime({
    vdot,
    targetDistanceKm: input.distanceKm,
    ctl,
    tsb,
  });

  const predictedMinutes = Math.max(1, Math.round(prediction.predictedTimeSeconds / 60));

  // 2. Dynamic Race Day Fueling Plan (EJ Sport Gel 30g Carbs + Tropical Climate context)
  const raceName =
    input.distanceKm >= 42
      ? "Target Full Marathon"
      : input.distanceKm >= 21
        ? "Target Half Marathon (21.1 km)"
        : input.distanceKm >= 10
          ? "Target 10K Road Race"
          : "Target 5K Road Race";

  const fueling = calculateRaceFuelingPlan({
    raceName,
    raceDistanceKm: input.distanceKm,
    predictedTimeMinutes: predictedMinutes,
    athleteWeightKg: baselineWeightKg,
    temperatureCelsius: input.temperatureCelsius,
    relativeHumidityPct: input.relativeHumidityPct,
    criticalPowerWatts: criticalPowerW,
    vdot,
    gelSpec: EJ_SPORT_GEL,
  });

  // 3. Taper Plan Generator (14-day A-Taper toward race date)
  const targetRaceDate = input.raceDate ?? shiftIsoDate(todayJakarta(), 14);
  const taper = calculateTaperPlan({
    raceDate: targetRaceDate,
    currentCtl: ctl,
    currentTsb: tsb,
    taperWeeks: 2,
    racePriority: "A",
  });

  // 4. Jack Daniels Pace Zones for Reference
  const paceZones = calculatePaceZones(vdot);

  return {
    athlete: {
      fullName,
      criticalPowerW,
      baselineWeightKg,
      wattsPerKg,
      vdot,
    },
    telemetry: {
      ctl,
      tsb,
      readinessScore,
      readinessStatus,
    },
    raceTarget: {
      raceName,
      distanceKm: input.distanceKm,
      raceDate: targetRaceDate,
    },
    prediction,
    fueling,
    taper,
    paceZones,
  };
}
