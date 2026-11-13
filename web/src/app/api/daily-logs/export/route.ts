import { getFilteredDailyLogsWithSummary } from "@/server/services/bulking.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  // BR-10: Export processes only records matching the active search & date filters
  const logs = await getFilteredDailyLogsWithSummary({
    keyword,
    startDate,
    endDate,
  });

  const csvRows = [
    [
      "LOG_NO",
      "LOG_DATE",
      "DAY_TYPE",
      "GYM_SESSION",
      "MORNING_WEIGHT_KG",
      "RUNNING_BURN_KCAL",
      "TARGET_INTAKE_KCAL",
      "ACTUAL_INTAKE_KCAL",
      "TARGET_PROTEIN_G",
      "ACTUAL_PROTEIN_G",
      "WATTS_PER_KG",
      "REMARKS",
    ].join(","),
    ...logs.map((row) =>
      [
        row.header.logNo,
        row.header.logDate,
        row.header.dayType,
        row.header.gymSessionCode,
        row.header.morningWeightKg,
        row.header.runningBurnKcal,
        row.summary.targetIntakeKcal,
        row.summary.grandTotalKcal,
        row.summary.targetProteinGrams,
        row.summary.grandTotalProteinGrams,
        row.summary.wattsPerKg,
        `"${(row.header.remarks || "").replace(/"/g, '""')}"`,
      ].join(",")
    ),
  ];

  return new Response(csvRows.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="daily-athlete-logs-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
