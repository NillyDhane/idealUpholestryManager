"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { listLayouts } from "../lib/storage";
import type { StorageLayout } from "../lib/storage";

interface UpholsteryLayoutProps {
  onLayoutSelect: (layout: StorageLayout) => void;
  selectedLayout?: StorageLayout | null;
  hideGrid?: boolean;
}

export default function UpholsteryLayout({
  onLayoutSelect,
  selectedLayout,
  hideGrid = false,
}: UpholsteryLayoutProps) {
  const [layouts, setLayouts] = useState<StorageLayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewLayout, setPreviewLayout] = useState<StorageLayout | null>(
    null
  );
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug log for props
  useEffect(() => {
    console.log("UpholsteryLayout props:", {
      selectedLayout,
      hideGrid,
    });
  }, [selectedLayout, hideGrid]);

  // Fetch layouts on mount
  useEffect(() => {
    async function fetchLayouts() {
      try {
        const layoutsList = await listLayouts();
        setLayouts(layoutsList);
        console.log("Fetched layouts:", layoutsList);
      } catch (err) {
        setError("Failed to load layouts. Please try again later.");
        console.error("Error loading layouts:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLayouts();
  }, []);

  const handleLayoutClick = (layout: StorageLayout, e: React.MouseEvent) => {
    e.preventDefault();
    setPreviewLayout(layout);
    setShowPreviewModal(true);
    setIsClosing(false);
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPreviewModal(false);
      setPreviewLayout(null);
      setIsClosing(false);
    }, 300);
  };

  const handleConfirmLayout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (previewLayout) {
      onLayoutSelect(previewLayout);
      handleCloseModal();
    }
  };

  const handleChangeLayout = () => {
    setPreviewLayout(null);
    onLayoutSelect({
      path: "",
      name: "",
      url: "",
      created_at: "",
      updated_at: "",
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
        Loading layouts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400 text-center">
        {error}
      </div>
    );
  }

  if (!layouts || layouts.length === 0) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
        No layouts available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-900 dark:text-white">
        Upholstery Layout
      </h2>

      {/* Selected Layout Display */}
      {selectedLayout && selectedLayout.url && (
        <div className="mb-6 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <h3 className="text-lg font-medium mb-2 text-blue-900 dark:text-blue-100">
            Selected Layout
          </h3>
          <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-lg overflow-hidden">
            <Image
              src={selectedLayout.url}
              alt={selectedLayout.name}
              fill
              className="object-cover transition-all duration-300 ease-in-out"
              onError={(e) => {
                console.error(
                  "Error loading layout image:",
                  selectedLayout.url
                );
                e.currentTarget.src = "/placeholder-image.jpg";
              }}
            />
          </div>
          <div className="mt-2 text-center text-blue-900 dark:text-blue-100">
            <p className="font-medium">{selectedLayout.name}</p>
          </div>
          {!hideGrid && (
            <div className="mt-4 text-center">
              <button
                onClick={handleChangeLayout}
                type="button"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Change Layout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Layout Grid - Only show if not hidden and no layout is selected, or if change layout was clicked */}
      {!hideGrid && (!selectedLayout?.url || showPreviewModal) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {layouts.map((layout) => (
            <button
              key={layout.path}
              onClick={(e) => handleLayoutClick(layout, e)}
              type="button"
              className={`group relative aspect-video w-full rounded-lg overflow-hidden border-2 transition-all duration-200 hover:cursor-pointer ${
                selectedLayout?.path === layout.path
                  ? "border-blue-500 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
              }`}
            >
              <Image
                src={layout.url}
                alt={layout.name}
                fill
                className="object-cover transition-all duration-300 ease-in-out"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                <p className="font-medium text-sm">{layout.name}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewLayout && (
        <div
          className={`fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 transition-opacity duration-300 ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
        >
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 relative shadow-xl transition-all duration-300 ${
              isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:cursor-pointer"
            >
              <svg
                className="w-6 h-6"
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

            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                {previewLayout.name}
              </h3>
              <div className="relative aspect-video w-full max-w-3xl mx-auto rounded-lg overflow-hidden mb-4">
                <Image
                  src={previewLayout.url}
                  alt={previewLayout.name}
                  fill
                  className="object-cover transition-all duration-300 ease-in-out"
                />
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleCloseModal}
                  type="button"
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium hover:cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => handleConfirmLayout(e)}
                  type="button"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors hover:cursor-pointer"
                >
                  Select Layout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
