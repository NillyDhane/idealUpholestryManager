import { NextResponse } from "next/server";
import { google } from "googleapis";
import { JWT } from "google-auth-library";

interface VanDetails {
  vanNumber: string;
  customerName: string;
  model: string;
  benchtops: boolean;
  doors: boolean;
  upholstery: boolean;
  chassis: boolean;
  furniture: boolean;
  comments: string;
  chassisIn: string | null;
  wallsUp: string | null;
  building: string | null;
  wiring: string | null;
  cladding: string | null;
  finishing: string | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vanNumber = searchParams.get("vanNumber");

    if (!vanNumber) {
      return NextResponse.json(
        { error: "Van number is required" },
        { status: 400 }
      );
    }

    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Van Details!A:N",
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json(
        { error: "No data found" },
        { status: 404 }
      );
    }

    const headers = rows[0];
    const vanIndex = headers.indexOf("Van Number");
    const customerNameIndex = headers.indexOf("Customer Name");
    const modelIndex = headers.indexOf("Model");
    const benchtopsIndex = headers.indexOf("Benchtops");
    const doorsIndex = headers.indexOf("Doors");
    const upholsteryIndex = headers.indexOf("Upholstery");
    const chassisIndex = headers.indexOf("Chassis");
    const furnitureIndex = headers.indexOf("Furniture");
    const commentsIndex = headers.indexOf("Comments");
    const chassisInIndex = headers.indexOf("Chassis In");
    const wallsUpIndex = headers.indexOf("Walls Up");
    const buildingIndex = headers.indexOf("Building");
    const wiringIndex = headers.indexOf("Wiring");
    const claddingIndex = headers.indexOf("Cladding");
    const finishingIndex = headers.indexOf("Finishing");

    const vanRow = rows.find((row) => row[vanIndex] === vanNumber);
    if (!vanRow) {
      return NextResponse.json(
        { error: "Van not found" },
        { status: 404 }
      );
    }

    const vanDetails: VanDetails = {
      vanNumber: vanRow[vanIndex],
      customerName: vanRow[customerNameIndex],
      model: vanRow[modelIndex],
      benchtops: vanRow[benchtopsIndex] === "TRUE",
      doors: vanRow[doorsIndex] === "TRUE",
      upholstery: vanRow[upholsteryIndex] === "TRUE",
      chassis: vanRow[chassisIndex] === "TRUE",
      furniture: vanRow[furnitureIndex] === "TRUE",
      comments: vanRow[commentsIndex],
      chassisIn: vanRow[chassisInIndex] || null,
      wallsUp: vanRow[wallsUpIndex] || null,
      building: vanRow[buildingIndex] || null,
      wiring: vanRow[wiringIndex] || null,
      cladding: vanRow[claddingIndex] || null,
      finishing: vanRow[finishingIndex] || null,
    };

    return NextResponse.json(vanDetails);
  } catch (error) {
    console.error("Error fetching van details:", error);
    return NextResponse.json(
      { error: "Failed to fetch van details" },
      { status: 500 }
    );
  }
}

async function updateVanDetails(vanId: string, updates: Partial<VanDetails>) {
  // Implementation of updateVanDetails function
} 