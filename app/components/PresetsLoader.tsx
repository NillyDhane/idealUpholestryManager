"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { UpholsteryOrder } from "../lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface PresetsLoaderProps {
  onPresetSelect: (preset: UpholsteryOrder) => void;
}

export default function PresetsLoader({ onPresetSelect }: PresetsLoaderProps) {
  const [presets, setPresets] = useState<(UpholsteryOrder & { id: string })[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<
    (UpholsteryOrder & { id: string }) | null
  >(null);

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
      setIsLoading(false);
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
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPreset(null);
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
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading presets...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive">
          {error}
        </div>
      ) : presets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No saved presets found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {presets.map((preset) => (
            <div key={preset.id} className="relative group">
              <button
                onClick={() => onPresetSelect(preset)}
                className="w-full p-4 rounded-md border bg-card text-card-foreground shadow-sm hover:bg-accent/50 transition-colors text-left"
              >
                <h3 className="font-medium text-primary mb-1 truncate pr-6">
                  {preset.presetName}
                </h3>
                <div className="text-sm text-muted-foreground truncate">
                  LTRV - {preset.vanNumber} | {preset.model}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {new Date(preset.createdAt || "").toLocaleDateString("en-GB")}
                </div>
              </button>

              <button
                onClick={(e) => handleDeleteClick(preset, e)}
                className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                title="Remove preset"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showModal} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Preset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this preset? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedPreset && (
            <div className="rounded-md bg-muted p-4">
              <p className="font-medium mb-1">
                {selectedPreset.presetName}
              </p>
              <p className="text-sm text-muted-foreground">
                LTRV - {selectedPreset.vanNumber} | {selectedPreset.model}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Created: {new Date(selectedPreset.createdAt || "").toLocaleDateString("en-GB")}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
