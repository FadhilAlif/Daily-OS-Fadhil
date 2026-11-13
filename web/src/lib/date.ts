const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Today's calendar date (YYYY-MM-DD) in Asia/Jakarta, independent of server/browser timezone. */
export function todayJakarta(now: Date = new Date()): string {
  return new Date(now.getTime() + JAKARTA_OFFSET_MS).toISOString().slice(0, 10);
}

/** Shifts an ISO date (YYYY-MM-DD) by a number of days. */
export function shiftIsoDate(isoDate: string, days: number): string {
  return new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
}

/** Default document number for a log date, e.g. LOG-20261113. */
export function toLogNo(isoDate: string): string {
  return `LOG-${isoDate.replaceAll("-", "")}`;
}
