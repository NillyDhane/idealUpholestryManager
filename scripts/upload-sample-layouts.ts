import { config } from "dotenv";
import { resolve } from "path";
import { uploadLayoutImage } from "../app/lib/storage";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const sampleLayouts = [
  {
    name: "Test Layout 1",
    width: "1800",
    length: "1200",
    description: "Test layout configuration 1",
    filename: "test1.webp",
  },
  {
    name: "Test Layout 2",
    width: "2000",
    length: "1500",
    description: "Test layout configuration 2",
    filename: "test2.webp",
  },
];

async function uploadSampleLayouts() {
  console.log("Starting sample layout upload...");

  for (const layout of sampleLayouts) {
    try {
      const filePath = path.join(
        process.cwd(),
        "public",
        "sample-layouts",
        layout.filename
      );

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        console.error(
          `Make sure ${layout.filename} is in the public/sample-layouts directory`
        );
        continue;
      }

      // Read file and create File object
      const buffer = fs.readFileSync(filePath);
      const file = new File([buffer], layout.filename, {
        type: "image/webp",
      });

      const result = await uploadLayoutImage(file);
      console.log(`Uploaded ${layout.name}:`, result.url);

      // Log success details
      console.log({
        name: layout.name,
        width: layout.width,
        length: layout.length,
        url: result.url,
        path: result.path,
      });
    } catch (error) {
      console.error(`Error uploading ${layout.name}:`, error);
    }
  }

  console.log("Sample layout upload complete!");
}

uploadSampleLayouts().catch(console.error);
