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
  activeProducts: number;
  trend: number; // Percentage change
}

export interface HistoricalData {
  date: string;
  location: string;
  value: number;
}

function getDealerLocation(dealer: string): string {
  dealer = dealer.toUpperCase().trim();

  if (dealer.includes("KAKADU")) return "Adelaide City";
  if (dealer.includes("LEON") || dealer.includes("KEAN")) return "Geelong";
  if (dealer.includes("HIGH COUNTRY")) return "Wangaratta";
  if (dealer.includes("IDEAL") || dealer.includes("TASMAN")) return "Ideal";

  return "Unknown";
}

function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export async function getLocationStats(): Promise<LocationData[]> {
  try {
    console.log("Fetching location stats...");

    // Get all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "A:R", // Assuming columns A through R
    });

    const rows = response.data.values;
    if (!rows) {
      throw new Error("No data found in sheet");
    }

    console.log("Found", rows.length, "rows in sheet");
    console.log("Headers:", rows[0]);

    // Find the Dealer column index (should be column E or 4 if 0-based)
    const headerRow = rows[0];
    const dealerColumnIndex = headerRow.findIndex(
      (col: string) => col.toLowerCase() === "dealer"
    );

    if (dealerColumnIndex === -1) {
      throw new Error("Dealer column not found");
    }

    console.log("Dealer column found at index:", dealerColumnIndex);

    // Get current month and previous month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Count dealers for current and previous month
    const currentCounts: Record<string, number> = {
      "Adelaide City": 0,
      "Geelong": 0,
      "Wangaratta": 0,
      "Ideal": 0,
    };

    const previousCounts: Record<string, number> = {
      "Adelaide City": 0,
      "Geelong": 0,
      "Wangaratta": 0,
      "Ideal": 0,
    };

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[dealerColumnIndex]) continue; // Skip empty dealer cells

      const dealer = row[dealerColumnIndex];
      const location = getDealerLocation(dealer);
      if (location === "Unknown") continue;

      // Get the date from Van Due column (column B or 1 if 0-based)
      const dateStr = row[1];
      if (!dateStr) continue;

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.log("Invalid date found:", dateStr);
        continue;
      }

      if (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      ) {
        currentCounts[location]++;
      } else if (
        date.getMonth() === (currentMonth - 1 + 12) % 12 &&
        (currentMonth === 0
          ? date.getFullYear() === currentYear - 1
          : date.getFullYear() === currentYear)
      ) {
        previousCounts[location]++;
      }
    }

    console.log("Current counts:", currentCounts);
    console.log("Previous counts:", previousCounts);

    // Calculate trends and format response
    return Object.entries(currentCounts).map(([name, count]) => ({
      name,
      activeProducts: count,
      trend: calculateTrend(
        count,
        previousCounts[name as keyof typeof previousCounts]
      ),
    }));
  } catch (error) {
    console.error("Error fetching location stats:", error);
    throw error;
  }
}

export async function getHistoricalData(): Promise<HistoricalData[]> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "A:R", // Assuming columns A through R
    });

    const rows = response.data.values;
    if (!rows) {
      throw new Error("No data found in sheet");
    }

    // Find the Dealer column index
    const headerRow = rows[0];
    const dealerColumnIndex = headerRow.findIndex(
      (col: string) => col.toLowerCase() === "dealer"
    );

    if (dealerColumnIndex === -1) {
      throw new Error("Dealer column not found");
    }

    // Initialize data structure to hold monthly counts
    const monthlyCounts: Record<string, Record<string, number>> = {};

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[dealerColumnIndex]) continue; // Skip empty dealer cells

      const dealer = row[dealerColumnIndex];
      const location = getDealerLocation(dealer);
      if (location === "Unknown") continue;

      // Get the date from Van Due column
      const dateStr = row[1];
      if (!dateStr) continue;

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) continue; // Skip invalid dates

      // Format date as YYYY-MM
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyCounts[monthKey]) {
        monthlyCounts[monthKey] = {
          "Adelaide City": 0,
          "Geelong": 0,
          "Wangaratta": 0,
          "Ideal": 0,
        };
      }

      monthlyCounts[monthKey][location]++;
    }

    // Convert to required format
    const result: HistoricalData[] = [];
    Object.entries(monthlyCounts)
      .sort(([a], [b]) => a.localeCompare(b)) // Sort by date
      .forEach(([date, counts]) => {
        Object.entries(counts).forEach(([location, value]) => {
          result.push({ date, location, value });
        });
      });

    return result;
  } catch (error) {
    console.error("Error fetching historical data:", error);
    throw error;
  }
}
