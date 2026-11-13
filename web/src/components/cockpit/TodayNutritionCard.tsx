"use client";

import Link from "next/link";
import { ArrowUpRight, Dumbbell, Flame, Sparkles, Utensils, Zap } from "lucide-react";
import type { BulkingPlanResult } from "@engine/utils/bulking";
import { ProgressBar } from "@/components/ui";
import type { DailyLogView } from "@/lib/types";

/** Today's session + 3-column bento nutrition cards. All numbers come from the server summary. */
export function TodayNutritionCard({
  log,
  defaultPlan,
  onOpenLog,
}: {
  log: DailyLogView | undefined;
  defaultPlan: BulkingPlanResult | null;
  onOpenLog: () => void;
}) {
  const intakeKcal = log?.summary.grandTotalKcal ?? 0;
  const targetKcal = log?.summary.targetIntakeKcal ?? defaultPlan?.targetIntakeKcal ?? 3065;
  const intakeProtein = log?.summary.grandTotalProteinGrams ?? 0;
  const targetProtein = log?.summary.targetProteinGrams ?? defaultPlan?.macros.proteinGrams ?? 133;
  const burnedKcal = log?.summary.totalExpenditureKcal ?? defaultPlan?.totalExpenditureKcal ?? 2665;
  const wattsPerKg = log?.summary.wattsPerKg ?? defaultPlan?.powerToWeight.currentWPerKg ?? 3.81;
  const kcalPercent = log?.summary.calorieProgressPercent ?? 0;
  const proteinPercent = log?.summary.proteinProgressPercent ?? 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-zinc-100">Your Daily Nutrition</h2>
          <span className="text-[11px] font-mono text-zinc-500">
            {log ? log.header.logNo : "Belum dicatat"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: Calories (Amber Glow) */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#14161d] p-3.5 before:pointer-events-none before:absolute before:-right-6 before:-top-6 before:h-24 before:w-24 before:rounded-full before:bg-amber-500/20 before:blur-xl">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/90 border border-white/[0.06] text-amber-400">
              <Flame className="h-4 w-4" />
            </div>
            <p className="text-[11px] text-zinc-400">Calories</p>
            <p className="mt-0.5 text-lg font-extrabold tracking-tight text-zinc-100">
              {intakeKcal}
              <span className="ml-0.5 text-[10px] font-normal text-zinc-400">Kcal</span>
            </p>
            <p className="mt-1 text-[10px] text-zinc-500">/ {targetKcal} target</p>
            <div className="mt-2">
              <ProgressBar percent={kcalPercent} color="bg-amber-400" />
            </div>
          </div>

          {/* Card 2: Proteins (Cyan Glow) */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#14161d] p-3.5 before:pointer-events-none before:absolute before:-right-6 before:-top-6 before:h-24 before:w-24 before:rounded-full before:bg-cyan-500/20 before:blur-xl">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/90 border border-white/[0.06] text-cyan-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="text-[11px] text-zinc-400">Proteins</p>
            <p className="mt-0.5 text-lg font-extrabold tracking-tight text-zinc-100">
              {intakeProtein}
              <span className="ml-0.5 text-[10px] font-normal text-zinc-400">gm</span>
            </p>
            <p className="mt-1 text-[10px] text-zinc-500">/ {targetProtein} gm</p>
            <div className="mt-2">
              <ProgressBar percent={proteinPercent} color="bg-cyan-400" />
            </div>
          </div>

          {/* Card 3: Power / Expenditure (Emerald/Lime Glow) */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#14161d] p-3.5 before:pointer-events-none before:absolute before:-right-6 before:-top-6 before:h-24 before:w-24 before:rounded-full before:bg-lime-400/20 before:blur-xl">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/90 border border-white/[0.06] text-lime-400">
              <Zap className="h-4 w-4" />
            </div>
            <p className="text-[11px] text-zinc-400">Power Ratio</p>
            <p className="mt-0.5 text-lg font-extrabold tracking-tight text-zinc-100">
              {wattsPerKg}
              <span className="ml-0.5 text-[10px] font-normal text-zinc-400">W/kg</span>
            </p>
            <p className="mt-1 text-[10px] text-zinc-500">/{burnedKcal} TDEE</p>
            <div className="mt-2">
              <ProgressBar percent={100} color="bg-lime-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Right-Screen Mockup Style: Dual Vibrant Action Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-white/[0.08] bg-[#14161d] p-3">
          <div className="mb-2.5 flex items-center justify-between px-1">
            <div>
              <p className="text-[10px] text-zinc-400">Training Mode</p>
              <p className="text-xs font-bold text-zinc-100">
                {log?.header.dayType ?? "QUALITY_SUB_T"}
              </p>
            </div>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-400/20 text-purple-300 text-[10px] font-bold">
              ✓
            </span>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-purple-400 to-fuchsia-400 p-3 text-zinc-950">
            <div className="flex items-start justify-between">
              <p className="text-xs font-extrabold leading-tight">
                Today&apos;s
                <br />
                Training
              </p>
              <Dumbbell className="h-4 w-4 opacity-80" />
            </div>
            <p className="mt-1 text-[10px] font-semibold opacity-80">
              Gym: {log?.header.gymSessionCode ?? "GYM_A"}
            </p>
            <Link
              href="/bulking"
              className="mt-3 flex items-center justify-between rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold text-zinc-950 hover:bg-white transition-colors"
            >
              <span>Daily Plan</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-[#14161d] p-3">
          <div className="mb-2.5 flex items-center justify-between px-1">
            <div>
              <p className="text-[10px] text-zinc-400">Surplus Target</p>
              <p className="text-xs font-bold text-zinc-100">
                +{log?.header.targetSurplusKcal ?? 400} kcal
              </p>
            </div>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-400/20 text-lime-300 text-[10px] font-bold">
              ✓
            </span>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-400 p-3 text-zinc-950">
            <div className="flex items-start justify-between">
              <p className="text-xs font-extrabold leading-tight">
                Today&apos;s
                <br />
                Nutrition
              </p>
              <Utensils className="h-4 w-4 opacity-80" />
            </div>
            <p className="mt-1 text-[10px] font-semibold opacity-80">
              {log ? `${kcalPercent}% terpenuhi` : "Belum ada log"}
            </p>
            <button
              type="button"
              onClick={onOpenLog}
              className="mt-3 flex w-full items-center justify-between rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold text-zinc-950 hover:bg-white transition-colors"
            >
              <span>{log ? "Tambah Log" : "Catat Log"}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
