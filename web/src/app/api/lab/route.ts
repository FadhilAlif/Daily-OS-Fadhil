import { NextResponse } from "next/server";
import { getLabAnalysis } from "@/server/services/lab.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vdotParam = searchParams.get("vdot");
    const vdot = vdotParam ? Number(vdotParam) : undefined;

    const data = await getLabAnalysis(vdot);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil data lab analisis";
    return NextResponse.json(
      { success: false, message, errors: [message] },
      { status: 500 },
    );
  }
}
