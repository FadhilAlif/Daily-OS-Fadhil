import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { PublishPlanSchema, publishWeeklyPlanToIntervals } from "@/server/services/planner.service";
import { checkRateLimit, getClientIp } from "@/server/utils/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`publish:${ip}`, 5, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Batas publikasi tercapai. Mohon tunggu 1 menit.",
        errors: ["Terlalu banyak permintaan publikasi jadwal ke Intervals.icu."],
      },
      { status: 429 },
    );
  }

  try {
    const body: unknown = await request.json();
    const input = PublishPlanSchema.parse(body);
    const result = await publishWeeklyPlanToIntervals(input);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Parameter jadwal mingguan tidak valid",
          errors: error.issues.map((issue) => issue.message),
        },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : "Terjadi kesalahan saat menerbitkan jadwal";
    const isGuardrail = message.startsWith("BR-12:");
    const isIntervals = message.startsWith("Intervals.icu HTTP");

    return NextResponse.json(
      {
        success: false,
        message: isIntervals ? "Gagal menerbitkan jadwal ke Intervals.icu" : message,
        errors: [message],
      },
      { status: isGuardrail ? 422 : isIntervals ? 502 : 500 },
    );
  }
}
