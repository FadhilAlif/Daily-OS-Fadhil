import {
  pgTable,
  serial,
  varchar,
  integer,
  numeric,
  date,
  timestamp,
} from "drizzle-orm/pg-core";

export const athleteMaster = pgTable("athlete_master", {
  athleteId: serial("athlete_id").primaryKey(),
  intervalsId: varchar("intervals_id", { length: 20 }).notNull().unique(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  heightCm: integer("height_cm").notNull().default(180),
  baselineWeightKg: numeric("baseline_weight_kg", { precision: 5, scale: 2 })
    .notNull()
    .default("63.00"),
  targetWeightKg: numeric("target_weight_kg", { precision: 5, scale: 2 })
    .notNull()
    .default("67.00"),
  criticalPowerW: integer("critical_power_w").notNull().default(241),
  lthrBpm: integer("lthr_bpm").notNull().default(179),
  maxHrBpm: integer("max_hr_bpm").notNull().default(204),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dailyLogHeader = pgTable("daily_log_header", {
  logId: serial("log_id").primaryKey(),
  logNo: varchar("log_no", { length: 20 }).notNull().unique(),
  logDate: date("log_date").notNull(),
  athleteId: integer("athlete_id")
    .notNull()
    .references(() => athleteMaster.athleteId),
  dayType: varchar("day_type", { length: 20 }).notNull(),
  gymSessionCode: varchar("gym_session_code", { length: 10 })
    .notNull()
    .default("NONE"),
  morningWeightKg: numeric("morning_weight_kg", {
    precision: 5,
    scale: 2,
  }).notNull(),
  runningBurnKcal: integer("running_burn_kcal").notNull().default(0),
  targetSurplusKcal: integer("target_surplus_kcal").notNull().default(400),
  remarks: varchar("remarks", { length: 500 }),
});

export const dailyLogItem = pgTable("daily_log_item", {
  itemId: serial("item_id").primaryKey(),
  logId: integer("log_id")
    .notNull()
    .references(() => dailyLogHeader.logId),
  itemCategory: varchar("item_category", { length: 30 }).notNull(),
  itemName: varchar("item_name", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitKcalOrLoad: numeric("unit_kcal_or_load", {
    precision: 18,
    scale: 2,
  }).notNull(),
  proteinGrams: numeric("protein_grams", { precision: 8, scale: 2 })
    .notNull()
    .default("0"),
});
