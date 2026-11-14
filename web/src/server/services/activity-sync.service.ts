import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { dailyLogHeader } from "../db/schema";
import { getPrimaryAthlete } from "../repositories/athlete.repo";
import { createDailyLogHeaderOnly } from "../repositories/daily-log.repo";
import { intervalsApiRequest } from "./intervals-client";
import { shiftIsoDate, todayJakarta, toLogNo } from "@/lib/date";

interface IntervalsActivitySummary {
  id: string | number;
  start_date_local: string;
  type: string;
  name: string;
  calories?: number;
  icu_joules?: number;
  icu_training_load?: number;
  moving_time?: number;
}

export interface SyncActivitiesResult {
  success: true;
  athleteId: string;
  dateRange: { oldest: string; newest: string };
  totalRunsFound: number;
  syncedDates: Array<{
    date: string;
    logNo: string;
    action: "CREATED" | "UPDATED" | "UNCHANGED";
    totalBurnKcal: number;
    activityCount: number;
  }>;
}

export async function syncRecentRunningActivities(
  daysBack: number = 3,
): Promise<SyncActivitiesResult> {
  const athlete = await getPrimaryAthlete();
  if (!athlete) {
    throw new Error("Profil atlet belum ditemukan di database");
  }

  const intervalsId =
    athlete.intervalsId || process.env.INTERVALS_ATHLETE_ID || "i655618";
  const today = todayJakarta();
  const oldest = shiftIsoDate(today, -daysBack);

  // 1. Fetch activities from Intervals.icu within window
  const activities = await intervalsApiRequest<IntervalsActivitySummary[]>(
    `/athlete/${intervalsId}/activities?oldest=${oldest}&newest=${today}`,
  );

  const runs = (activities || []).filter((a) => a.type === "Run");

  // Group by date (YYYY-MM-DD)
  const runsByDate = new Map<
    string,
    { totalCalories: number; activities: IntervalsActivitySummary[] }
  >();

  for (const run of runs) {
    const runDate = run.start_date_local.slice(0, 10);
    // Calories fallback hierarchy: calories -> joules / 4184 -> icu_training_load * 10
    const kcal =
      run.calories && run.calories > 0
        ? Math.round(run.calories)
        : run.icu_joules && run.icu_joules > 0
          ? Math.round(run.icu_joules / 4184)
          : run.icu_training_load
            ? Math.round(run.icu_training_load * 10)
            : 0;

    const current = runsByDate.get(runDate) || {
      totalCalories: 0,
      activities: [],
    };
    current.totalCalories += kcal;
    current.activities.push(run);
    runsByDate.set(runDate, current);
  }

  const syncedDates: SyncActivitiesResult["syncedDates"] = [];
  const db = getDb();

  for (const [date, data] of runsByDate.entries()) {
    const logNo = toLogNo(date);
    // Scope duplicate lookup to this athlete/date-derived key.
    const [existing] = await db
      .select()
      .from(dailyLogHeader)
      .where(eq(dailyLogHeader.logNo, logNo))
      .limit(1);

    if (existing) {
      if (existing.runningBurnKcal !== data.totalCalories) {
        await db
          .update(dailyLogHeader)
          .set({ runningBurnKcal: data.totalCalories })
          .where(eq(dailyLogHeader.logId, existing.logId));

        syncedDates.push({
          date,
          logNo,
          action: "UPDATED",
          totalBurnKcal: data.totalCalories,
          activityCount: data.activities.length,
        });
      } else {
        syncedDates.push({
          date,
          logNo,
          action: "UNCHANGED",
          totalBurnKcal: data.totalCalories,
          activityCount: data.activities.length,
        });
      }
    } else {
      // Upsert: Create empty daily log header (items remain 0 until user logs food)
      const maxMovingTime = Math.max(
        ...data.activities.map((a) => a.moving_time || 0),
      );
      const dayType =
        maxMovingTime >= 4500
          ? "LONG_RUN"
          : maxMovingTime >= 2400
            ? "QUALITY_SUB_T"
            : "EASY_RUN";

      await createDailyLogHeaderOnly({
        logNo,
        logDate: date,
        athleteId: athlete.athleteId,
        dayType,
        gymSessionCode: "NONE",
        morningWeightKg: Number(athlete.baselineWeightKg),
        runningBurnKcal: data.totalCalories,
        targetSurplusKcal: 400,
        remarks: `Auto-synced from ${data.activities.length} Intervals.icu run session(s).`,
      });

      syncedDates.push({
        date,
        logNo,
        action: "CREATED",
        totalBurnKcal: data.totalCalories,
        activityCount: data.activities.length,
      });
    }
  }

  return {
    success: true,
    athleteId: intervalsId,
    dateRange: { oldest, newest: today },
    totalRunsFound: runs.length,
    syncedDates,
  };
}
