"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../lib/supabase";
import type { UpholsteryOrder } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { brands, brandColors } from "../lib/brandData";
import type { StorageLayout } from "../lib/storage";
import UpholsteryLayout from "./UpholsteryLayout";

interface UpholsteryFormProps {
  onOrderSubmitted?: (order: UpholsteryOrder) => void;
  preset?: UpholsteryOrder | null;
}

interface FormData extends Omit<UpholsteryOrder, "id" | "createdAt"> {
  layoutId: string;
  layoutName: string;
  layoutImageUrl: string;
  layoutWidth: string;
  layoutLength: string;
}

export default function UpholsteryForm({
  onOrderSubmitted,
  preset,
}: UpholsteryFormProps) {
  const { user } = useAuth();
  const [selectedLayout, setSelectedLayout] = useState<StorageLayout | null>(
    null
  );

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      vanNumber: "",
      model: "",
      modelType: "",
      orderDate: new Date().toISOString().split("T")[0],
      brandOfSample: "",
      colorOfSample: "",
      bedHead: "Small",
      arms: "Short",
      base: "",
      magPockets: "1 x Large",
      headBumper: "true",
      other: "",
      loungeType: "Cafe",
      design: "Essential Back",
      curtain: "Yes",
      stitching: "Contrast",
      bunkMattresses: "None",
      layoutId: "",
      layoutWidth: "",
      layoutLength: "",
      layoutName: "",
      layoutImageUrl: "",
    },
  });

  // Watch for changes in the brand field
  const watchBrand = watch("brandOfSample");

  // Effect to update form when preset changes
  useEffect(() => {
    if (preset) {
      console.log("Loading preset:", preset);
      reset(preset);
    }
  }, [preset, reset]);

  const handleLayoutSelect = (layout: StorageLayout) => {
    setSelectedLayout(layout);
    setValue("layoutId", layout.path);
    setValue("layoutName", layout.name);
    setValue("layoutImageUrl", layout.url);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!selectedLayout) {
        throw new Error("Please select a layout before submitting");
      }

      // Add current time to the order date
      const now = new Date();
      const orderDateTime = new Date(data.orderDate);
      orderDateTime.setHours(now.getHours(), now.getMinutes());
      data.orderDate = orderDateTime.toISOString();

      // Prepare data for submission
      const submissionData = {
        user_id: user?.id,
        van_number: parseInt(data.vanNumber),
        model: data.model,
        model_type: data.modelType?.split(" - ")[0] || "",
        order_date: data.orderDate,
        brand_of_sample: data.brandOfSample,
        color_of_sample: data.colorOfSample,
        bed_head: data.bedHead,
        arms: data.arms,
        base: data.base || "",
        mag_pockets: data.magPockets,
        head_bumper: data.headBumper,
        other: data.other || "",
        lounge_type: data.loungeType,
        design: data.design,
        curtain: data.curtain,
        stitching: data.stitching,
        bunk_mattresses: data.bunkMattresses,
        layout_id: selectedLayout.path,
        layout_name: selectedLayout.name,
        layout_image_url: selectedLayout.url,
      };

      const { error } = await supabase
        .from("upholstery_orders")
        .insert([submissionData]);

      if (error) throw error;

      if (onOrderSubmitted) {
        onOrderSubmitted(submissionData as unknown as UpholsteryOrder);
      }
    } catch (error: unknown) {
      console.error("Error submitting order:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to submit order: ${error.message}`);
      } else {
        throw new Error(
          "An unexpected error occurred while submitting the order"
        );
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Information Card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="vanNumber"
                    className="text-sm font-medium leading-none"
                  >
                    Van Number
                  </label>
                  <input
                    type="text"
                    id="vanNumber"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("vanNumber")}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="model"
                    className="text-sm font-medium leading-none"
                  >
                    Model
                  </label>
                  <input
                    type="text"
                    id="model"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("model")}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="modelType"
                    className="text-sm font-medium leading-none"
                  >
                    Model Type
                  </label>
                  <input
                    type="text"
                    id="modelType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("modelType")}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="orderDate"
                    className="text-sm font-medium leading-none"
                  >
                    Order Date
                  </label>
                  <input
                    type="date"
                    id="orderDate"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("orderDate")}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="brandOfSample"
                    className="text-sm font-medium leading-none"
                  >
                    Brand of Sample
                  </label>
                  <select
                    id="brandOfSample"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("brandOfSample")}
                  >
                    <option value="">Select a Brand</option>
                    {[...brands].map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {watchBrand && (
                  <div className="space-y-2">
                    <label
                      htmlFor="colorOfSample"
                      className="text-sm font-medium leading-none"
                    >
                      Color of Sample
                    </label>
                    <select
                      id="colorOfSample"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      {...register("colorOfSample")}
                    >
                      <option value="">Select a Color</option>
                      {brandColors[watchBrand as keyof typeof brandColors].map(
                        (color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Design Options Card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Design Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="bedHead"
                    className="text-sm font-medium leading-none"
                  >
                    Bed Head
                  </label>
                  <select
                    id="bedHead"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("bedHead")}
                  >
                    <option value="Small">Small</option>
                    <option value="Large">Large</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="arms"
                    className="text-sm font-medium leading-none"
                  >
                    Arms
                  </label>
                  <select
                    id="arms"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("arms")}
                  >
                    <option value="Short">Short</option>
                    <option value="Large">Large</option>
                    <option value="Recessed Footrest">Recessed Footrest</option>
                    <option value="GT arm">GT arm</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="base"
                    className="text-sm font-medium leading-none"
                  >
                    Base
                  </label>
                  <input
                    type="text"
                    id="base"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("base")}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="magPockets"
                    className="text-sm font-medium leading-none"
                  >
                    Magazine Pockets
                  </label>
                  <select
                    id="magPockets"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("magPockets")}
                  >
                    <option value="1 x Large">1 x Large</option>
                    <option value="1 x Small">1 x Small</option>
                    <option value="1 x Large + 2 small">
                      1 x Large + 2 small
                    </option>
                    <option value="1 x Large + 3 small">
                      1 x Large + 3 small
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="headBumper"
                    className="text-sm font-medium leading-none"
                  >
                    Head Bumper
                  </label>
                  <select
                    id="headBumper"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("headBumper")}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="other"
                    className="text-sm font-medium leading-none"
                  >
                    Other
                  </label>
                  <select
                    id="other"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("other")}
                  >
                    <option value="">None</option>
                    <option value="Bunk Facia 1">Bunk Facia 1</option>
                    <option value="Bunk Facia 2">Bunk Facia 2</option>
                    <option value="Bunk Facia 3">Bunk Facia 3</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Options Card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Additional Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="loungeType"
                    className="text-sm font-medium leading-none"
                  >
                    Lounge Type
                  </label>
                  <select
                    id="loungeType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("loungeType")}
                  >
                    <option value="Cafe">Cafe</option>
                    <option value="Club">Club</option>
                    <option value="L shape">L shape</option>
                    <option value="Straight">Straight</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="design"
                    className="text-sm font-medium leading-none"
                  >
                    Design
                  </label>
                  <select
                    id="design"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("design")}
                  >
                    <option value="Essential Back">Essential Back</option>
                    <option value="Soft Back">Soft Back</option>
                    <option value="As Per Picture">As Per Picture</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="curtain"
                    className="text-sm font-medium leading-none"
                  >
                    Curtain
                  </label>
                  <select
                    id="curtain"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("curtain")}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="stitching"
                    className="text-sm font-medium leading-none"
                  >
                    Stitching
                  </label>
                  <select
                    id="stitching"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("stitching")}
                  >
                    <option value="Contrast">Contrast</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Same Colour">Same Colour</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="bunkMattresses"
                    className="text-sm font-medium leading-none"
                  >
                    Bunk Mattresses
                  </label>
                  <select
                    id="bunkMattresses"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("bunkMattresses")}
                  >
                    <option value="None">None</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Selection Card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Layout Selection</h3>
              <UpholsteryLayout onLayoutSelect={handleLayoutSelect} />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Submit Order
          </button>
        </div>
      </div>
    </form>
  );
}
