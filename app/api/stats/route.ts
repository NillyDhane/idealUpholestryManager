import { NextResponse } from "next/server";
import { getDealerCounts } from "@/app/lib/server/googleSheets";

export async function GET() {
  try {
    console.log("API Route: Starting to fetch dealer counts...");

    // Check environment variables
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    if (!privateKey || !clientEmail || !spreadsheetId) {
      console.error("API Route: Missing required environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log("API Route: Environment variables verified, fetching data...");

    const stats = await getDealerCounts();

    console.log("API Route: Successfully fetched dealer counts");
    return NextResponse.json({ stats });
  } catch (error) {
    console.error("API Route: Error fetching dealer counts:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dealer counts",
      },
      { status: 500 }
    );
  }
}
