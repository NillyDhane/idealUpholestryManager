import { initializeLayoutsBucket } from "./storage";

export async function initializeApp() {
  try {
    console.log("Initializing app...");
    // Initialize Supabase storage buckets
    await initializeLayoutsBucket();
    console.log("App initialization complete");
  } catch (error) {
    console.error("Error during app initialization:", error);
    // Don't throw the error here, as we want the app to continue loading
    // even if bucket initialization fails
  }
}
