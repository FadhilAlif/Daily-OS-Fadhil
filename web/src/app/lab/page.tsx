"use client";

import { useEffect, useState } from "react";
import { Activity, Gauge, HeartPulse, RefreshCw, Zap } from "lucide-react";
import { Card, LabRaceTabs } from "@/components/ui";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import type { LabAnalysisResult } from "@/server/services/lab.service";

const VDOT_PRESETS = [30.0, 31.0, 32.0, 33.0, 34.0, 35.0];

export default function LabPage() {
  const [selectedVdot, setSelectedVdot] = useState(32.0);
  const [data, setData] = useState<LabAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiRequest<{ success: true; data: LabAnalysisResult }>(
      `/api/lab?vdot=${selectedVdot}`,
    )
      .then((res) => {
        if (!cancelled && res.success) {
          setData(res.data);
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
  }, [selectedVdot]);

  const athlete = data?.athlete;
  const drift = data?.cardiacDrift;
  const matrix = data?.nsaMatrix;

  const isMinimalDrift = drift ? drift.decouplingPct < 3.0 : true;
  const isControlledDrift = drift ? drift.decouplingPct <= 5.0 : true;

  return (
    <>
      <LabRaceTabs />

      <div id="tour-lab-hero">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-lime-400 uppercase">
          Physiology Engine
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">NSA Lab & Audit</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Matriks Norwegian Singles & Decoupling Analyzer Terintegrasi DB
        </p>
      </div>

      {/* Athlete Calibration Bar */}
      <Card title="Parameter Kalibrasi Atlet" glow="lime">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-zinc-400 block text-[11px]">Profil Aktif</span>
            <span className="font-bold text-zinc-100 text-sm">
              {athlete?.fullName ?? "FadhilAlif"}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px]">Critical Power</span>
            <span className="font-bold text-lime-400 font-mono text-sm">
              {athlete?.criticalPowerW ?? 241} W
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px]">Bobot Dasar</span>
            <span className="font-bold text-zinc-200 font-mono text-sm">
              {athlete?.baselineWeightKg ?? 63.2} kg
            </span>
          </div>
          <div>
            <span className="text-zinc-400 block text-[11px]">Power-to-Weight</span>
            <span className="font-bold text-cyan-400 font-mono text-sm">
              {athlete?.wattsPerKg ?? 3.81} W/kg
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-zinc-400 font-medium">
              Kalibrasi Benchmark VDOT (Jack Daniels)
            </span>
            <span className="text-xs font-bold text-lime-300">
              VDOT {selectedVdot.toFixed(1)}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1.5 p-1 bg-zinc-950/80 border border-white/[0.06] rounded-2xl">
            {VDOT_PRESETS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setSelectedVdot(v)}
                className={`min-h-8 text-xs font-bold rounded-xl transition-all ${
                  selectedVdot === v
                    ? "bg-lime-400 text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {v.toFixed(0)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Post-Run Cardiac Drift (Audit) */}
      <Card
        title="Post-Run Cardiac Drift (Audit)"
        glow={isControlledDrift ? "lime" : "amber"}
        right={
          loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-500" />
          ) : (
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${
                isMinimalDrift
                  ? "bg-lime-400/15 text-lime-300 border-lime-400/30"
                  : isControlledDrift
                    ? "bg-cyan-400/15 text-cyan-300 border-cyan-400/30"
                    : "bg-rose-500/15 text-rose-300 border-rose-500/30"
              }`}
            >
              {drift?.status === "MINIMAL"
                ? "PASSED (< 3%)"
                : drift?.status === "CONTROLLED"
                  ? "CONTROLLED (3–5%)"
                  : "EXCESSIVE (> 5%)"}
            </span>
          )
        }
      >
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-extrabold text-lime-400 font-mono">
              {drift ? `${drift.decouplingPct}%` : "2.4%"}
            </span>
            <p className="text-xs text-zinc-400 mt-0.5">
              Aerobic Decoupling (EF H1 vs H2)
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 block">Efficiency Factor</span>
            <span className="text-xs font-mono font-semibold text-zinc-300">
              {drift ? `${drift.efHalf1} → ${drift.efHalf2}` : "1.365 → 1.332"}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 mt-3 leading-relaxed">
          {drift?.advice ??
            "Aerobic engine sangat solid & efisien. Cardiac drift minimal (<3%)."}
        </p>

        {drift?.activityName && (
          <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-zinc-500">
            <span>Sumber: {drift.activityName}</span>
            <span>{drift.activityDate}</span>
          </div>
        )}
      </Card>

      {/* Matriks Interval NSA (Time-Based) */}
      <Card
        title="Matriks Interval NSA (Time-Based)"
        glow="purple"
        right={
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-400/15 text-purple-300 border border-purple-400/30 font-semibold">
            CP {athlete?.criticalPowerW ?? 241} W · VDOT {selectedVdot.toFixed(1)}
          </span>
        }
      >
        {loading && !matrix ? (
          <p className="py-6 text-center text-xs text-zinc-500">
            Menghitung matriks interval Norwegian Singles...
          </p>
        ) : (
          <div className="space-y-2.5">
            {matrix?.intervals.map((item, idx) => (
              <div
                key={`${item.duration}-${idx}`}
                className="rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-3.5 transition-colors hover:border-white/[0.12]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-100">
                      {item.duration}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      ({item.repetitions})
                    </span>
                  </div>
                  <span className="rounded-full bg-lime-400/15 px-2.5 py-0.5 text-xs font-mono text-lime-300 font-bold border border-lime-400/20">
                    {item.targetPowerWattsFormatted}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 mt-2">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Pace Guide</span>
                    <span className="text-cyan-300 font-semibold font-mono">
                      {item.targetPacePerKm} ({item.paceGuide})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-500 block text-[10px]">Rest Protocol</span>
                    <span className="text-zinc-300 font-medium">{item.rest}</span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[10px] text-zinc-500 mt-2 pt-2 border-t border-white/[0.04]">
                    {item.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
