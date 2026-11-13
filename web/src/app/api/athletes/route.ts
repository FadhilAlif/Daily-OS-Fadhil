import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateBulkingPlan } from "@engine/utils/bulking";
import { getPrimaryAthlete, upsertAthlete } from "@/server/repositories/athlete.repo";

const UpsertAthleteSchema = z.object({
  intervalsId: z.string().min(2, "Intervals ID wajib diisi").max(20),
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter").max(100),
  heightCm: z.number().int().min(100).max(250),
  baselineWeightKg: z.number().min(35).max(200),
  targetWeightKg: z.number().min(35).max(200),
  criticalPowerW: z.number().int().min(50).max(600),
  lthrBpm: z.number().int().min(100).max(230),
  maxHrBpm: z.number().int().min(120).max(240),
});

export async function GET() {
  try {
    const athlete = await getPrimaryAthlete();
    if (!athlete) {
      return NextResponse.json({
        needsOnboarding: true,
        athlete: null,
      });
    }

    const weightKg = Number(athlete.baselineWeightKg);
    const targetWeightKg = Number(athlete.targetWeightKg);
    const plan = calculateBulkingPlan({
      weightKg,
      heightCm: athlete.heightCm,
      criticalPowerWatts: athlete.criticalPowerW,
      targetWeightKg,
      dayType: "QUALITY_SUB_T",
      gymSessionPlanned: true,
      gymSessionCode: "GYM_A",
    });

    return NextResponse.json({
      needsOnboarding: false,
      athlete: {
        ...athlete,
        baselineWeightKg: weightKg,
        targetWeightKg,
        wattsPerKg: plan.powerToWeight.currentWPerKg,
        projectedMinCpWatts: plan.powerToWeight.projectedMinCpWatts,
        powerToWeightStatus: plan.powerToWeight.status,
      },
      defaultPlan: plan,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal membaca profil atlet",
        errors: [err instanceof Error ? err.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = UpsertAthleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi profil atlet gagal",
          errors: parsed.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const saved = await upsertAthlete(parsed.data);
    const weightKg = Number(saved.baselineWeightKg);
    const targetWeightKg = Number(saved.targetWeightKg);
    const plan = calculateBulkingPlan({
      weightKg,
      heightCm: saved.heightCm,
      criticalPowerWatts: saved.criticalPowerW,
      targetWeightKg,
    });

    return NextResponse.json({
      success: true,
      athlete: {
        ...saved,
        baselineWeightKg: weightKg,
        targetWeightKg,
        wattsPerKg: plan.powerToWeight.currentWPerKg,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menyimpan profil atlet",
        errors: [err instanceof Error ? err.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}
