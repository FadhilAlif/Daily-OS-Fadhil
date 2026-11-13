import type { DayType, GymSessionCode, ItemCategory, ReadinessStatus } from "@/lib/types";

export const DAY_TYPE_OPTIONS: ReadonlyArray<{ value: DayType; label: string }> = [
  { value: "QUALITY_SUB_T", label: "QUALITY_SUB_T · Interval Sub-T" },
  { value: "EASY_RUN", label: "EASY_RUN · Recovery aerobik" },
  { value: "LONG_RUN", label: "LONG_RUN · Pondasi aerobik" },
  { value: "REST", label: "REST · Istirahat penuh" },
];

export const GYM_SESSION_OPTIONS: ReadonlyArray<{ value: GymSessionCode; label: string }> = [
  { value: "NONE", label: "NONE · Tanpa gym" },
  { value: "GYM_A", label: "GYM_A · Push + lower neural" },
  { value: "GYM_B", label: "GYM_B · Pull + pelvic armor" },
  { value: "GYM_C", label: "GYM_C · Upper pump (0 kaki)" },
];

export const ITEM_CATEGORY_OPTIONS: ReadonlyArray<{ value: ItemCategory; label: string }> = [
  { value: "MEAL_SOLID", label: "Solid Meal" },
  { value: "LIQUID_BOOSTER", label: "Liquid Booster" },
  { value: "GYM_SET", label: "Gym Set" },
];

export const READINESS_STYLES: Record<
  ReadinessStatus,
  { text: string; stroke: string; badge: string; bar: string }
> = {
  GREEN: {
    text: "text-lime-400",
    stroke: "stroke-lime-400",
    badge: "bg-lime-400/15 text-lime-300 border-lime-400/30",
    bar: "bg-lime-400",
  },
  YELLOW: {
    text: "text-amber-400",
    stroke: "stroke-amber-400",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    bar: "bg-amber-400",
  },
  RED: {
    text: "text-rose-400",
    stroke: "stroke-rose-500",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    bar: "bg-rose-500",
  },
};

/** Narrows a raw <select> value to a known option value without unsafe casts. */
export function pickOption<T extends string>(
  options: ReadonlyArray<{ value: T }>,
  raw: string,
  fallback: T,
): T {
  return options.find((option) => option.value === raw)?.value ?? fallback;
}
