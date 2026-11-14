"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppData } from "@/components/AppDataProvider";
import { Activity, RefreshCw } from "lucide-react";
import { RedFlags } from "@/components/RedFlags";
import { Card } from "@/components/ui";
import { LogHistoryCard } from "@/components/cockpit/LogHistoryCard";
import { ReadinessCard } from "@/components/cockpit/ReadinessCard";
import { TodayNutritionCard } from "@/components/cockpit/TodayNutritionCard";
import { shiftIsoDate, todayJakarta } from "@/lib/date";
import { useRemoteData } from "@/lib/hooks/useRemoteData";
import type { DailyLogsResponse } from "@/lib/types";

export function TodayCockpit() {
  const { athlete, defaultPlan, readiness, logsVersion, openLogModal, refresh } = useAppData();
  const today = todayJakarta();
  const startDate = shiftIsoDate(today, -13);
  const logsUrl = `/api/daily-logs?startDate=${startDate}&endDate=${today}`;
  const { data, error, loading, reload } = useRemoteData<DailyLogsResponse>(logsUrl);

  useEffect(() => {
    if (logsVersion > 0) {
      reload();
    }
  }, [logsVersion, reload]);

  const logs = useMemo(() => data?.logs ?? [], [data?.logs]);

  const todayLog = useMemo(
    () => logs.find((log) => log.header.logDate === today),
    [logs, today],
  );

  const loggedDates = useMemo(
    () => new Set(logs.map((log) => log.header.logDate)),
    [logs],
  );

  const exportUrl = `/api/daily-logs/export?startDate=${startDate}&endDate=${today}`;
  const [syncingActivities, setSyncingActivities] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  async function handleSyncActivities() {
    setSyncingActivities(true);
    setSyncFeedback(null);
    try {
      const res = await fetch("/api/telemetry/sync-activities?days=3", {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal sinkronisasi");
      setSyncFeedback(
        `Sukses: ${json.totalRunsFound} lari ditemukan, ${json.syncedDates.length} hari diperbarui.`,
      );
      reload();
      refresh();
    } catch (err) {
      setSyncFeedback(err instanceof Error ? err.message : "Error saat sync");
    } finally {
      setSyncingActivities(false);
    }
  }

  return (
    <>
      <ReadinessCard
        readiness={readiness}
        loading={loading}
        today={today}
        loggedDates={loggedDates}
      />

      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold tracking-wide text-zinc-400">
          Aktivitas Intervals.icu
        </span>
        <button
          type="button"
          onClick={handleSyncActivities}
          disabled={syncingActivities}
          className="text-xs font-bold text-lime-400 hover:text-lime-300 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncingActivities ? "animate-spin" : ""}`} />
          {syncingActivities ? "Menyinkronkan..." : "Sync Aktivitas"}
        </button>
      </div>

      {syncFeedback && (
        <div className="rounded-2xl border border-lime-400/20 bg-lime-400/10 px-3 py-2 text-[11px] text-lime-300">
          {syncFeedback}
        </div>
      )}

      {athlete?.athleteId ? (
        <TodayNutritionCard
          log={todayLog}
          defaultPlan={defaultPlan}
          onOpenLog={openLogModal}
        />
      ) : (
        <Card title="Profil Belum Siap">
          <p className="text-xs text-zinc-400">
            Lengkapi profil atlet untuk menghitung kebutuhan nutrisi dan mencatat log harian.
          </p>
        </Card>
      )}

      <RedFlags />

      {athlete?.athleteId && (
        <LogHistoryCard
          logs={logs}
          loading={loading}
          error={error}
          exportUrl={exportUrl}
          onAdd={openLogModal}
          onChanged={() => {
            reload();
            refresh();
          }}
        />
      )}
    </>
  );
}
