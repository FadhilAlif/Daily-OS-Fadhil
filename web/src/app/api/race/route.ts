import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getRaceCommandPlan, RaceQuerySchema } from "@/server/services/race.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const parsed = RaceQuerySchema.safeParse({
      ...params,
      distanceKm: params.distanceKm ? Number(params.distanceKm) : undefined,
      vdot: params.vdot ? Number(params.vdot) : undefined,
      temperatureCelsius: params.temperatureCelsius
        ? Number(params.temperatureCelsius)
        : undefined,
      relativeHumidityPct: params.relativeHumidityPct
        ? Number(params.relativeHumidityPct)
        : undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Parameter race tidak valid",
          errors: parsed.error.issues.map((issue) => issue.message),
        },
        { status: 400 },
      );
    }

    const data = await getRaceCommandPlan(parsed.data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghitung strategi race";
    const status = error instanceof ZodError ? 400 : 500;
    return NextResponse.json(
      { success: false, message, errors: [message] },
      { status },
    );
  }
}
