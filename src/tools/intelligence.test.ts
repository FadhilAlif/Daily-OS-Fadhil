import { describe, expect, it } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerIntelligenceTools } from "./intelligence.js";
import { calculateRaceFuelingPlan } from "../utils/fueling.js";
import { calculateBulkingPlan } from "../utils/bulking.js";

describe("registerIntelligenceTools", () => {
  it("registers intelligence tools including calculate_race_fueling on McpServer successfully", () => {
    const server = new McpServer({ name: "test-intelligence", version: "1.0.0" });
    expect(() => registerIntelligenceTools(server)).not.toThrow();
  });

  it("calculates race fueling plan correctly for MCP tool", () => {
    const res = calculateRaceFuelingPlan({
      raceDistanceKm: 21.0975,
      athleteWeightKg: 81,
      criticalPowerWatts: 293,
    });
    expect(res.gelBrand).toBe("EJ Sport");
    expect(res.gelCount).toBe(4);
    expect(res.totalCarbsPlannedGrams).toBe(120);
    expect(res.targetFluidIntakeMlPerHour).toBe(600);
  });

  it("calculates bulking plan correctly for MCP tool", () => {
    const res = calculateBulkingPlan({
      weightKg: 63,
      dayType: "QUALITY_SUB_T",
      gymSessionPlanned: true,
    });
    expect(res.bmrKcal).toBe(1645);
    expect(res.suggestedGymSession?.code).toBe("GYM_A");
    expect(res.macros.proteinGrams).toBe(132);
  });
});
