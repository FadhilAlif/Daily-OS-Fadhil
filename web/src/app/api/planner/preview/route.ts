import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { PublishPlanSchema } from "@/server/services/planner.service";
import { previewWeeklyPlan } from "@/server/services/planner.service";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = PublishPlanSchema.parse(body);
    const plan = previewWeeklyPlan(input);
    return NextResponse.json({ success: true, plan });
  } catch (error) {
    const errors =
      error instanceof ZodError
        ? error.issues.map((issue) => issue.message)
        : [error instanceof Error ? error.message : "Input tidak valid"];
    return NextResponse.json(
      { success: false, message: "Gagal membuat pratinjau jadwal", errors },
      { status: 400 },
    );
  }
}
