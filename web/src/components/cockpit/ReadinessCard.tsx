"use client";

import { Activity } from "lucide-react";
import { Card } from "@/components/ui";
import { READINESS_STYLES } from "@/lib/constants";
import { shiftIsoDate } from "@/lib/date";
import type { ReadinessView } from "@/lib/types";

const RING_RADIUS = 56;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function WeekStrip({ today, loggedDates }: { today: string; loggedDates: ReadonlySet<string> }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const iso = shiftIsoDate(today, i - 6);
    const d = new Date(`${iso}T00:00:00Z`);
    return {
      iso,
      dayLabel: DAY_NAMES[d.getUTCDay()],
      dateNum: iso.slice(8, 10),
      isToday: iso === today,
      isLogged: loggedDates.has(iso),
    };
  });

  return (
    <div className="mb-5 grid grid-cols-7 gap-1 text-center">
      {days.map((d, idx) => {
        let circleStyle = "bg-zinc-900/80 text-zinc-400 border border-white/[0.06]";
        if (d.isToday && d.isLogged) {
          circleStyle = "bg-lime-400 text-zinc-950 font-bold ring-4 ring-lime-400/20";
        } else if (d.isToday) {
          circleStyle = "bg-purple-400 text-zinc-950 font-bold ring-4 ring-purple-400/20";
        } else if (d.isLogged) {
          circleStyle =
            idx % 2 === 0
              ? "bg-emerald-400 text-zinc-950 font-bold"
              : "bg-amber-300 text-zinc-950 font-bold";
        }

        return (
          <div key={d.iso} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-medium text-zinc-500">{d.dayLabel}</span>
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs transition-all ${circleStyle}`}
            >
              {d.dateNum}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MultiSegmentReadinessRing({
  score,
  status,
}: Pick<ReadinessView, "status"> & { score: number }) {
  const styles = READINESS_STYLES[status];
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const arc1 = RING_CIRCUMFERENCE * progress * 0.48;
  const arc2 = RING_CIRCUMFERENCE * progress * 0.28;
  const arc3 = RING_CIRCUMFERENCE * progress * 0.16;

  return (
    <div className="relative h-40 w-40 shrink-0">
      <svg
        viewBox="0 0 140 140"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label={`Readiness ${score} persen`}
      >
        <circle
          cx="70"
          cy="70"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="11"
          className="stroke-zinc-800/90"
        />
        <circle
          cx="70"
          cy="70"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="11"
          strokeLinecap="round"
          className="stroke-emerald-400"
          strokeDasharray={`${arc1} ${RING_CIRCUMFERENCE}`}
          strokeDashoffset={0}
        />
        <circle
          cx="70"
          cy="70"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="11"
          strokeLinecap="round"
          className="stroke-lime-400"
          strokeDasharray={`${arc2} ${RING_CIRCUMFERENCE}`}
          strokeDashoffset={-(arc1 + 10)}
        />
        <circle
          cx="70"
          cy="70"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="11"
          strokeLinecap="round"
          className="stroke-purple-400"
          strokeDasharray={`${arc3} ${RING_CIRCUMFERENCE}`}
          strokeDashoffset={-(arc1 + arc2 + 20)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="rounded-full bg-zinc-800/90 px-2.5 py-0.5 text-[9px] font-medium text-zinc-400 mb-1">
          Readiness
        </span>
        <div className="flex items-center gap-1">
          <Activity className={`h-4 w-4 ${styles.text}`} />
          <span className="text-3xl font-extrabold tracking-tight text-zinc-100">{score}</span>
        </div>
        <span className={`text-[10px] font-bold tracking-wider mt-0.5 ${styles.text}`}>
          {status} ZONE
        </span>
      </div>
    </div>
  );
}

export function ReadinessCard({
  readiness,
  loading,
  today,
  loggedDates,
}: {
  readiness: ReadinessView | null;
  loading: boolean;
  today: string;
  loggedDates: ReadonlySet<string>;
}) {
  if (!readiness) {
    return (
      <Card title="Readiness & Telemetry" glow="lime">
        <WeekStrip today={today} loggedDates={loggedDates} />
        <p className="text-xs text-zinc-500 py-6 text-center">
          {loading ? "Memuat kesiapan dari Intervals.icu..." : "Data kesiapan belum tersedia."}
        </p>
      </Card>
    );
  }

  const stats = [
    {
      label: "Form TSB",
      value: readiness.tsb > 0 ? `+${readiness.tsb}` : String(readiness.tsb),
      color: "bg-emerald-400",
      text: "text-emerald-400",
      bars: 3,
    },
    {
      label: "Fitness CTL",
      value: `${readiness.ctl}`,
      color: "bg-lime-400",
      text: "text-lime-400",
      bars: 3,
    },
    {
      label: "Sleep / RHR",
      value: `${readiness.sleepHours}h · ${readiness.restingHr}bpm`,
      color: "bg-purple-400",
      text: "text-purple-400",
      bars: 2,
    },
  ];

  return (
    <Card
      id="tour-cockpit-hero"
      title="Readiness & Telemetry"
      glow="lime"
      right={
        <span className="rounded-full border border-white/[0.08] bg-zinc-900/80 px-2.5 py-0.5 text-[10px] text-zinc-400">
          {readiness.source === "intervals.icu" ? "Live · Intervals.icu" : "Estimasi (offline)"}
        </span>
      }
    >
      <WeekStrip today={today} loggedDates={loggedDates} />

      <div className="flex items-center justify-between gap-4">
        <MultiSegmentReadinessRing score={readiness.readinessScore} status={readiness.status} />

        <div className="flex-1 space-y-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2.5">
              <div className="flex flex-col gap-1">
                {[0, 1, 2, 3].map((segment) => (
                  <span
                    key={segment}
                    className={`h-1.5 w-2.5 rounded-sm ${
                      segment < stat.bars ? stat.color : "bg-zinc-800"
                    }`}
                  />
                ))}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight text-zinc-100">{stat.value}</p>
                <p className={`text-[11px] font-medium ${stat.text}`}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/[0.06] bg-zinc-950/60 px-3.5 py-2.5 text-xs text-zinc-300">
        {readiness.recommendation}
      </div>
    </Card>
  );
}
