import { NextResponse } from "next/server";
import { getLiveOrFallbackReadiness } from "@/server/services/telemetry.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || undefined;
  const readiness = await getLiveOrFallbackReadiness(date);
  return NextResponse.json(readiness);
}
