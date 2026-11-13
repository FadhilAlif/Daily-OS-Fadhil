"use client";

import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { Card } from "@/components/ui";
import { flags } from "@/lib/mock/data";

export function RedFlags() {
  const [active, setActive] = useState<boolean[]>(flags.map(() => false));
  const count = active.filter(Boolean).length;
  const musculoskeletal = active[4];
  const warn = count >= 2 || musculoskeletal;

  return (
    <Card
      title="5 Red Flags Guardrail"
      glow={warn ? "amber" : "none"}
      right={
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
            warn
              ? "border-amber-500/30 bg-amber-500/15 text-amber-300"
              : "border-white/[0.08] bg-zinc-900 text-zinc-400"
          }`}
        >
          {count}/5 aktif
        </span>
      }
    >
      <ul className="space-y-1.5">
        {flags.map((label, i) => {
          const isChecked = active[i];
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => setActive((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
                className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all ${
                  isChecked
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                    : "border-white/[0.05] bg-zinc-900/50 text-zinc-300 hover:border-white/[0.12]"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs transition-colors ${
                    isChecked
                      ? "border-amber-400 bg-amber-400 text-zinc-950 font-bold"
                      : "border-zinc-700 bg-zinc-950"
                  }`}
                >
                  {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </span>
                <span className="text-xs font-medium">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {warn && (
        <div className="mt-3 flex gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
          <span>Adaptive deload: ganti sesi Quality dengan Easy Run atau cross-training.</span>
        </div>
      )}
    </Card>
  );
}
