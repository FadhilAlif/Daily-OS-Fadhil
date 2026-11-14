import { NextResponse } from "next/server";
import { syncRecentRunningActivities } from "@/server/services/activity-sync.service";
import { checkRateLimit, getClientIp } from "@/server/utils/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`sync-activities:${ip}`, 6, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: "Terlalu banyak permintaan sinkronisasi. Coba lagi nanti." },
      { status: 429 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days");
    const daysBack = daysParam ? Math.min(14, Math.max(1, Number(daysParam))) : 3;

    const result = await syncRecentRunningActivities(daysBack);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal menyinkronkan aktivitas lari";
    return NextResponse.json(
      { success: false, message, errors: [message] },
      { status: 500 },
    );
  }
}
