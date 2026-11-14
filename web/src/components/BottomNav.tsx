"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, Calendar, Trophy, Plus } from "lucide-react";
import { useAppData } from "@/components/AppDataProvider";

const LEFT_ITEMS = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/bulking", label: "Workout", icon: Dumbbell, match: (p: string) => p.startsWith("/bulking") },
];

const RIGHT_ITEMS = [
  { href: "/planner", label: "Planner", icon: Calendar, match: (p: string) => p.startsWith("/planner") },
  {
    href: "/lab",
    label: "Lab & Race",
    icon: Trophy,
    match: (p: string) => p.startsWith("/lab") || p.startsWith("/race"),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { openLogModal } = useAppData();

  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#0e1016]/95 backdrop-blur-xl">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-2">
        {LEFT_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? "text-lime-400 font-semibold" : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        <div className="flex items-center justify-center">
          <button
            id="tour-fab-button"
            type="button"
            onClick={openLogModal}
            aria-label="Catat log nutrisi dan latihan"
            className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#0b0c10] bg-lime-400 text-zinc-950 shadow-lg shadow-lime-400/25 hover:bg-lime-300 active:scale-95 transition-all"
          >
            <Plus className="h-6 w-6 stroke-[2.75]" />
          </button>
        </div>

        {RIGHT_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? "text-lime-400 font-semibold" : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
