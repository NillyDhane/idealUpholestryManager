import { NextResponse } from "next/server";
import { getLocationStats, getHistoricalData } from "@/app/lib/googleSheets";

export async function GET() {
  try {
    const [stats, history] = await Promise.all([
      getLocationStats(),
      getHistoricalData(),
    ]);

    return NextResponse.json({ stats, history });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
