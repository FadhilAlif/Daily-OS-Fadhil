import { NextResponse } from "next/server";
import {
  BusinessRuleError,
  createValidatedDailyLog,
  getFilteredDailyLogsWithSummary,
} from "@/server/services/bulking.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const logs = await getFilteredDailyLogsWithSummary({
      keyword,
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat daftar log harian",
        errors: [err instanceof Error ? err.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const created = await createValidatedDailyLog(payload);
    return NextResponse.json(
      {
        success: true,
        id: created.header.logId,
        data: created,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof BusinessRuleError) {
      return NextResponse.json(
        {
          success: false,
          message: err.message,
          errors: err.errors,
        },
        { status: err.statusCode }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menyimpan log harian",
        errors: [err instanceof Error ? err.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}
