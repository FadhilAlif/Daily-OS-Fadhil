"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import type { WeeklyPlanResult } from "@engine/utils/plan";
import { Card } from "@/components/ui";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import { getMondayOfIso, getNextMondayOfIso, todayJakarta } from "@/lib/date";

const TARGET_HOUR_OPTIONS = [5.0, 6.0, 6.5, 7.0, 8.0];

export default function PlannerPage() {
  const today = todayJakarta();
  const thisMonday = getMondayOfIso(today);
  const nextMonday = getNextMondayOfIso(today);

  const [selectedMonday, setSelectedMonday] = useState(thisMonday);
  const [targetHours, setTargetHours] = useState(6.0);
  const [includeGym, setIncludeGym] = useState(true);

  const [plan, setPlan] = useState<WeeklyPlanResult | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingPreview(true);
    setPublishStatus(null);

    apiRequest<{ success: true; plan: WeeklyPlanResult }>("/api/planner/preview", {
      method: "POST",
      body: JSON.stringify({
        startDateMonday: selectedMonday,
        targetHours,
      }),
    })
      .then((res) => {
        if (!cancelled && res.success) {
          setPlan(res.plan);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setPublishStatus({ type: "err", text: toErrorMessage(err) });
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPreview(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedMonday, targetHours]);

  async function handlePublish() {
    setPublishing(true);
    setPublishStatus(null);

    try {
      const res = await apiRequest<{
        success: true;
        publishedCount: number;
        summary: string;
      }>("/api/planner/publish", {
        method: "POST",
        body: JSON.stringify({
          startDateMonday: selectedMonday,
          targetHours,
          includeGymSessions: includeGym,
        }),
      });

      setPublishStatus({
        type: "ok",
        text: `Sukses! ${res.publishedCount} sesi (lari + gym + rest) berhasil diterbitkan ke kalender Intervals.icu Anda.`,
      });
    } catch (err) {
      setPublishStatus({
        type: "err",
        text: toErrorMessage(err),
      });
    } finally {
      setPublishing(false);
    }
  }

  const easyPercent = plan?.easyPercentage ?? 77;
  const subTPercent = plan?.subThresholdPercentage ?? 23;
  const isCompliant = plan?.guardrailCompliance.isCompliant ?? true;

  return (
    <>
      <div id="tour-planner-hero">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-lime-400 uppercase">
          Norwegian Singles Training Method
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">Weekly Planner & Sync</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Alokasi 75/25 NSA · Terbitkan 7 hari ke Kalender Intervals.icu
        </p>
      </div>

      {/* Week & Duration Controls */}
      <Card title="Pengaturan Jadwal Mingguan" glow="lime">
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium">
              Pilihan Pekan (Mulai Hari Senin)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMonday(thisMonday)}
                className={`min-h-10 rounded-2xl border text-xs font-semibold px-3 transition-all ${
                  selectedMonday === thisMonday
                    ? "border-lime-400/40 bg-lime-400/15 text-lime-300 font-bold"
                    : "border-white/[0.08] bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Pekan Ini ({thisMonday})
              </button>
              <button
                type="button"
                onClick={() => setSelectedMonday(nextMonday)}
                className={`min-h-10 rounded-2xl border text-xs font-semibold px-3 transition-all ${
                  selectedMonday === nextMonday
                    ? "border-lime-400/40 bg-lime-400/15 text-lime-300 font-bold"
                    : "border-white/[0.08] bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Pekan Depan ({nextMonday})
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] text-zinc-400 font-medium">
                Target Durasi Lari Mingguan
              </label>
              <span className="text-xs font-bold text-lime-300">{targetHours} Jam / Pekan</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-zinc-950/80 border border-white/[0.06] rounded-2xl">
              {TARGET_HOUR_OPTIONS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setTargetHours(h)}
                  className={`min-h-9 text-xs font-bold rounded-xl transition-all ${
                    targetHours === h
                      ? "bg-lime-400 text-zinc-950 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={includeGym}
              onChange={(e) => setIncludeGym(e.target.checked)}
              className="h-4 w-4 accent-lime-400 rounded"
            />
            <span className="text-xs text-zinc-300 font-medium">
              Sertakan 3x Sesi Steve Magness Gym (Sel, Jum, Sab)
            </span>
          </label>
        </div>
      </Card>

      {/* 75/25 Duration Compliance Ratio */}
      <Card
        title="Rasio Durasi 75 / 25 NSA"
        glow={isCompliant ? "lime" : "amber"}
        right={
          <span
            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
              isCompliant
                ? "bg-lime-400/15 text-lime-300 border-lime-400/30"
                : "bg-amber-500/15 text-amber-300 border-amber-500/30"
            }`}
          >
            {isCompliant ? "COMPLIANT (20-25%)" : "ADJUST NEEDED"}
          </span>
        }
      >
        <div className="flex items-center justify-between text-xs mb-2.5">
          <span className="text-zinc-400">
            Total Lari: {plan ? `${(plan.totalRunningMinutes / 60).toFixed(1)} jam` : `${targetHours} jam`}
          </span>
          <span className="text-lime-300 font-semibold">
            Sub-Threshold: {plan?.subThresholdWorkMinutes ?? 60}m ({subTPercent}%)
          </span>
        </div>
        <div className="h-3 rounded-full bg-zinc-900 overflow-hidden flex p-0.5 gap-0.5">
          <div
            className="bg-cyan-400 h-full rounded-l-full transition-all duration-300"
            style={{ width: `${easyPercent}%` }}
            title={`Easy / Long Run ${easyPercent}%`}
          />
          <div
            className="bg-lime-400 h-full rounded-r-full transition-all duration-300"
            style={{ width: `${subTPercent}%` }}
            title={`Sub-Threshold ${subTPercent}%`}
          />
        </div>
        <div className="flex justify-between text-[11px] text-zinc-400 mt-2.5">
          <span className="text-cyan-300 font-medium">Easy & Long Run ({easyPercent}%)</span>
          <span className="text-lime-300 font-medium">Sub-Threshold ({subTPercent}%)</span>
        </div>
      </Card>

      {/* Publish Feedback Status */}
      {publishStatus && (
        <div
          className={`rounded-2xl border p-3.5 text-xs flex items-start gap-2.5 ${
            publishStatus.type === "ok"
              ? "border-lime-400/30 bg-lime-400/10 text-lime-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {publishStatus.type === "ok" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <RefreshCw className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{publishStatus.text}</span>
        </div>
      )}

      {/* 7-Day Structured Schedule */}
      <Card
        title="Jadwal 7 Hari Terstruktur (E-Q-E-Q-E-Q-LR)"
        glow="purple"
        right={
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing || loadingPreview}
            className="min-h-9 px-3.5 rounded-full bg-lime-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 hover:bg-lime-300 disabled:opacity-50 transition-colors shadow-sm"
          >
            {publishing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Menerbitkan...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Sync Kalender
              </>
            )}
          </button>
        }
      >
        {loadingPreview ? (
          <p className="py-6 text-center text-xs text-zinc-500">
            Menghitung alokasi latihan mingguan...
          </p>
        ) : (
          <div className="space-y-2">
            {plan?.sessions.map((s) => {
              const isRest = s.category === "REST";
              const isQuality = s.workMinutes > 0;
              const isLong = s.durationMinutes >= 75;

              return (
                <div
                  key={`${s.dayOfWeek}-${s.date}`}
                  className="rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-100">{s.dayOfWeek}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{s.date}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                          isRest
                            ? "bg-zinc-800 text-zinc-400"
                            : isQuality
                              ? "bg-purple-400/20 text-purple-300 border border-purple-400/30"
                              : isLong
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                : "bg-cyan-400/20 text-cyan-300 border border-cyan-400/30"
                        }`}
                      >
                        {isRest ? "REST" : isQuality ? "QUALITY SUB-T" : isLong ? "LONG RUN" : "EASY RUN"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-200 mt-1">{s.title}</p>
                    {s.notes && (
                      <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2">{s.notes}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-zinc-900 border border-white/[0.08] text-lime-300 block">
                      {isRest ? "0m" : `${s.durationMinutes}m`}
                    </span>
                    {s.workMinutes > 0 && (
                      <span className="text-[9px] text-purple-300 font-mono block mt-1">
                        Sub-T: {s.workMinutes}m
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}
