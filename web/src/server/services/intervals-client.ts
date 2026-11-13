import { calculateRetryDelay } from "@engine/utils/retry";

interface IntervalsEventPayload {
  category: "WORKOUT" | "NOTE";
  name: string;
  type?: "Run" | "WeightTraining";
  start_date_local: string;
  moving_time?: number;
  description?: string;
}

export async function intervalsApiRequest<T>(
  endpointPath: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
  } = {},
): Promise<T> {
  const apiKey = process.env.INTERVALS_API_KEY;
  if (!apiKey) {
    throw new Error("INTERVALS_API_KEY belum dikonfigurasi di .env.local");
  }
  const baseUrl = process.env.INTERVALS_API_BASE_URL || "https://intervals.icu/api/v1";
  const auth = Buffer.from(`API_KEY:${apiKey}`).toString("base64");
  const method = options.method ?? "GET";

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${baseUrl}${endpointPath}`, {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });

    if (res.status === 429 && attempt < 2) {
      const retryAfter = Number(res.headers.get("Retry-After") || "1");
      const delayMs = calculateRetryDelay(attempt, retryAfter);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      continue;
    }

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Intervals.icu HTTP ${res.status}: ${errorText || res.statusText}`);
    }

    if (res.status === 204) return undefined as T;
    const responseText = await res.text();
    if (!responseText) return undefined as T;
    return JSON.parse(responseText) as T;
  }

  throw new Error("Intervals.icu rate limit (HTTP 429) setelah 3x percobaan");
}

export async function publishIntervalEvent<T = { id?: string | number }>(
  athleteId: string,
  payload: IntervalsEventPayload,
): Promise<T> {
  return intervalsApiRequest<T>(`/athlete/${athleteId}/events`, {
    method: "POST",
    body: payload,
  });
}
