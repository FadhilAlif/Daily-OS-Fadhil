"use client";

import { useEffect, useMemo } from "react";
import { useAppData } from "@/components/AppDataProvider";
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

  return (
    <>
      <ReadinessCard
        readiness={readiness}
        loading={loading}
        today={today}
        loggedDates={loggedDates}
      />

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
