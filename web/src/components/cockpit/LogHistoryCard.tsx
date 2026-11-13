"use client";

import { useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui";
import { DeleteLogModal } from "@/components/log/LogDialogs";
import type { DailyLogView } from "@/lib/types";

interface LogHistoryCardProps {
  logs: DailyLogView[];
  loading: boolean;
  error: string | null;
  exportUrl: string;
  onAdd: () => void;
  onChanged: () => void;
}

export function LogHistoryCard({
  logs,
  loading,
  error,
  exportUrl,
  onAdd,
  onChanged,
}: LogHistoryCardProps) {
  const [pendingDelete, setPendingDelete] = useState<DailyLogView | null>(null);

  return (
    <Card
      title="Daily Meal & Training Logs"
      right={
        <div className="flex items-center gap-2">
          <a
            href={exportUrl}
            aria-label="Ekspor CSV"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.08] bg-zinc-900 text-zinc-300 hover:border-lime-400/40 hover:text-lime-400 transition-colors"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={onAdd}
            className="flex h-9 items-center gap-1 rounded-full bg-lime-400 px-3.5 text-xs font-bold text-zinc-950 hover:bg-lime-300 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            Catat
          </button>
        </div>
      }
    >
      {error && (
        <p role="alert" className="text-xs text-rose-300">
          {error}
        </p>
      )}
      {!error && loading && (
        <p className="py-4 text-center text-xs text-zinc-500">Memuat log dari database...</p>
      )}
      {!error && !loading && logs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-zinc-950/40 py-6 text-center">
          <p className="text-xs text-zinc-400">Belum ada log pada 14 hari terakhir.</p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-lime-400/15 border border-lime-400/30 px-3 py-1 text-xs font-semibold text-lime-300"
          >
            + Buat Log Pertama
          </button>
        </div>
      )}

      <ul className="space-y-2">
        {logs.map((log) => {
          const { header, summary } = log;
          return (
            <li
              key={header.logId}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-zinc-950/60 px-3.5 py-2.5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-zinc-100">{header.logDate}</p>
                  <span className="rounded-full bg-lime-400/15 px-2 py-0.5 font-mono text-[9px] font-semibold text-lime-300">
                    {header.logNo}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[10px] text-zinc-400">
                  {header.dayType} · {header.gymSessionCode} · {header.morningWeightKg} kg
                </p>
              </div>
              <div className="text-right text-xs">
                <p className="font-semibold text-zinc-200">
                  {summary.grandTotalKcal}{" "}
                  <span className="text-[10px] font-normal text-zinc-500">
                    / {summary.targetIntakeKcal} kcal
                  </span>
                </p>
                <p className="text-[10px] text-cyan-400">
                  {summary.grandTotalProteinGrams} / {summary.targetProteinGrams}g P
                </p>
              </div>
              <button
                type="button"
                aria-label={`Hapus ${header.logNo}`}
                onClick={() => setPendingDelete(log)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>

      <DeleteLogModal
        isOpen={pendingDelete !== null}
        logId={pendingDelete?.header.logId ?? null}
        logNo={pendingDelete?.header.logNo ?? ""}
        logDate={pendingDelete?.header.logDate ?? ""}
        onClose={() => setPendingDelete(null)}
        onDeleted={onChanged}
      />
    </Card>
  );
}
