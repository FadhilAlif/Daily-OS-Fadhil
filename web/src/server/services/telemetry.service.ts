import { calculateReadinessScore } from "@engine/utils/readiness";
import { todayJakarta } from "@/lib/date";
import { intervalsApiRequest } from "./intervals-client";
import { getPrimaryAthlete } from "../repositories/athlete.repo";

interface IntervalsSportSetting {
  types?: string[];
  ftp?: number;
  lthr?: number;
  max_hr?: number;
}

interface IntervalsAthleteResponse {
  id?: string;
  name?: string;
  icu_weight?: number;
  weight?: number;
  sportSettings?: IntervalsSportSetting[];
}

interface IntervalsWellnessRecord {
  id: string;
  ctl?: number;
  atl?: number;
  rampRate?: number;
  weight?: number;
  restingHR?: number;
  hrv?: number;
  sleepSecs?: number;
  sleepScore?: number;
}

async function fetchIntervalsJson<T>(endpointPath: string): Promise<T> {
  return intervalsApiRequest<T>(endpointPath);
}

export async function pullProfileFromIntervalsIcu(overrideIntervalsId?: string) {
  const existing = await getPrimaryAthlete();
  const intervalsId =
    overrideIntervalsId ||
    existing?.intervalsId ||
    process.env.INTERVALS_ATHLETE_ID ||
    "i655618";

  const raw = await fetchIntervalsJson<IntervalsAthleteResponse>(`/athlete/${intervalsId}`);

  const runSport =
    raw.sportSettings?.find((s: IntervalsSportSetting) => s.types?.includes("Run")) ??
    raw.sportSettings?.[0];

  return {
    intervalsId: raw.id || intervalsId,
    fullName: raw.name || existing?.fullName || "Fadhil Alif",
    heightCm: existing?.heightCm || 180,
    baselineWeightKg: Number(raw.icu_weight ?? raw.weight ?? existing?.baselineWeightKg ?? 63.2),
    targetWeightKg: Number(existing?.targetWeightKg ?? 67.0),
    criticalPowerW: Number(runSport?.ftp ?? existing?.criticalPowerW ?? 241),
    lthrBpm: Number(runSport?.lthr ?? existing?.lthrBpm ?? 179),
    maxHrBpm: Number(runSport?.max_hr ?? existing?.maxHrBpm ?? 204),
  };
}

export async function getLiveOrFallbackReadiness(dateIso?: string) {
  const athlete = await getPrimaryAthlete();
  const intervalsId = athlete?.intervalsId || process.env.INTERVALS_ATHLETE_ID || "i655618";
  const targetDate = dateIso || todayJakarta();

  try {
    const wellness = await fetchIntervalsJson<IntervalsWellnessRecord>(
      `/athlete/${intervalsId}/wellness/${targetDate}`
    );

    const ctl = Number(wellness.ctl ?? 72);
    const atl = Number(wellness.atl ?? 68);
    const tsb = Number((ctl - atl).toFixed(1));
    const acwr = ctl > 0 ? Number((atl / ctl).toFixed(2)) : 1.0;
    const sleepHours = wellness.sleepSecs
      ? Number((wellness.sleepSecs / 3600).toFixed(1))
      : 7.4;
    const sleepScore = wellness.sleepScore ?? Math.min(100, Math.round((sleepHours / 8) * 100));
    const restingHr = wellness.restingHR ?? 48;

    const readiness = calculateReadinessScore({
      tsb,
      acwr,
      sleepScore,
      restingHr,
      baselineRestingHr: 48,
    });

    return {
      source: "intervals.icu" as const,
      date: targetDate,
      ctl: Math.round(ctl),
      atl: Math.round(atl),
      tsb,
      acwr,
      sleepHours,
      restingHr,
      weightKg: Number(wellness.weight ?? athlete?.baselineWeightKg ?? 63.2),
      ...readiness,
    };
  } catch {
    const readiness = calculateReadinessScore({
      tsb: 4,
      acwr: 0.94,
      sleepScore: 88,
      restingHr: 48,
      baselineRestingHr: 48,
    });

    return {
      source: "fallback" as const,
      date: targetDate,
      ctl: 72,
      atl: 68,
      tsb: 4,
      acwr: 0.94,
      sleepHours: 7.4,
      restingHr: 48,
      weightKg: Number(athlete?.baselineWeightKg ?? 63.2),
      ...readiness,
    };
  }
}
