import { z } from "zod";
import {
  generateWeeklyPlan,
  type DayOfWeek,
  type QualityPreset,
  type WeeklyPlanResult,
} from "@engine/utils/plan";
import { GYM_SESSIONS, type GymSessionPreset } from "@engine/utils/bulking";
import { shiftIsoDate } from "@/lib/date";
import { getPrimaryAthlete } from "../repositories/athlete.repo";
import { intervalsApiRequest } from "./intervals-client";

export const PublishPlanSchema = z.object({
  startDateMonday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
    .refine((value) => {
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day &&
        date.getUTCDay() === 1
      );
    }, "Pilih tanggal Senin yang valid."),
  targetHours: z.number().min(4).max(12).default(6.0),
  qualitySessionsCount: z.union([z.literal(2), z.literal(3)]).default(3),
  qualityPresets: z
    .object({
      q1: z
        .enum([
          "short_3m",
          "micro_1m",
          "medium_6m",
          "long_10m",
          "dist_1000m",
          "dist_2000m",
          "dist_3000m",
        ] satisfies [QualityPreset, ...QualityPreset[]])
        .optional(),
      q2: z
        .enum([
          "short_3m",
          "micro_1m",
          "medium_6m",
          "long_10m",
          "dist_1000m",
          "dist_2000m",
          "dist_3000m",
        ] satisfies [QualityPreset, ...QualityPreset[]])
        .optional(),
    })
    .optional(),
  includeGymSessions: z.boolean().default(true),
  fastingDays: z
    .array(
      z.enum([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ] satisfies [DayOfWeek, ...DayOfWeek[]]),
    )
    .default(["Monday", "Thursday"]),
});

export type PublishPlanInput = z.infer<typeof PublishPlanSchema>;

export interface PublishedEventItem {
  id?: string | number;
  category: "WORKOUT" | "NOTE";
  type?: string;
  name: string;
  date: string;
  time?: string;
}

export interface PublishPlanResult {
  success: true;
  plan: WeeklyPlanResult;
  publishedCount: number;
  events: PublishedEventItem[];
  summary: string;
}

export function previewWeeklyPlan(input: {
  startDateMonday: string;
  targetHours?: number;
  qualitySessionsCount?: 2 | 3;
  fastingDays?: DayOfWeek[];
}): WeeklyPlanResult {
  return generateWeeklyPlan({
    startDateMonday: input.startDateMonday,
    targetHours: input.targetHours ?? 6.0,
    qualitySessionsCount: input.qualitySessionsCount ?? 3,
    fastingDays: input.fastingDays ?? ["Monday", "Thursday"],
  });
}

export async function publishWeeklyPlanToIntervals(
  rawInput: PublishPlanInput,
): Promise<PublishPlanResult> {
  const input = PublishPlanSchema.parse(rawInput);
  const plan = generateWeeklyPlan({
    startDateMonday: input.startDateMonday,
    targetHours: input.targetHours,
    qualitySessionsCount: input.qualitySessionsCount,
    qualityPresets: input.qualityPresets,
    fastingDays: input.fastingDays,
  });

  // BR-12: Enforce 75/25 ratio guardrail
  if (!plan.guardrailCompliance.isCompliant || plan.subThresholdPercentage > 25.0) {
    throw new Error(
      `BR-12: Pelanggaran rasio durasi 75/25 NSA (Sub-Threshold: ${plan.subThresholdPercentage}%). Wajib 20–25%.`,
    );
  }

  const athlete = await getPrimaryAthlete();
  const intervalsId =
    athlete?.intervalsId || process.env.INTERVALS_ATHLETE_ID || "i655618";

  const publishedEvents: PublishedEventItem[] = [];

  // 1. Publish running workouts and rest notes
  for (const session of plan.sessions) {
    if (session.category === "WORKOUT") {
      const payload = {
        category: "WORKOUT",
        name: session.title,
        type: "Run",
        start_date_local: `${session.date}T${session.time ?? "05:30"}:00`,
        moving_time: session.durationMinutes * 60,
        description: session.description,
      };

      const res = await intervalsApiRequest<{ id?: string | number }>(
        `/athlete/${intervalsId}/events`,
        { method: "POST", body: payload },
      );

      publishedEvents.push({
        id: res.id,
        category: "WORKOUT",
        type: "Run",
        name: session.title,
        date: session.date,
        time: session.time ?? "05:30",
      });
    } else {
      // Monday Rest Day as NOTE
      const payload = {
        category: "NOTE",
        name: session.title,
        start_date_local: `${session.date}T00:00:00`,
        description:
          session.notes ??
          "Rest Day: pemulihan glikogen, nol benturan aerobik, hidrasi optimal.",
      };

      const res = await intervalsApiRequest<{ id?: string | number }>(
        `/athlete/${intervalsId}/events`,
        { method: "POST", body: payload },
      );

      publishedEvents.push({
        id: res.id,
        category: "NOTE",
        name: session.title,
        date: session.date,
      });
    }
  }

  // 2. Publish Steve Magness Gym sessions if requested
  if (input.includeGymSessions) {
    const gymSchedule = [
      {
        dayOffset: 1, // Tuesday
        time: "16:30",
        preset: GYM_SESSIONS.GYM_A,
      },
      {
        dayOffset: 4, // Friday
        time: "16:30",
        preset: GYM_SESSIONS.GYM_B,
      },
      {
        dayOffset: 5, // Saturday
        time: "15:00",
        preset: GYM_SESSIONS.GYM_C,
      },
    ];

    for (const item of gymSchedule) {
      const gymDate = shiftIsoDate(input.startDateMonday, item.dayOffset);
      const exercisesDesc = item.preset.exercises
        .map((e) => `- ${e.name} (${e.sets}x ${e.reps} @ RPE ${e.rpe}): ${e.notes}`)
        .join("\n");

      const description = `${item.preset.focus}\n\n${exercisesDesc}\n\nCatatan: ${item.preset.legSafeguardNote}`;

      const payload = {
        category: "WORKOUT",
        name: item.preset.title,
        type: "WeightTraining",
        start_date_local: `${gymDate}T${item.time}:00`,
        moving_time: item.preset.durationMinutes * 60,
        description,
      };

      const res = await intervalsApiRequest<{ id?: string | number }>(
        `/athlete/${intervalsId}/events`,
        { method: "POST", body: payload },
      );

      publishedEvents.push({
        id: res.id,
        category: "WORKOUT",
        type: "WeightTraining",
        name: item.preset.title,
        date: gymDate,
        time: item.time,
      });
    }
  }

  const summary = `Berhasil menerbitkan ${publishedEvents.length} event (lari + gym + rest) ke kalender Intervals.icu atlet (${intervalsId}) untuk periode ${plan.startDateMonday} s.d. ${plan.endDateSunday}.`;

  return {
    success: true,
    plan,
    publishedCount: publishedEvents.length,
    events: publishedEvents,
    summary,
  };
}
