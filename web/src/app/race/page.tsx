"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Droplets,
  Flame,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Card, LabRaceTabs } from "@/components/ui";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import type { RaceCommandResult } from "@/server/services/race.service";

const DISTANCE_OPTIONS = [
  { label: "5K", km: 5.0 },
  { label: "10K", km: 10.0 },
  { label: "Half Marathon", km: 21.0975 },
  { label: "Full Marathon", km: 42.195 },
];

const LOCAL_STORAGE_RACE_CACHE_KEY = "daily_athlete_race_command_cache";

export default function RacePage() {
  const [selectedDistance, setSelectedDistance] = useState(21.0975);
  const [data, setData] = useState<RaceCommandResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineCached, setIsOfflineCached] = useState(false);

  // Restore cached pocket card on mount if available
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_RACE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as RaceCommandResult;
        setData(parsed);
        setIsOfflineCached(true);
      }
    } catch {
      // Ignore cache parse failure
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiRequest<{ success: true; data: RaceCommandResult }>(
      `/api/race?distanceKm=${selectedDistance}`,
    )
      .then((res) => {
        if (!cancelled && res.success) {
          setData(res.data);
          setIsOfflineCached(true);
          try {
            localStorage.setItem(
              LOCAL_STORAGE_RACE_CACHE_KEY,
              JSON.stringify(res.data),
            );
          } catch {
            // Ignore localStorage errors
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(toErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDistance]);

  const athlete = data?.athlete;
  const telemetry = data?.telemetry;
  const prediction = data?.prediction;
  const fueling = data?.fueling;
  const taper = data?.taper;

  return (
    <>
      <LabRaceTabs />

      <div>
        <p className="text-[10px] font-semibold tracking-[0.18em] text-lime-400 uppercase">
          Race Day Strategy
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">Race Command</h1>
        <p className="text-xs text-zinc-500 mt-1">
          {fueling?.raceName ?? "Target Half Marathon 21.1 km"} · Offline Pocket Card
        </p>
      </div>

      {/* Target Distance Selector */}
      <Card title="Pilihan Jarak & Parameter Lomba" glow="lime">
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-zinc-950/80 border border-white/[0.06] rounded-2xl">
          {DISTANCE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setSelectedDistance(opt.km)}
              className={`min-h-9 text-xs font-bold rounded-xl transition-all ${
                selectedDistance === opt.km
                  ? "bg-lime-400 text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3 pt-3 border-t border-white/[0.06]">
          <div>
            <span className="text-[10px] text-zinc-500 block">Kebugaran (CTL)</span>
            <span className="font-bold text-zinc-200 font-mono">
              {telemetry?.ctl ?? 48}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block">Kesiapan (TSB)</span>
            <span
              className={`font-bold font-mono ${
                (telemetry?.tsb ?? 2) >= 0 ? "text-lime-400" : "text-amber-400"
              }`}
            >
              {(telemetry?.tsb ?? 2) > 0 ? "+" : ""}
              {telemetry?.tsb ?? 2}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block">Skor Kesiapan</span>
            <span className="font-bold text-cyan-400 font-mono">
              {telemetry?.readinessScore ?? 86}%
            </span>
          </div>
        </div>
      </Card>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Target Race Finish (Dynamic Prediction) */}
      <Card
        title="Target Race Finish (Prediksi Terkalibrasi)"
        glow="lime"
        right={
          <span className="flex items-center gap-1 text-[10px] text-lime-300 font-semibold bg-lime-400/15 px-2.5 py-0.5 rounded-full border border-lime-400/30">
            <ShieldCheck className="w-3 h-3" />
            {isOfflineCached ? "OFFLINE READY" : "ONLINE"}
          </span>
        }
      >
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-extrabold text-zinc-100 font-mono">
              {prediction?.predictedTimeFormatted ?? "01:42:30"}
            </span>
            <span className="text-xs text-zinc-400 ml-2 font-mono">
              Pace {prediction?.predictedPaceFormatted ?? "4:51/km"}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-500 block">Target Ambang Daya</span>
            <span className="text-base font-bold text-lime-400 font-mono">
              {athlete
                ? `${Math.round(athlete.criticalPowerW * 0.88)}–${Math.round(athlete.criticalPowerW * 0.92)} W`
                : "208–214 W"}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-zinc-400 mt-3 pt-2.5 border-t border-white/[0.06]">
          <span>VDOT: {athlete?.vdot.toFixed(1) ?? "32.0"}</span>
          <span>Faktor CTL: {prediction?.ctlAdjustmentFactor ?? "1.000"}</span>
          <span>Faktor TSB: {prediction?.tsbAdjustmentFactor ?? "1.000"}</span>
        </div>
      </Card>

      {/* Fueling Schedule (EJ Sport 30g Carb) */}
      <Card
        title="Fueling & Hydration (EJ Sport 30g Carb)"
        glow="amber"
        right={<Zap className="w-4 h-4 text-amber-400" />}
      >
        {fueling && (
          <div className="grid grid-cols-3 gap-2 mb-3.5 pb-3 border-b border-white/[0.06] text-center text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 block">Total Gel</span>
              <span className="font-bold text-amber-400 font-mono">
                {fueling.gelCount} Sachet ({fueling.totalCarbsPlannedGrams}g)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block">Karbohidrat / Jam</span>
              <span className="font-bold text-zinc-200 font-mono">
                {fueling.hourlyCarbsTargetGrams} g/jam
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block">Target Cairan</span>
              <span className="font-bold text-cyan-400 font-mono">
                {fueling.targetFluidIntakeMlPerHour} ml/jam
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {fueling?.fuelingSchedule.map((milestone, idx) => (
            <div
              key={`${milestone.timing}-${idx}`}
              className="rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-zinc-100">{milestone.timing}</span>
                  <p className="text-[11px] text-zinc-300 mt-0.5 font-medium">
                    {milestone.action}
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shrink-0">
                  {milestone.carbsGrams > 0 ? `${milestone.carbsGrams}g carb` : "Hidrasi"}
                </span>
              </div>
              {milestone.tacticalNote && (
                <p className="text-[10px] text-zinc-400 mt-1.5 pt-1.5 border-t border-white/[0.04]">
                  {milestone.tacticalNote}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Segment Pacing Strategy */}
      {fueling?.pacingStrategy && fueling.pacingStrategy.length > 0 && (
        <Card title="Strategi Segmentasi Pacing" glow="purple">
          <div className="space-y-2">
            {fueling.pacingStrategy.map((seg) => (
              <div
                key={seg.segment}
                className="rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-3 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-zinc-100">{seg.title}</span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{seg.focus}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-lime-300 text-xs block">
                    {seg.powerWattsRange.min}–{seg.powerWattsRange.max} W
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {seg.paceRangeFormatted}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 14-Day A-Tapering Schedule */}
      {taper && (
        <Card title="Jadwal Tapering Kesiapan Fisik (A-Taper)" glow="cyan">
          <div className="space-y-2">
            {taper.weeklySchedule.map((t) => (
              <div
                key={t.week}
                className="rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-100">
                    Minggu ke-{t.week} Sebelum Lomba
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 font-semibold">
                    Volume {t.volumePct}% · TSB Target +{t.targetTsb}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                  {t.guidance}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
