"use client";

import { useState } from "react";
import { Check, Clock3, Dumbbell, Play, RotateCcw, Timer, Zap } from "lucide-react";
import { useAppData } from "@/components/AppDataProvider";
import { Card } from "@/components/ui";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import { todayJakarta, toLogNo } from "@/lib/date";
import { useRemoteData } from "@/lib/hooks/useRemoteData";
import type { GymSessionCode, LogItemInput } from "@/lib/types";

interface GymSessionPreset {
  code: GymSessionCode;
  title: string;
  focus: string;
  durationMinutes: number;
  estimatedBurnKcal: number;
  exercises: Array<{ name: string; sets: number; reps: string; rpe: string; notes: string }>;
  legSafeguardNote: string;
}

interface GymSessionsResponse {
  success: true;
  sessions: Record<"GYM_A" | "GYM_B" | "GYM_C", GymSessionPreset>;
}

export default function BulkingPage() {
  const { athlete, defaultPlan, refresh } = useAppData();
  const { data: gymData } = useRemoteData<GymSessionsResponse>("/api/gym-sessions");
  const sessions = gymData?.sessions;

  const [activeCode, setActiveCode] = useState<"GYM_A" | "GYM_B" | "GYM_C">("GYM_A");
  const currentPreset = sessions?.[activeCode];
  const [checked, setChecked] = useState<boolean[]>([]);

  const [seconds, setSeconds] = useState(7);
  const [running, setRunning] = useState(false);
  const [logging, setLogging] = useState(false);
  const [logStatus, setLogStatus] = useState<string | null>(null);

  // Meal structure comes directly from the server-side bulking engine (AGENTS.md §3.B)
  const mealStructure = defaultPlan?.mealStructure ?? [];

  function startTimer() {
    if (running) return;
    setRunning(true);
    const finishAt = Date.now() + seconds * 1000;
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((finishAt - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining <= 0) {
        window.clearInterval(interval);
        setRunning(false);
        setSeconds(7);
      }
    }, 100);
  }

  async function handleQuickLogSession() {
    if (!athlete || !currentPreset) return;
    setLogging(true);
    setLogStatus(null);
    const today = todayJakarta();
    const logNo = `${toLogNo(today)}-${activeCode}`;

    const items: LogItemInput[] = currentPreset.exercises.map((ex) => ({
      itemCategory: "GYM_SET",
      itemName: `${ex.name} (${ex.sets}x ${ex.reps})`,
      quantity: ex.sets,
      unitKcalOrLoad: 1.0,
      proteinGrams: 0,
    }));

    try {
      await apiRequest("/api/daily-logs", {
        method: "POST",
        body: JSON.stringify({
          logNo,
          logDate: today,
          athleteId: athlete.athleteId,
          dayType: activeCode === "GYM_C" ? "EASY_RUN" : "QUALITY_SUB_T",
          gymSessionCode: activeCode,
          morningWeightKg: athlete.baselineWeightKg,
          runningBurnKcal: 0,
          targetSurplusKcal: 400,
          remarks: `Sesi ${currentPreset.title} diselesaikan.`,
          items,
        }),
      });
      setLogStatus("Sesi gym berhasil dicatat ke Neon PostgreSQL!");
      refresh();
    } catch (err) {
      setLogStatus(toErrorMessage(err));
    } finally {
      setLogging(false);
    }
  }

  const ptw = defaultPlan?.powerToWeight;
  const isOptimal = ptw?.status === "OPTIMAL";

  return (
    <>
      <div>
        <p className="text-[10px] font-semibold tracking-[0.18em] text-lime-400 uppercase">
          Hybrid Training & Bulking
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">Workout & Nutrition Studio</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Preset Steve Magness & McGill Big 3 · Terhubung Neon DB
        </p>
      </div>

      <Card
        id="tour-workout-hero"
        title="Power-to-Weight Guardrail"
        glow="lime"
        right={
          ptw && (
            <span
              className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                isOptimal
                  ? "bg-lime-400/15 text-lime-300 border-lime-400/30"
                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
              }`}
            >
              {ptw.status}
            </span>
          )
        }
      >
        <div className="flex items-end justify-between">
          <div>
            <span className="text-4xl font-extrabold tracking-tight text-zinc-100">
              {ptw?.currentWPerKg ?? athlete?.wattsPerKg ?? 3.81}
            </span>
            <span className="text-zinc-400 ml-1 text-sm">W/kg</span>
          </div>
          <div className="text-right text-xs">
            <span className="text-zinc-500 block">Critical Power Saat Ini</span>
            <span className="font-bold text-lime-400">
              {ptw?.currentCpWatts ?? athlete?.criticalPowerW ?? 241} W
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-between rounded-2xl border border-white/[0.06] bg-zinc-950/60 px-3.5 py-2 text-xs text-zinc-300">
          <span>Saat ini: {athlete?.baselineWeightKg ?? 63.2} kg</span>
          <span className="text-lime-300 font-semibold">
            Target: {athlete?.targetWeightKg ?? 67.0} kg
          </span>
        </div>

        <p className="mt-3 text-[11px] text-zinc-400">
          {ptw?.note ??
            `Saat bobot mencapai ${athlete?.targetWeightKg ?? 67.0} kg, target Critical Power berprogresi ke ${athlete?.projectedMinCpWatts ?? 255} W.`}
        </p>
      </Card>

      <Card
        title="Sesi Gym Terjadwal"
        glow="purple"
        right={<Dumbbell className="w-4 h-4 text-purple-400" />}
      >
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-950/80 border border-white/[0.06] rounded-2xl">
          {(["GYM_A", "GYM_B", "GYM_C"] as const).map((code) => (
            <button
              key={code}
              onClick={() => {
                setActiveCode(code);
                setChecked([]);
              }}
              className={`min-h-10 text-xs font-bold rounded-xl transition-all ${
                activeCode === code
                  ? "bg-lime-400 text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {code.replace("_", " ")}
            </button>
          ))}
        </div>

        {currentPreset && (
          <div className="mt-3.5 space-y-3">
            <div>
              <p className="text-xs font-bold text-zinc-100">{currentPreset.title}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{currentPreset.focus}</p>
            </div>

            <ul className="space-y-2">
              {currentPreset.exercises.map((ex, idx) => {
                const isDone = checked[idx] || false;
                return (
                  <li
                    key={ex.name}
                    className={`rounded-2xl border p-3 transition-colors ${
                      isDone
                        ? "border-lime-400/30 bg-lime-400/10"
                        : "border-white/[0.06] bg-zinc-950/60"
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {
                          const next = [...checked];
                          next[idx] = !next[idx];
                          setChecked(next);
                        }}
                        className="mt-1 h-4 w-4 accent-lime-400"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-100">{ex.name}</p>
                        <p className="text-[11px] text-lime-300/90 mt-0.5">
                          {ex.sets} sets · {ex.reps} · RPE {ex.rpe}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{ex.notes}</p>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>

            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-300">
              {currentPreset.legSafeguardNote}
            </div>

            {logStatus && (
              <p className="text-xs text-lime-300 bg-lime-400/10 border border-lime-400/25 p-2.5 rounded-2xl">
                {logStatus}
              </p>
            )}

            <button
              onClick={handleQuickLogSession}
              disabled={logging || !athlete}
              className="w-full min-h-11 rounded-2xl bg-lime-400 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-lime-300 disabled:opacity-50 transition-colors"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              {logging ? "Menyimpan ke DB..." : "Log Sesi Gym ke Database"}
            </button>
          </div>
        )}
      </Card>

      <Card title="McGill Big 3 · Timer Isometrik 7 Detik" glow="emerald">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-4 border-lime-400 bg-zinc-950 shadow-inner">
            <span className="text-3xl font-extrabold tabular-nums text-lime-300">{seconds}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-zinc-100">Tahan Posisi 7 Detik</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Modified Curl-Up · Side Bridge · Bird-Dog
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={startTimer}
                disabled={running}
                className="min-h-10 flex-1 rounded-xl bg-lime-400 text-xs font-bold text-zinc-950 flex items-center justify-center gap-1 hover:bg-lime-300 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Mulai
              </button>
              <button
                onClick={() => {
                  setRunning(false);
                  setSeconds(7);
                }}
                aria-label="Reset timer"
                className="min-h-10 rounded-xl border border-white/[0.08] bg-zinc-900 px-3 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400">
          <Timer className="w-3.5 h-3.5 text-lime-400" /> Piramida 6 - 4 - 2 · istirahat 3 detik antar repetisi
        </p>
      </Card>

      <Card
        title="Daily Meal Plan (5-Meal Jakarta)"
        glow="amber"
        right={
          <span className="rounded-full bg-zinc-900 border border-white/[0.08] px-2.5 py-0.5 text-[10px] text-zinc-400">
            3 Solid + 2 Boosters
          </span>
        }
      >
        <ul className="space-y-2">
          {mealStructure.map((meal) => (
            <li
              key={meal.meal}
              className="rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-3 flex items-start gap-3"
            >
              <span
                className={`mt-0.5 h-8 w-8 shrink-0 rounded-full flex items-center justify-center border text-xs ${
                  meal.isLiquidBooster
                    ? "bg-lime-400/15 border-lime-400/30 text-lime-300 font-bold"
                    : "bg-zinc-900 border-white/[0.08] text-amber-300"
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs font-bold text-zinc-100">{meal.meal}</p>
                  <span className="text-[10px] text-zinc-500 font-mono">{meal.timing}</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">{meal.description}</p>
              </div>
              <div className="text-right text-xs shrink-0">
                <span className="font-mono font-semibold text-zinc-200">
                  ~{meal.estimatedKcal} kcal
                </span>
                <span className="block text-[10px] text-cyan-400 font-mono">
                  {meal.proteinGrams}g P
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-3 rounded-2xl bg-zinc-950/70 border border-white/[0.06] p-3 text-[11px] text-zinc-400 flex items-start gap-2">
          <Clock3 className="w-4 h-4 shrink-0 text-lime-400 mt-0.5" />
          <span>
            {defaultPlan?.guardrails.liquidBoosterRule ??
              "Gunakan 2x Liquid Calorie Shake per hari untuk memenuhi kebutuhan kalori tanpa membebani lambung."}
          </span>
        </div>
      </Card>
    </>
  );
}
