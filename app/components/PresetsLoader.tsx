"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { UpholsteryOrder } from "../lib/supabase";
import { PresetPreview } from "./ui/preset-preview";

interface PresetsLoaderProps {
  onPresetSelect: (preset: UpholsteryOrder) => void;
}

export default function PresetsLoader({ onPresetSelect }: PresetsLoaderProps) {
  const [presets, setPresets] = useState<(UpholsteryOrder & { id: string })[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<
    (UpholsteryOrder & { id: string }) | null
  >(null);
  const [isClosingModal, setIsClosingModal] = useState(false);

  const loadPresets = async () => {
    try {
      const { data, error } = await supabase
        .from("upholstery_presets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Convert snake_case to camelCase for frontend
      const formattedPresets =
        data?.map((preset) => ({
          id: preset.id,
          createdAt: preset.created_at,
          presetName: preset.preset_name,
          vanNumber: preset.van_number,
          model: preset.model,
          modelType: preset.model_type,
          orderDate: preset.order_date,
          brandOfSample: preset.brand_of_sample,
          colorOfSample: preset.color_of_sample,
          bedHead: preset.bed_head,
          arms: preset.arms,
          base: preset.base,
          magPockets: preset.mag_pockets,
          headBumper: preset.head_bumper,
          other: preset.other,
          loungeType: preset.lounge_type,
          design: preset.design,
          curtain: preset.curtain,
          stitching: preset.stitching,
          bunkMattresses: preset.bunk_mattresses,
          // Add layout fields
          layoutId: preset.layout_id,
          layoutName: preset.layout_name,
          layoutImageUrl: preset.layout_image_url,
          layoutWidth: preset.layout_width,
          layoutLength: preset.layout_length,
        })) || [];

      setPresets(formattedPresets);
    } catch (err: unknown) {
      const error = err as { message: string };
      console.error("Error loading presets:", error.message);
      setError("Failed to load presets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPresets();
  }, []);

  const handleDeleteClick = (
    preset: UpholsteryOrder & { id: string },
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent triggering the preset selection
    setSelectedPreset(preset);
    setShowDeleteModal(true);
    setIsClosingModal(false);
  };

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowDeleteModal(false);
      setSelectedPreset(null);
      setIsClosingModal(false);
    }, 300);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPreset) return;

    try {
      const { error } = await supabase
        .from("upholstery_presets")
        .delete()
        .eq("id", selectedPreset.id);

      if (error) throw error;

      // Remove the preset from the local state
      setPresets(presets.filter((p) => p.id !== selectedPreset.id));
      handleCloseModal();
    } catch (err: unknown) {
      const error = err as { message: string };
      console.error("Error deleting preset:", error.message);
      setError("Failed to delete preset. Please try again.");
    }
  };

  return (
    <div
      className={`max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-300 ease-in-out transform ${
        loading ? "opacity-60" : "opacity-100"
      }`}
    >
      <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-900 dark:text-white">
        Saved Presets
      </h2>
      {loading && (
        <div className="p-8 flex flex-col justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="mt-4 text-gray-500 dark:text-gray-400">
            Loading presets...
          </div>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 rounded-lg animate-fade-in">
          {error}
        </div>
      )}
      {!loading && !error && presets.length === 0 && (
        <div className="p-4 text-gray-700 dark:text-gray-300 animate-fade-in">
          No saved presets found.
        </div>
      )}
      {!loading && !error && presets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
          {presets.map((preset, index) => (
            <div
              key={preset.id}
              className={`relative group transform transition-all duration-300 ease-in-out animate-fade-in animate-fade-in-delay-${Math.min(
                Math.floor(index / 3) + 1,
                4
              )}`}
            >
              <PresetPreview preset={preset}>
                <button
                  onClick={() => onPresetSelect(preset)}
                  className="w-full p-4 bg-white dark:bg-gray-700 rounded-md shadow hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-600 text-left hover:cursor-pointer hover:border-gray-300 dark:hover:border-gray-500"
                >
                  <h3 className="font-medium text-blue-600 dark:text-blue-400 mb-1 truncate pr-6">
                    {preset.presetName}
                  </h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    LTRV - {preset.vanNumber} | {preset.model}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(preset.createdAt || "").toLocaleDateString(
                      "en-GB"
                    )}
                  </div>
                </button>
              </PresetPreview>

              <button
                onClick={(e) => handleDeleteClick(preset, e)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:cursor-pointer transition-colors duration-200 opacity-0 group-hover:opacity-100"
                title="Remove preset"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPreset && (
        <div
          className={`fixed inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30 flex items-center justify-center z-50 transition-opacity duration-300 ${
            isClosingModal ? "opacity-0" : "opacity-100"
          }`}
        >
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg p-8 max-w-lg w-full mx-4 relative shadow-xl transition-all duration-300 ${
              isClosingModal ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:cursor-pointer transition-colors duration-200"
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
              <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                Delete Preset
              </h3>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete this preset?
                </p>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    {selectedPreset.presetName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    LTRV - {selectedPreset.vanNumber} | {selectedPreset.model}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Created:{" "}
                    {new Date(
                      selectedPreset.createdAt || ""
                    ).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium hover:cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 hover:cursor-pointer transition-colors duration-200"
                >
                  Delete Preset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
