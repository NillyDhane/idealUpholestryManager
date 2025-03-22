import { supabase } from "./supabase";
import { StorageError } from "@supabase/storage-js";

export interface StorageLayout {
  name: string;
  url: string;
  path: string;
  created_at: string;
  updated_at: string;
}

export async function initializeLayoutsBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const layoutsBucket = buckets?.find(
      (bucket) => bucket.name === "upholstery-layouts"
    );

    if (!layoutsBucket) {
      const { error } = await supabase.storage.createBucket(
        "upholstery-layouts",
        {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
        }
      );

      if (error) throw error;
      console.log("Layouts bucket created successfully");
    }
    return true;
  } catch (error) {
    if (error instanceof StorageError) {
      console.error("Error initializing layouts bucket:", error.message);
    } else {
      console.error("Unexpected error initializing layouts bucket:", error);
    }
    throw error;
  }
}

export async function listLayouts(): Promise<StorageLayout[]> {
  try {
    const { data: files, error } = await supabase.storage
      .from("upholstery-layouts")
      .list();

    if (error) throw error;

    // Map the files to include their public URLs
    const layouts = await Promise.all(
      (files || []).map(async (file) => {
        const {
          data: { publicUrl },
        } = supabase.storage.from("upholstery-layouts").getPublicUrl(file.name);

        return {
          name: file.name,
          url: publicUrl,
          path: file.name,
          created_at: file.created_at,
          updated_at: file.updated_at,
        };
      })
    );

    return layouts;
  } catch (error) {
    if (error instanceof StorageError) {
      console.error("Error listing layouts:", error.message);
    } else {
      console.error("Unexpected error listing layouts:", error);
    }
    throw error;
  }
}

export async function uploadLayoutImage(file: File) {
  try {
    // Ensure bucket exists
    await initializeLayoutsBucket();

    // Generate a unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()
      .toString(36)
      .substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from("upholstery-layouts")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error details:", uploadError);
      throw uploadError;
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("upholstery-layouts").getPublicUrl(filePath);

    return { url: publicUrl, path: filePath };
  } catch (error) {
    if (error instanceof StorageError) {
      console.error("Error uploading layout image:", error.message);
    } else {
      console.error("Unexpected error uploading layout image:", error);
    }
    throw error;
  }
}

export async function deleteLayoutImage(filePath: string) {
  try {
    const { error } = await supabase.storage
      .from("upholstery-layouts")
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    if (error instanceof StorageError) {
      console.error("Error deleting layout image:", error.message);
    } else {
      console.error("Unexpected error deleting layout image:", error);
    }
    throw error;
  }
}
