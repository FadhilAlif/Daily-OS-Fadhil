import { Card, LabRaceTabs } from "@/components/ui";

const NSA_PRESETS = [
  { dist: "10K Effort", rep: "6 × 6m (or 10 × 3m)", target: "217–224 W", rest: "60–90s", lact: "~2.8–3.0 mmol" },
  { dist: "15K Effort", rep: "5 × 8m (or 6 × 7m)", target: "212–218 W", rest: "60s", lact: "~2.5–2.8 mmol" },
  { dist: "HM Effort", rep: "4 × 10m (or 3 × 12m)", target: "205–212 W", rest: "60s", lact: "~2.2–2.5 mmol" },
  { dist: "30K Effort", rep: "3 × 15m (or 45m block)", target: "198–205 W", rest: "45–60s", lact: "~1.8–2.2 mmol" },
];

export default function LabPage() {
  return (
    <>
      <LabRaceTabs />

      <div>
        <p className="text-[10px] font-semibold tracking-[0.18em] text-lime-400 uppercase">
          Physiology Engine
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">NSA Lab & Audit</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Matriks Norwegian Singles & Decoupling Analyzer
        </p>
      </div>

      <Card title="Post-Run Cardiac Drift (Audit)" glow="lime">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-extrabold text-lime-400">2.4%</span>
            <p className="text-xs text-zinc-400 mt-0.5">Aerobic Decoupling (EF H1 vs H2)</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-lime-400/15 text-lime-300 border border-lime-400/30 font-semibold">
            PASSED (&lt; 5%)
          </span>
        </div>
        <p className="text-[11px] text-zinc-400 mt-3">
          EF tidak mengalami drop signifikan di paruh kedua. Basis aerobik stabil untuk iklim tropis.
        </p>
      </Card>

      <Card title="Matriks Interval NSA (Time-Based)" glow="purple">
        <div className="space-y-2.5">
          {NSA_PRESETS.map((item) => (
            <div
              key={item.dist}
              className="rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-100">{item.dist}</span>
                <span className="rounded-full bg-lime-400/15 px-2.5 py-0.5 text-xs font-mono text-lime-300 font-bold">
                  {item.target}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-400 mt-1.5">
                <span>Repetisi: {item.rep}</span>
                <span>Rest: {item.rest}</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Target Laktat: {item.lact}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
