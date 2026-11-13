import { NextResponse } from "next/server";
import { getPrimaryAthlete } from "@/server/repositories/athlete.repo";
import { getDailyLogById } from "@/server/repositories/daily-log.repo";
import {
  BusinessRuleError,
  enrichDailyLogWithServerMath,
  removeDailyLog,
  updateValidatedDailyLog,
} from "@/server/services/bulking.service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const logId = Number(id);
    if (!Number.isInteger(logId) || logId <= 0) {
      return NextResponse.json(
        { success: false, message: "ID log tidak valid", errors: ["ID harus bilangan bulat positif"] },
        { status: 400 }
      );
    }

    const [record, athlete] = await Promise.all([
      getDailyLogById(logId),
      getPrimaryAthlete(),
    ]);

    if (!record || !athlete) {
      return NextResponse.json(
        { success: false, message: "Log tidak ditemukan", errors: [`Log ID ${logId} tidak ada`] },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: enrichDailyLogWithServerMath(record, athlete),
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat detail log harian",
        errors: [err instanceof Error ? err.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const logId = Number(id);
    const payload = await request.json();
    const updated = await updateValidatedDailyLog(logId, payload);
    return NextResponse.json({
      success: true,
      data: updated,
    });
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
        message: "Gagal memperbarui log harian",
        errors: [err instanceof Error ? err.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const logId = Number(id);
    await removeDailyLog(logId);
    return NextResponse.json({ success: true });
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
        message: "Gagal menghapus log harian",
        errors: [err instanceof Error ? err.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}
