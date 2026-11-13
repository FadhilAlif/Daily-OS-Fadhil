import { ShieldCheck, Zap } from "lucide-react";
import { Card, LabRaceTabs } from "@/components/ui";

const GELS = [
  { time: "T-15 menit", label: "Gel 1 + 150ml air", carb: "30g carb" },
  { time: "KM 6 (~30m)", label: "Gel 2 + Water station", carb: "30g carb" },
  { time: "KM 12 (~60m)", label: "Gel 3 + Isotonic sip", carb: "30g carb" },
  { time: "KM 17 (~85m)", label: "Gel 4 (Caffeine booster)", carb: "30g carb" },
];

export default function RacePage() {
  return (
    <>
      <LabRaceTabs />

      <div>
        <p className="text-[10px] font-semibold tracking-[0.18em] text-lime-400 uppercase">
          Race Day Strategy
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">Race Command</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Target Half Marathon 21.1 km · Offline Pocket Card
        </p>
      </div>

      <Card
        title="Target Race Finish"
        glow="lime"
        right={
          <span className="flex items-center gap-1 text-[10px] text-lime-300 font-semibold bg-lime-400/15 px-2.5 py-0.5 rounded-full border border-lime-400/30">
            <ShieldCheck className="w-3 h-3" /> OFFLINE READY
          </span>
        }
      >
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-extrabold text-zinc-100">01:42:30</span>
            <span className="text-xs text-zinc-400 ml-2">Pace 4:51 /km</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-500 block">Critical Power</span>
            <span className="text-base font-bold text-lime-400">208–214 W</span>
          </div>
        </div>
      </Card>

      <Card
        title="Fueling Schedule (EJ Sport 30g Carb)"
        glow="amber"
        right={<Zap className="w-4 h-4 text-amber-400" />}
      >
        <div className="space-y-2">
          {GELS.map((g) => (
            <div
              key={g.time}
              className="rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-3 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-zinc-100">{g.time}</span>
                <p className="text-[11px] text-zinc-400 mt-0.5">{g.label}</p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                {g.carb}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
