import { describe, expect, it } from "vitest";
import { calculateBulkingPlan } from "./bulking.js";

describe("calculateBulkingPlan", () => {
  it("calculates BMR, TDEE, surplus, and macros accurately for baseline athlete", () => {
    const plan = calculateBulkingPlan({
      weightKg: 63,
      heightCm: 180,
      age: 23,
      gender: "male",
      criticalPowerWatts: 241,
      dayType: "REST",
      targetSurplusKcal: 400,
    });

    // BMR: 10*63 + 6.25*180 - 5*23 + 5 = 630 + 1125 - 115 + 5 = 1645
    expect(plan.bmrKcal).toBe(1645);
    // Baseline TDEE: 1645 * 1.375 = 2262
    expect(plan.baselineTdeeKcal).toBe(2262);
    expect(plan.runningBurnKcal).toBe(0);
    expect(plan.totalExpenditureKcal).toBe(2262);
    expect(plan.targetIntakeKcal).toBe(2662); // 2262 + 400

    // Protein: 63 * 2.1 = 132g
    expect(plan.macros.proteinGrams).toBe(132);
    // Fat: 63 * 1.1 = 69g
    expect(plan.macros.fatGrams).toBe(69);
    // Carbs: (2662 - (132*4 + 69*9)) / 4 = (2662 - (528 + 621)) / 4 = 1513 / 4 = 378g
    expect(plan.macros.carbsGrams).toBe(378);
    expect(plan.powerToWeight.currentWPerKg).toBe(3.83);
    expect(plan.powerToWeight.projectedMinCpWatts).toBe(257); // 3.83 * 67
  });

  it("dynamically increases caloric target on Quality Sub-T day with Gym session", () => {
    const plan = calculateBulkingPlan({
      weightKg: 63,
      heightCm: 180,
      age: 23,
      gender: "male",
      criticalPowerWatts: 241,
      dayType: "QUALITY_SUB_T",
      gymSessionPlanned: true,
      targetSurplusKcal: 400,
    });

    expect(plan.runningBurnKcal).toBe(567); // 63 * 9
    expect(plan.gymBurnKcal).toBe(230); // Gym A burn
    expect(plan.totalExpenditureKcal).toBe(2262 + 567 + 230); // 3059
    expect(plan.targetIntakeKcal).toBe(3459); // 3059 + 400
    expect(plan.suggestedGymSession?.code).toBe("GYM_A");
  });

  it("provides zero-leg Gym C on rest/easy recovery day", () => {
    const plan = calculateBulkingPlan({
      weightKg: 63,
      dayType: "EASY_RUN",
      gymSessionPlanned: true,
    });

    expect(plan.suggestedGymSession?.code).toBe("GYM_C");
    expect(plan.suggestedGymSession?.legSafeguardNote).toContain("ZERO beban pada kaki");
  });

  it("throws RangeError on non-positive weight", () => {
    expect(() => calculateBulkingPlan({ weightKg: 0 })).toThrow(RangeError);
  });
});
