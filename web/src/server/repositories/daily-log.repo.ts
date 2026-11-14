import { and, desc, eq, gte, ilike, inArray, lte, or } from "drizzle-orm";
import { getDb } from "../db/client";
import { dailyLogHeader, dailyLogItem } from "../db/schema";

export interface DailyLogFilter {
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateDailyLogHeaderInput {
  logNo: string;
  logDate: string;
  athleteId: number;
  dayType: "REST" | "EASY_RUN" | "QUALITY_SUB_T" | "LONG_RUN";
  gymSessionCode: "NONE" | "GYM_A" | "GYM_B" | "GYM_C";
  morningWeightKg: number;
  runningBurnKcal: number;
  targetSurplusKcal: number;
  remarks?: string;
}

export interface CreateDailyLogItemInput {
  itemCategory: "MEAL_SOLID" | "LIQUID_BOOSTER" | "GYM_SET";
  itemName: string;
  quantity: number;
  unitKcalOrLoad: number;
  proteinGrams: number;
}

export async function listDailyLogs(filter: DailyLogFilter = {}) {
  const db = getDb();
  const conditions = [];

  if (filter.startDate) {
    conditions.push(gte(dailyLogHeader.logDate, filter.startDate));
  }
  if (filter.endDate) {
    conditions.push(lte(dailyLogHeader.logDate, filter.endDate));
  }
  if (filter.keyword && filter.keyword.trim() !== "") {
    const kw = `%${filter.keyword.trim()}%`;
    conditions.push(
      or(
        ilike(dailyLogHeader.logNo, kw),
        ilike(dailyLogHeader.dayType, kw),
        ilike(dailyLogHeader.remarks, kw)
      )
    );
  }

  const headers = await db
    .select()
    .from(dailyLogHeader)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(dailyLogHeader.logDate), desc(dailyLogHeader.logId));

  if (headers.length === 0) {
    return [];
  }

  const logIds = headers.map((h) => h.logId);
  const items = await db
    .select()
    .from(dailyLogItem)
    .where(inArray(dailyLogItem.logId, logIds));

  return headers.map((h) => ({
    header: h,
    items: items.filter((i) => i.logId === h.logId),
  }));
}

export async function getDailyLogById(logId: number) {
  const db = getDb();
  const [header] = await db
    .select()
    .from(dailyLogHeader)
    .where(eq(dailyLogHeader.logId, logId))
    .limit(1);

  if (!header) return null;

  const items = await db
    .select()
    .from(dailyLogItem)
    .where(eq(dailyLogItem.logId, logId));

  return { header, items };
}

export async function getDailyLogByNo(logNo: string) {
  const db = getDb();
  const [header] = await db
    .select()
    .from(dailyLogHeader)
    .where(eq(dailyLogHeader.logNo, logNo))
    .limit(1);
  return header ?? null;
}

export async function createDailyLogHeaderOnly(
  headerInput: CreateDailyLogHeaderInput,
) {
  const db = getDb();
  const [createdHeader] = await db
    .insert(dailyLogHeader)
    .values({
      logNo: headerInput.logNo,
      logDate: headerInput.logDate,
      athleteId: headerInput.athleteId,
      dayType: headerInput.dayType,
      gymSessionCode: headerInput.gymSessionCode,
      morningWeightKg: headerInput.morningWeightKg.toFixed(2),
      runningBurnKcal: headerInput.runningBurnKcal,
      targetSurplusKcal: headerInput.targetSurplusKcal,
      remarks: headerInput.remarks ?? null,
    })
    .returning();
  return createdHeader;
}

export async function createDailyLogAtomic(
  headerInput: CreateDailyLogHeaderInput,
  itemsInput: CreateDailyLogItemInput[]
) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const [createdHeader] = await tx
      .insert(dailyLogHeader)
      .values({
        logNo: headerInput.logNo,
        logDate: headerInput.logDate,
        athleteId: headerInput.athleteId,
        dayType: headerInput.dayType,
        gymSessionCode: headerInput.gymSessionCode,
        morningWeightKg: headerInput.morningWeightKg.toFixed(2),
        runningBurnKcal: headerInput.runningBurnKcal,
        targetSurplusKcal: headerInput.targetSurplusKcal,
        remarks: headerInput.remarks ?? null,
      })
      .returning();

    const createdItems = await tx
      .insert(dailyLogItem)
      .values(
        itemsInput.map((item) => ({
          logId: createdHeader.logId,
          itemCategory: item.itemCategory,
          itemName: item.itemName,
          quantity: item.quantity,
          unitKcalOrLoad: item.unitKcalOrLoad.toFixed(2),
          proteinGrams: item.proteinGrams.toFixed(2),
        }))
      )
      .returning();

    return { header: createdHeader, items: createdItems };
  });
}

export async function updateDailyLogAtomic(
  logId: number,
  headerInput: Omit<CreateDailyLogHeaderInput, "logNo">,
  itemsInput: CreateDailyLogItemInput[]
) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const [updatedHeader] = await tx
      .update(dailyLogHeader)
      .set({
        logDate: headerInput.logDate,
        athleteId: headerInput.athleteId,
        dayType: headerInput.dayType,
        gymSessionCode: headerInput.gymSessionCode,
        morningWeightKg: headerInput.morningWeightKg.toFixed(2),
        runningBurnKcal: headerInput.runningBurnKcal,
        targetSurplusKcal: headerInput.targetSurplusKcal,
        remarks: headerInput.remarks ?? null,
      })
      .where(eq(dailyLogHeader.logId, logId))
      .returning();

    if (!updatedHeader) {
      return null;
    }

    await tx.delete(dailyLogItem).where(eq(dailyLogItem.logId, logId));

    const insertedItems = await tx
      .insert(dailyLogItem)
      .values(
        itemsInput.map((item) => ({
          logId,
          itemCategory: item.itemCategory,
          itemName: item.itemName,
          quantity: item.quantity,
          unitKcalOrLoad: item.unitKcalOrLoad.toFixed(2),
          proteinGrams: item.proteinGrams.toFixed(2),
        }))
      )
      .returning();

    return { header: updatedHeader, items: insertedItems };
  });
}

export async function deleteDailyLogAtomic(logId: number) {
  const db = getDb();
  return db.transaction(async (tx) => {
    // BR-09: Delete child line items first, then parent header inside 1 DB transaction
    await tx.delete(dailyLogItem).where(eq(dailyLogItem.logId, logId));
    const deleted = await tx
      .delete(dailyLogHeader)
      .where(eq(dailyLogHeader.logId, logId))
      .returning();
    return deleted.length > 0;
  });
}
