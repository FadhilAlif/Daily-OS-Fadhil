import { NextResponse } from "next/server";
import { syncRecentRunningActivities } from "@/server/services/activity-sync.service";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Never allow cron execution without an explicit deployment secret.
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: "Unauthorized cron execution" },
        { status: 401 },
      );
    }

    const result = await syncRecentRunningActivities(3);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal menyinkronkan aktivitas cron";
    return NextResponse.json(
      { success: false, message, errors: [message] },
      { status: 500 },
    );
  }
}
