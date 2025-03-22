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

interface AdminLayoutManagerProps {
  onLayoutChange?: () => void;
}

export default function AdminLayoutManager({
  onLayoutChange,
}: AdminLayoutManagerProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [layouts, setLayouts] = useState<StorageLayout[]>([]);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [editingLayout, setEditingLayout] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  // Fetch admin status and layouts on mount
  useEffect(() => {
    async function initialize() {
      if (!user) return;

      try {
        const { data, error } = await supabase.rpc("is_admin", {
          user_id: user.id,
        });

        if (error) {
          console.error("Error checking admin status:", error.message);
          return;
        }

        setIsAdmin(data || false);

        if (data) {
          // Only fetch layouts if user is admin
          const layoutsList = await listLayouts();
          setLayouts(layoutsList);
        }
      } catch (err) {
        console.error("Error during initialization:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [user]);

  if (!user || !isAdmin) {
    return null;
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

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <button
        onClick={() => setIsPanelExpanded(!isPanelExpanded)}
        className="w-full flex items-center justify-between text-xl font-semibold mb-4 text-gray-900 dark:text-white hover:cursor-pointer"
      >
        <span>Layout Management (Admin Only)</span>
        <svg
          className={`w-6 h-6 transform transition-transform ${
            isPanelExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`space-y-6 overflow-hidden transition-all duration-300 ${
          isPanelExpanded ? "max-h-[2000px]" : "max-h-0"
        }`}
      >
        {/* Upload Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Upload New Layout
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 hover:file:cursor-pointer
                dark:file:bg-blue-900/50 dark:file:text-blue-200"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Recommended: WebP format, max 10MB, 1920x1080px
            </p>
          </div>

          {isUploading && (
            <div className="text-blue-600 dark:text-blue-400">Uploading...</div>
          )}

          {error && (
            <div className="text-red-600 dark:text-red-400">{error}</div>
          )}

          {success && (
            <div className="text-green-600 dark:text-green-400">{success}</div>
          )}
        </div>

        {/* Layouts Grid */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Uploaded Layouts
          </h3>

          {isLoading ? (
            <div className="text-gray-500 dark:text-gray-400">
              Loading layouts...
            </div>
          ) : layouts.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">
              No layouts uploaded yet
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {layouts.map((layout) => (
                <div
                  key={layout.path}
                  className="relative group bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:cursor-pointer border-2 border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-all duration-200"
                >
                  <div className="aspect-video w-full relative bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={layout.url}
                      alt={layout.name}
                      fill
                      className="object-cover transition-all duration-300 ease-in-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-3">
                    {editingLayout === layout.path ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          placeholder="Enter new name"
                          autoFocus
                        />
                        <button
                          onClick={() => handleRename(layout)}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:cursor-pointer"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setEditingLayout(null);
                            setNewName("");
                          }}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {layout.name.split(".")[0]}
                        </p>
                        <button
                          onClick={() => {
                            const nameWithoutExt = layout.name.split(".")[0];
                            setEditingLayout(layout.path);
                            setNewName(nameWithoutExt);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Uploaded:{" "}
                      {new Date(layout.created_at).toLocaleDateString()} @{" "}
                      {new Date(layout.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(layout);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-100 dark:bg-red-900 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:cursor-pointer"
                    title="Delete layout"
                  >
                    <svg
                      className="w-4 h-4 text-red-600 dark:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
