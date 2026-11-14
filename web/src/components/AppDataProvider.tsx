"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { BulkingPlanResult } from "@engine/utils/bulking";
import { CreateLogModal } from "@/components/log/LogDialogs";
import { useRemoteData } from "@/lib/hooks/useRemoteData";
import type { AthleteResponse, AthleteView, ReadinessView } from "@/lib/types";

interface AppData {
  athlete: AthleteView | null;
  defaultPlan: BulkingPlanResult | null;
  readiness: ReadinessView | null;
  needsOnboarding: boolean;
  loading: boolean;
  error: string | null;
  logsVersion: number;
  openLogModal: () => void;
  refresh: () => void;
}

const AppDataContext = createContext<AppData | null>(null);

/** Loads athlete profile + readiness once and shares them across the whole app shell. */
export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginRoute = pathname === "/login";
  const athleteQuery = useRemoteData<AthleteResponse>(isLoginRoute ? null : "/api/athletes");
  const readinessQuery = useRemoteData<ReadinessView>(
    isLoginRoute ? null : "/api/telemetry/readiness",
  );
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logsVersion, setLogsVersion] = useState(0);

  const { reload: reloadAthlete } = athleteQuery;
  const { reload: reloadReadiness } = readinessQuery;

  const refresh = useCallback(() => {
    reloadAthlete();
    reloadReadiness();
    setLogsVersion((v) => v + 1);
  }, [reloadAthlete, reloadReadiness]);

  const openLogModal = useCallback(() => setLogModalOpen(true), []);

  const athlete = athleteQuery.data?.athlete ?? null;

  const value = useMemo<AppData>(
    () => ({
      athlete,
      defaultPlan: athleteQuery.data?.defaultPlan ?? null,
      readiness: readinessQuery.data,
      needsOnboarding: athleteQuery.data?.needsOnboarding ?? false,
      loading: athleteQuery.loading || readinessQuery.loading,
      error: athleteQuery.error ?? readinessQuery.error,
      logsVersion,
      openLogModal,
      refresh,
    }),
    [
      athlete,
      athleteQuery.data,
      athleteQuery.loading,
      athleteQuery.error,
      readinessQuery.data,
      readinessQuery.loading,
      readinessQuery.error,
      logsVersion,
      openLogModal,
      refresh,
    ],
  );

  return (
    <AppDataContext.Provider value={value}>
      {children}
      {athlete?.athleteId && (
        <CreateLogModal
          isOpen={logModalOpen}
          athleteId={athlete.athleteId}
          baselineWeight={athlete.baselineWeightKg}
          onClose={() => setLogModalOpen(false)}
          onCreated={refresh}
        />
      )}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppData {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used inside <AppDataProvider>");
  return context;
}
