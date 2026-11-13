import { asc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { athleteMaster } from "../db/schema";

export interface UpsertAthleteInput {
  intervalsId: string;
  fullName: string;
  heightCm: number;
  baselineWeightKg: number;
  targetWeightKg: number;
  criticalPowerW: number;
  lthrBpm: number;
  maxHrBpm: number;
}

export async function getPrimaryAthlete() {
  const db = getDb();
  const rows = await db
    .select()
    .from(athleteMaster)
    .orderBy(asc(athleteMaster.athleteId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAthleteById(athleteId: number) {
  const db = getDb();
  const rows = await db
    .select()
    .from(athleteMaster)
    .where(eq(athleteMaster.athleteId, athleteId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertAthlete(input: UpsertAthleteInput) {
  const db = getDb();
  const [saved] = await db
    .insert(athleteMaster)
    .values({
      intervalsId: input.intervalsId.trim(),
      fullName: input.fullName.trim(),
      heightCm: input.heightCm,
      baselineWeightKg: input.baselineWeightKg.toFixed(2),
      targetWeightKg: input.targetWeightKg.toFixed(2),
      criticalPowerW: input.criticalPowerW,
      lthrBpm: input.lthrBpm,
      maxHrBpm: input.maxHrBpm,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: athleteMaster.intervalsId,
      set: {
        fullName: input.fullName.trim(),
        heightCm: input.heightCm,
        baselineWeightKg: input.baselineWeightKg.toFixed(2),
        targetWeightKg: input.targetWeightKg.toFixed(2),
        criticalPowerW: input.criticalPowerW,
        lthrBpm: input.lthrBpm,
        maxHrBpm: input.maxHrBpm,
        updatedAt: new Date(),
      },
    })
    .returning();

  return saved;
}
