import { google } from "googleapis";
import { JWT } from "google-auth-library";

// These will be loaded from environment variables
const GOOGLE_SHEETS_PRIVATE_KEY =
  process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
const GOOGLE_SHEETS_CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

if (
  !GOOGLE_SHEETS_PRIVATE_KEY ||
  !GOOGLE_SHEETS_CLIENT_EMAIL ||
  !SPREADSHEET_ID
) {
  throw new Error("Missing Google Sheets credentials in environment variables");
}

// Initialize auth client
const client = new JWT({
  email: GOOGLE_SHEETS_CLIENT_EMAIL,
  key: GOOGLE_SHEETS_PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth: client });

export interface LocationData {
  name: string;
  count: number;
  trend: number;
}

export interface ProductionStatusData {
  vanNumber: string;
  customerName: string;
  model: string;
  status: string;
}

function getDealerLocation(dealer: string): string {
  // Convert to uppercase and trim whitespace
  const normalizedDealer = (dealer || "").toString().toUpperCase().trim();

  // Check for Ideal variations (including partial matches)
  if (normalizedDealer.includes("IDEAL")) return "Ideal";

  // Check for Geelong dealers
  if (
    normalizedDealer.includes("KEAN") ||
    normalizedDealer.includes("LEON") ||
    normalizedDealer.includes("LATITUDE")
  )
    return "Geelong";

  // Check for Wangaratta
  if (normalizedDealer.includes("HIGH COUNTRY")) return "Wangaratta";

  // Check for Adelaide City
  if (normalizedDealer.includes("KAKADU")) return "Adelaide City";

  console.log(`Unknown dealer format: "${normalizedDealer}"`);
  return "Unknown";
}

export async function getDealerCounts(): Promise<LocationData[]> {
  try {
    console.log("Fetching dealer counts...");
    console.log("Using spreadsheet ID:", SPREADSHEET_ID);

    // First, get spreadsheet info to verify access and available sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    console.log(
      "Available sheets:",
      spreadsheet.data.sheets?.map((sheet) => sheet.properties?.title)
    );

    // Get dealer column (Column E)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "SCHEDULE!E:E", // Changed from Sheet1 to SCHEDULE
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    console.log("Raw API response:", JSON.stringify(response.data, null, 2));

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.error("No data found in sheet. API Response:", response.data);
      throw new Error("No data found in sheet - sheet might be empty");
    }

    console.log("Found", rows.length, "rows in sheet");
    console.log("First few rows:", rows.slice(0, 5));

    // Initialize counters
    const locationCounts: Record<string, number> = {
      "Adelaide City": 0,
      "Geelong": 0,
      "Wangaratta": 0,
      "Ideal": 0,
    };

    // Keep track of dealers for debugging
    const dealersByLocation: Record<string, string[]> = {
      "Adelaide City": [],
      "Geelong": [],
      "Wangaratta": [],
      "Ideal": [],
      "Unknown": [],
    };

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const dealer = rows[i]?.[0];
      if (!dealer) {
        console.log(`Skipping empty row ${i + 1}`);
        continue;
      }

      const location = getDealerLocation(dealer);
      if (location === "Unknown") {
        dealersByLocation.Unknown.push(dealer);
        continue;
      }

      locationCounts[location]++;
      dealersByLocation[location].push(dealer);
    }

    // Log detailed counts for debugging
    console.log("\nDetailed Location Counts:");
    Object.entries(locationCounts).forEach(([location, count]) => {
      console.log(`\n${location}: ${count} dealers`);
      console.log("Dealers:", dealersByLocation[location]);
    });

    console.log("\nUnknown dealers:", dealersByLocation.Unknown);

    // Calculate simple trends (percentage of total)
    const total = Object.values(locationCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    const stats = Object.entries(locationCounts).map(([name, count]) => ({
      name,
      count,
      trend: total > 0 ? (count / total) * 100 : 0,
    }));

    console.log("Returning stats:", stats);
    return stats;
  } catch (error) {
    console.error("Error fetching dealer counts:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

export async function getProductionStatus(): Promise<ProductionStatusData[]> {
  try {
    console.log("Fetching production status data...");

    // Get all columns through S to include the production stages
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "SCHEDULE!A:S",
      valueRenderOption: "FORMATTED_VALUE",
    });

    const rows = response.data.values;
    if (!rows) {
      throw new Error("No data found in sheet");
    }

    console.log(`Found ${rows.length} rows`);

    // Define production stages in order
    const productionStages = [
      { column: 13, name: "Chassis In" },     // Column N
      { column: 14, name: "Walls Up" },       // Column O
      { column: 15, name: "Building" },       // Column P
      { column: 16, name: "Wiring" },         // Column Q
      { column: 17, name: "Cladding" },       // Column R
      { column: 18, name: "Finishing" }       // Column S
    ];

    const productionData: ProductionStatusData[] = [];

    // Skip the header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const vanNumber = (row[0] || "").toString().trim();
      const model = (row[3] || "").toString().trim();
      const customerName = (row[5] || "").toString().trim();

      // Skip if any required field is empty
      if (!vanNumber || !model || !customerName) {
        console.log("Skipping row due to empty required field:", { vanNumber, model, customerName });
        continue;
      }

      // Skip header rows (printing format rows)
      if (
        vanNumber === "Van Number" ||
        model === "Model" ||
        customerName === "Customer"
      ) {
        console.log("Skipping header row:", { vanNumber, model, customerName });
        continue;
      }

      // Validate van number format (LTRV followed by 5 digits)
      const vanNumberRegex = /^LTRV \d{5}$/;
      if (!vanNumberRegex.test(vanNumber)) {
        console.log("Skipping invalid van number format:", vanNumber);
        continue;
      }

      // Extract the van number for comparison (e.g., "25101" from "LTRV 25101")
      const vanNumberDigits = parseInt(vanNumber.split(" ")[1]);
      
      // Only include vans from 25101 onwards
      if (vanNumberDigits < 25101) {
        console.log("Skipping van number below 25101:", vanNumber);
        continue;
      }

      // Find the most recent production stage
      let currentStatus = "Not Started";
      for (const stage of productionStages) {
        const dateValue = (row[stage.column] || "").toString().trim();
        if (dateValue) {
          currentStatus = stage.name;
        }
      }

      productionData.push({
        vanNumber,
        model,
        customerName,
        status: currentStatus
      });
    }

    console.log(`Processed ${productionData.length} valid production entries`);
    console.log("First few entries:", productionData.slice(0, 3));
    
    // Sort by van number (newest first)
    productionData.sort((a, b) => {
      const aNum = parseInt(a.vanNumber.split(" ")[1]);
      const bNum = parseInt(b.vanNumber.split(" ")[1]);
      return bNum - aNum;
    });

    return productionData;
  } catch (error) {
    console.error("Error fetching production status:", error);
    throw error;
  }
}
