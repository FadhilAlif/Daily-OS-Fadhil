"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LineChart, Trophy } from "lucide-react";

type CardGlow = "none" | "lime" | "emerald" | "purple" | "amber" | "cyan";

const GLOW_CLASSES: Record<CardGlow, string> = {
  none: "",
  lime: "before:pointer-events-none before:absolute before:-right-10 before:-top-10 before:h-32 before:w-32 before:rounded-full before:bg-lime-400/12 before:blur-2xl",
  emerald:
    "before:pointer-events-none before:absolute before:-right-10 before:-top-10 before:h-32 before:w-32 before:rounded-full before:bg-emerald-500/12 before:blur-2xl",
  purple:
    "before:pointer-events-none before:absolute before:-right-10 before:-top-10 before:h-32 before:w-32 before:rounded-full before:bg-purple-500/14 before:blur-2xl",
  amber:
    "before:pointer-events-none before:absolute before:-right-10 before:-top-10 before:h-32 before:w-32 before:rounded-full before:bg-amber-500/12 before:blur-2xl",
  cyan: "before:pointer-events-none before:absolute before:-right-10 before:-top-10 before:h-32 before:w-32 before:rounded-full before:bg-cyan-500/12 before:blur-2xl",
};

export function Card({
  id,
  title,
  right,
  glow = "none",
  className = "",
  children,
}: {
  id?: string;
  title?: string;
  right?: React.ReactNode;
  glow?: CardGlow;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#14161d]/90 p-4 shadow-lg shadow-black/30 ${GLOW_CLASSES[glow]} ${className}`}
    >
      {(title || right) && (
        <div className="relative z-10 flex items-center justify-between mb-3.5">
          {title && (
            <h2 className="text-xs font-semibold tracking-wide text-zinc-300">
              {title}
            </h2>
          )}
          {right}
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export function ProgressBar({
  percent,
  color = "bg-lime-400",
}: {
  percent: number;
  color?: string;
}) {
  const safePercent = Math.max(0, Math.min(100, percent));
  return (
    <div className="h-2 w-full rounded-full bg-zinc-800/90 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${color}`}
        style={{ width: `${safePercent}%` }}
      />
    </div>
  );
}

export function LabRaceTabs() {
  const pathname = usePathname();
  const isRace = pathname.startsWith("/race");

  return (
    <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-white/[0.08] bg-[#14161d] p-1">
      <Link
        href="/lab"
        className={`flex min-h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-all ${
          !isRace
            ? "bg-lime-400 text-zinc-950 shadow-sm"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <LineChart className="h-3.5 w-3.5" />
        NSA Lab
      </Link>
      <Link
        href="/race"
        className={`flex min-h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-all ${
          isRace
            ? "bg-lime-400 text-zinc-950 shadow-sm"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <Trophy className="h-3.5 w-3.5" />
        Race Command
      </Link>
    </div>
  );
}
