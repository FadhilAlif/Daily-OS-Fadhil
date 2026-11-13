import { NextResponse } from "next/server";
import { pullProfileFromIntervalsIcu } from "@/server/services/telemetry.service";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const profile = await pullProfileFromIntervalsIcu(body?.intervalsId);
    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menarik profil dari Intervals.icu",
        errors: [err instanceof Error ? err.message : "Unknown error"],
      },
      { status: 502 }
    );
  }
}
