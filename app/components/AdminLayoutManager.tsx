import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  uploadLayoutImage,
  deleteLayoutImage,
  listLayouts,
} from "../lib/storage";
import type { StorageLayout } from "../lib/storage";
import { supabase } from "../lib/supabase";
import Image from "next/image";
import { Upload, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

interface AdminLayoutManagerProps {
  onLayoutChange?: () => void;
}

export default function AdminLayoutManager({
  onLayoutChange,
}: AdminLayoutManagerProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [layouts, setLayouts] = useState<StorageLayout[]>([]);
  const [editingLayout, setEditingLayout] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  // Fetch admin status and layouts on mount
  useEffect(() => {
    async function initialize() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("is_admin", {
          user_id: user.id,
        });

        if (error) {
          setError("Error checking admin permissions");
          setIsLoading(false);
          return;
        }

        setIsAdmin(data || false);

        if (data) {
          try {
            const layoutsList = await listLayouts();
            setLayouts(layoutsList);
          } catch (err) {
            setError("Error loading layouts");
          }
        } else {
          setError("You do not have admin permissions");
        }
      } catch (err) {
        setError("Error initializing admin panel");
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-destructive">
        Please sign in to access admin features.
      </div>
    );
  }

  if (!isAdmin && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-destructive">
        {error || "You do not have permission to access this page."}
      </div>
    );
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      setSuccess(null);

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB");
      }

      await uploadLayoutImage(file);
      setSuccess(`Successfully uploaded: ${file.name}`);

      // Refresh layouts list
      const updatedLayouts = await listLayouts();
      setLayouts(updatedLayouts);

      if (onLayoutChange) onLayoutChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (layout: StorageLayout) => {
    if (!confirm(`Are you sure you want to delete ${layout.name}?`)) {
      return;
    }

    try {
      setError(null);
      await deleteLayoutImage(layout.path);

      // Remove from local state
      setLayouts(layouts.filter((l) => l.path !== layout.path));

      setSuccess(`Successfully deleted: ${layout.name}`);
      if (onLayoutChange) onLayoutChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
    }
  };

  const handleRename = async (layout: StorageLayout) => {
    if (!newName.trim()) return;

    try {
      setError(null);

      // Get the file extension
      const fileExtension = layout.path.split(".").pop() || "";

      // Create the new file name with the original extension
      const newFileName = `${newName.trim()}.${fileExtension}`;

      // Move the file in Supabase Storage (this effectively renames it)
      const { error: moveError } = await supabase.storage
        .from("upholstery-layouts")
        .move(layout.path, newFileName);

      if (moveError) {
        throw moveError;
      }

      // Get the new URL for the renamed file
      const {
        data: { publicUrl: newUrl },
      } = supabase.storage.from("upholstery-layouts").getPublicUrl(newFileName);

      // Update local state with new name, path, and URL
      const updatedLayouts = layouts.map((l) =>
        l.path === layout.path
          ? {
              ...l,
              name: newFileName,
              path: newFileName,
              url: newUrl,
            }
          : l
      );

      setLayouts(updatedLayouts);
      setEditingLayout(null);
      setNewName("");
      setSuccess(`Successfully renamed to: ${newFileName}`);

      if (onLayoutChange) onLayoutChange();
    } catch (err) {
      console.error("Error renaming file:", err);
      setError(err instanceof Error ? err.message : "Failed to rename file");
    }
  };

  const handleSave = async () => {
    try {
      await saveLayout(layouts)
      toast.success("Layout saved successfully")
    } catch {
      toast.error("Failed to save layout")
    }
  }

  const handleReset = async () => {
    try {
      await resetLayout()
      toast.success("Layout reset successfully")
    } catch {
      toast.error("Failed to reset layout")
    }
  }

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className={cn(
        "rounded-lg border bg-card p-6",
        isLoading && "opacity-50 pointer-events-none"
      )}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Upload New Layout</h3>
              <p className="text-sm text-muted-foreground">
                Add a new layout to your collection
              </p>
            </div>
            <Button
              variant="outline"
              className="relative overflow-hidden"
              disabled={isUploading || isLoading}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading || isLoading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : "Choose File"}
            </Button>
          </div>

          {(error || success) && (
            <div className={cn(
              "text-sm px-4 py-3 rounded-lg",
              error ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"
            )}>
              {error || success}
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted/50 px-4 py-3 rounded-lg">
            <p>📝 Recommendations:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Use WebP format for best quality and performance</li>
              <li>Maximum file size: 10MB</li>
              <li>Optimal resolution: 1920x1080px</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Layouts Grid */}
      <div className={cn(
        "space-y-4",
        isLoading && "opacity-50 pointer-events-none"
      )}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold">Uploaded Layouts</h3>
            <p className="text-sm text-muted-foreground">
              {layouts.length === 0
                ? "No layouts uploaded yet"
                : `${layouts.length} layout${layouts.length === 1 ? "" : "s"} available`}
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading layouts...</p>
            </div>
          </div>
        )}

        {!isLoading && layouts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {layouts.map((layout) => (
              <div
                key={layout.path}
                className="group relative bg-muted rounded-lg overflow-hidden border transition-all duration-200 hover:border-primary/50 hover:shadow-sm"
              >
                <div className="aspect-video w-full relative bg-muted">
                  <Image
                    src={layout.url}
                    alt={layout.name}
                    fill
                    className="object-cover transition-all duration-300 ease-in-out"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(layout);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    title="Delete layout"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </button>
                </div>
                <div className="p-3 bg-background/80 backdrop-blur-sm">
                  {editingLayout === layout.path ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Enter new name"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleRename(layout)}
                      >
                        <span className="sr-only">Save</span>
                        ✓
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setEditingLayout(null);
                          setNewName("");
                        }}
                      >
                        <span className="sr-only">Cancel</span>
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {layout.name.split(".")[0]}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                        onClick={() => {
                          const nameWithoutExt = layout.name.split(".")[0];
                          setEditingLayout(layout.path);
                          setNewName(nameWithoutExt);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit name</span>
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploaded: {new Date(layout.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
