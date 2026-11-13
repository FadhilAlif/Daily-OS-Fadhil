"use client";

import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { useAppData } from "@/components/AppDataProvider";
import { READINESS_STYLES } from "@/lib/constants";
import type { ReadinessStatus } from "@/lib/types";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function Header() {
  const { athlete, readiness } = useAppData();
  const status: ReadinessStatus = readiness?.status ?? "GREEN";
  const styles = READINESS_STYLES[status];
  const fullName = athlete?.fullName ?? "Daily Athlete";

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0b0c10]/85 backdrop-blur-xl px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-lime-400/25 via-emerald-500/15 to-purple-500/20 p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#14161d] text-xs font-bold text-lime-300">
              {getInitials(fullName)}
            </div>
            <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-[#0b0c10] ${styles.bar}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-400">Good Day,</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${styles.badge}`}>
                {readiness?.readinessScore ?? 86}% {status}
              </span>
            </div>
            <p className="truncate font-bold text-sm tracking-tight text-zinc-100">
              {fullName}
            </p>
            <p className="text-[10px] text-zinc-500">
              {athlete?.baselineWeightKg ?? 63.2} kg · CP {athlete?.criticalPowerW ?? 241} W · {athlete?.wattsPerKg ?? 3.81} W/kg
            </p>
          </div>
        </div>

        <Link
          href="/onboarding"
          aria-label="Atur profil atlet"
          className="relative h-10 w-10 shrink-0 rounded-full bg-[#14161d] border border-white/[0.08] flex items-center justify-center text-zinc-300 hover:text-lime-400 hover:border-lime-400/40 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-lime-400" />
        </Link>
      </div>
    </header>
  );
}
