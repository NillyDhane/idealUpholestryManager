import { NextResponse } from "next/server";
import { sheets } from "@/lib/googleSheets";
import { SPREADSHEET_ID } from "@/lib/constants";

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

    // Fetch the data from the SCHEDULE sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "SCHEDULE!A:S", // Columns A through S
    });

    const rows = response.data.values;
    if (!rows) {
      throw new Error("No data found in sheet");
    }

    // Find the row with matching van number
    const headerRow = rows[0];
    const vanRow = rows.find((row) => row[0] === vanNumber); // Assuming van number is in column A

    if (!vanRow) {
      return NextResponse.json(
        { error: "Van not found" },
        { status: 404 }
      );
    }

    // Helper function to check if a cell has an X mark
    const isComplete = (value: string) => {
      return value?.toLowerCase() === "x";
    };

    // Helper function to determine the most recent status
    const getMostRecentStatus = (vanRow: any[], indices: any) => {
      const statuses = [
        { name: "Finishing", date: vanRow[indices.finishing] },
        { name: "Cladding", date: vanRow[indices.cladding] },
        { name: "Wiring", date: vanRow[indices.wiring] },
        { name: "Building", date: vanRow[indices.building] },
        { name: "Walls Up", date: vanRow[indices.wallsUp] },
        { name: "Chassis In", date: vanRow[indices.chassisIn] }
      ];

      // Find the most recent status that has a date
      const currentStatus = statuses.find(status => status.date);
      return currentStatus ? currentStatus.name : "Not Started";
    };

    // Get the column indices
    const columnIndices = {
      vanNumber: 0,
      customerName: headerRow.findIndex(col => col.toLowerCase().includes("customer")),
      model: 3, // Column D contains the model
      benchtops: 6, // Column G
      doors: 7, // Column H
      upholstery: 8, // Column I
      chassis: 9, // Column J
      furniture: 10, // Column K
      comments: 11, // Column L
      chassisIn: 13, // Column N
      wallsUp: 14, // Column O
      building: 15, // Column P
      wiring: 16, // Column Q
      cladding: 17, // Column R
      finishing: 18, // Column S
    };

    // Construct the van details object
    const vanDetails = {
      vanNumber: vanRow[columnIndices.vanNumber],
      customerName: vanRow[columnIndices.customerName],
      model: vanRow[columnIndices.model] || "",
      status: getMostRecentStatus(vanRow, columnIndices),
      benchtops: isComplete(vanRow[columnIndices.benchtops]),
      doors: isComplete(vanRow[columnIndices.doors]),
      upholstery: isComplete(vanRow[columnIndices.upholstery]),
      chassis: isComplete(vanRow[columnIndices.chassis]),
      furniture: isComplete(vanRow[columnIndices.furniture]),
      comments: vanRow[columnIndices.comments] || "",
      chassisIn: vanRow[columnIndices.chassisIn] || null,
      wallsUp: vanRow[columnIndices.wallsUp] || null,
      building: vanRow[columnIndices.building] || null,
      wiring: vanRow[columnIndices.wiring] || null,
      cladding: vanRow[columnIndices.cladding] || null,
      finishing: vanRow[columnIndices.finishing] || null,
    };

    // Special handling for Finishing status
    if (!vanDetails.finishing && vanDetails.cladding) {
      vanDetails.finishing = vanDetails.cladding;
    }

    return NextResponse.json(vanDetails);
  } catch (error) {
    console.error("Error fetching van details:", error);
    return NextResponse.json(
      { error: "Failed to fetch van details" },
      { status: 500 }
    );
  }
} 