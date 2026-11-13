"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, toErrorMessage } from "@/lib/api-client";

interface RemoteState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** Fetches JSON from `url` (skipped when null) and exposes a `reload` trigger. */
export function useRemoteData<T>(url: string | null) {
  const [state, setState] = useState<RemoteState<T>>({
    data: null,
    error: null,
    loading: url !== null,
  });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (url === null) return;
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    apiRequest<T>(url)
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ data: null, error: toErrorMessage(error), loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [url, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { ...state, reload };
}
