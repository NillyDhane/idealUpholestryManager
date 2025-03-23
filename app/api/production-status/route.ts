import { NextResponse } from "next/server";
import { getProductionStatus } from "@/app/lib/server/googleSheets";

export async function GET() {
  try {
    console.log("API Route: Starting to fetch production status...");

    const productionData = await getProductionStatus();

    console.log("API Route: Successfully fetched production status");
    return NextResponse.json({ productionData });
  } catch (error) {
    console.error("API Route: Error fetching production status:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch production status",
      },
      { status: 500 }
    );
  }
} 