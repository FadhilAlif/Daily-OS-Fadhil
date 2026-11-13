import { calculateNsaMatrix, type NsaMatrixResult } from "@engine/utils/nsa";
import { calculateVdot } from "@engine/utils/vdot";
import { analyzeCardiacDrift, type DriftOutput } from "@engine/utils/drift";
import { getPrimaryAthlete } from "../repositories/athlete.repo";
import { intervalsApiRequest } from "./intervals-client";

export interface LabAnalysisResult {
  athlete: {
    fullName: string;
    criticalPowerW: number;
    baselineWeightKg: number;
    wattsPerKg: number;
    vdot: number;
  };
  nsaMatrix: NsaMatrixResult;
  cardiacDrift: DriftOutput & {
    source: "intervals_icu_stream" | "calibrated_baseline";
    activityName?: string;
    activityDate?: string;
  };
}

// Fallback baseline stream representing a calibrated 60m Sub-T/Aerobic run (176 spm, 215W avg, 158 bpm avg)
const CALIBRATED_HR_STREAM = [
  142, 145, 148, 150, 152, 153, 154, 155, 155, 156,
  156, 157, 157, 158, 158, 159, 159, 160, 160, 161,
];
const CALIBRATED_POWER_STREAM = [
  212, 214, 215, 216, 215, 214, 215, 216, 215, 215,
  215, 214, 214, 213, 214, 213, 213, 212, 212, 212,
];

export async function getLabAnalysis(customVdot?: number): Promise<LabAnalysisResult> {
  const athlete = await getPrimaryAthlete();

  const criticalPowerW = athlete?.criticalPowerW ?? 241;
  const baselineWeightKg = Number(athlete?.baselineWeightKg ?? 63.2);
  const fullName = athlete?.fullName ?? "FadhilAlif";
  const wattsPerKg = Number((criticalPowerW / (baselineWeightKg || 1)).toFixed(2));
  const vdot = customVdot && customVdot >= 30 && customVdot <= 85 ? customVdot : 32.0;

  // 1. Calculate dynamic NSA Interval Matrix based on Athlete's CP and VDOT
  const nsaMatrix = calculateNsaMatrix({
    vdot,
    criticalPowerWatts: criticalPowerW,
  });

  // 2. Calculate Cardiac Drift (Try Intervals.icu latest activity streams; fallback to calibrated baseline)
  let cardiacDrift: LabAnalysisResult["cardiacDrift"];

  try {
    const intervalsId = athlete?.intervalsId || process.env.INTERVALS_ATHLETE_ID || "i655618";
    const recentActivities = await intervalsApiRequest<Array<{ id: string | number; name: string; start_date_local: string; type: string }>>(
      `/athlete/${intervalsId}/activities?limit=5`,
    );

    const latestRun = recentActivities?.find((a) => a.type === "Run");
    if (latestRun?.id) {
      const streams = await intervalsApiRequest<Array<{ type: string; data: number[] }>>(
        `/activity/${latestRun.id}/streams`,
      );

      const hrStream = streams?.find((s) => s.type === "heartrate")?.data;
      const powerStream =
        streams?.find((s) => s.type === "watts" || s.type === "power")?.data ||
        streams?.find((s) => s.type === "velocity_smooth")?.data;

      if (hrStream && powerStream && hrStream.length >= 10 && powerStream.length >= 10) {
        const drift = analyzeCardiacDrift({
          heartrateStream: hrStream,
          powerOrSpeedStream: powerStream,
        });

        cardiacDrift = {
          ...drift,
          source: "intervals_icu_stream",
          activityName: latestRun.name,
          activityDate: latestRun.start_date_local.slice(0, 10),
        };
      }
    }
  } catch {
    // Offline or rate-limited: proceed to calibrated baseline
  }

  if (!cardiacDrift!) {
    // Scale power stream relative to athlete's CP (e.g. ~88% CP for aerobic run)
    const scaledPowerStream = CALIBRATED_POWER_STREAM.map((p) =>
      Math.round((p / 241) * criticalPowerW),
    );
    const drift = analyzeCardiacDrift({
      heartrateStream: CALIBRATED_HR_STREAM,
      powerOrSpeedStream: scaledPowerStream,
    });

    cardiacDrift = {
      ...drift,
      source: "calibrated_baseline",
      activityName: "Sesi Aerobik Terkalibrasi (Baseline)",
      activityDate: new Date().toISOString().slice(0, 10),
    };
  }

  return {
    athlete: {
      fullName,
      criticalPowerW,
      baselineWeightKg,
      wattsPerKg,
      vdot,
    },
    nsaMatrix,
    cardiacDrift,
  };
}
