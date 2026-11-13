import { Card } from "@/components/ui";

const SCHEDULE = [
  { day: "Senin", type: "EASY_RUN", duration: "45m", desc: "Easy 65–70% HRmax · Recovery" },
  { day: "Selasa", type: "QUALITY_SUB_T", duration: "60m", desc: "Q1: 6 × 6m Sub-Threshold (87–92% CP) + Gym A" },
  { day: "Rabu", type: "EASY_RUN", duration: "45m", desc: "Easy 65–70% HRmax" },
  { day: "Kamis", type: "QUALITY_SUB_T", duration: "60m", desc: "Q2: 10 × 3m Sub-Threshold (90–94% CP)" },
  { day: "Jumat", type: "EASY_RUN", duration: "45m", desc: "Easy 65–70% HRmax + Gym B" },
  { day: "Sabtu", type: "EASY_RUN", duration: "40m", desc: "Easy Shakeout + Gym C (Upper Only)" },
  { day: "Minggu", type: "LONG_RUN", duration: "90m", desc: "Long Run Aerobic Foundation (70–75% CP)" },
];

export default function PlannerPage() {
  return (
    <>
      <div>
        <p className="text-[10px] font-semibold tracking-[0.18em] text-lime-400 uppercase">
          Norwegian Singles
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">Weekly Planner</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Alokasi 75/25 NSA · 1-Click Sync ke Intervals.icu
        </p>
      </div>

      <Card title="Rasio Durasi 75 / 25" glow="lime">
        <div className="flex items-center justify-between text-xs mb-2.5">
          <span className="text-zinc-400">Total Durasi: 6.4 jam</span>
          <span className="rounded-full bg-lime-400/15 border border-lime-400/30 px-2.5 py-0.5 text-[10px] text-lime-300 font-semibold">
            22.8% Sub-Threshold
          </span>
        </div>
        <div className="h-3 rounded-full bg-zinc-900 overflow-hidden flex p-0.5 gap-0.5">
          <div className="bg-cyan-400 h-full rounded-l-full" style={{ width: "77.2%" }} title="Easy 77.2%" />
          <div className="bg-lime-400 h-full rounded-r-full" style={{ width: "22.8%" }} title="Sub-T 22.8%" />
        </div>
        <div className="flex justify-between text-[11px] text-zinc-400 mt-2.5">
          <span className="text-cyan-300">Easy / Long Run (77%)</span>
          <span className="text-lime-300">Sub-Threshold (23%)</span>
        </div>
      </Card>

      <Card
        title="Jadwal 7 Hari (E-Q-E-Q-E-Q-LR)"
        glow="purple"
        right={
          <button
            type="button"
            className="min-h-9 px-3.5 rounded-full bg-lime-400 text-zinc-950 font-bold text-xs hover:bg-lime-300 transition-colors"
          >
            Sync Kalender
          </button>
        }
      >
        <div className="space-y-2">
          {SCHEDULE.map((s) => {
            const isQuality = s.type === "QUALITY_SUB_T";
            const isLong = s.type === "LONG_RUN";
            return (
              <div
                key={s.day}
                className="rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-3 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-100">{s.day}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                        isQuality
                          ? "bg-purple-400/15 text-purple-300"
                          : isLong
                            ? "bg-amber-400/15 text-amber-300"
                            : "bg-cyan-400/15 text-cyan-300"
                      }`}
                    >
                      {s.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">{s.desc}</p>
                </div>
                <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-zinc-900 border border-white/[0.08] text-lime-300 shrink-0">
                  {s.duration}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
