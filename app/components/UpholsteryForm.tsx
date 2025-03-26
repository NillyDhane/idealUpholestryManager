"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../lib/supabase";
import type { UpholsteryOrder } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { brands, brandColors } from "../lib/brandData";
import type { StorageLayout } from "../lib/storage";
import { listLayouts } from "../lib/storage";
import UpholsteryLayout from "./UpholsteryLayout";
import { OrderSuccessModal } from "./ui/order-success-modal";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
  const [selectedLayout, setSelectedLayout] = useState<StorageLayout | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<UpholsteryOrder | null>(null);
  const [layouts, setLayouts] = useState<StorageLayout[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(z.object({
      customerName: z.string().min(1, "Customer name is required"),
      vanNumber: z.string().min(1, "Van number is required").regex(/^[0-9]+$/, "Van number must contain only numbers"),
      model: z.string().min(1, "Model is required"),
      modelType: z.string().min(1, "Model type is required"),
      orderDate: z.string().min(1, "Order date is required"),
      brandOfSample: z.string().min(1, "Brand of sample is required"),
      colorOfSample: z.string().min(1, "Color of sample is required"),
      bedHead: z.string().min(1, "Bed head is required"),
      arms: z.string().min(1, "Arms are required"),
      base: z.string().optional(),
      magPockets: z.string().min(1, "Magazine pockets are required"),
      headBumper: z.boolean(),
      other: z.string().optional(),
      loungeType: z.string().min(1, "Lounge type is required"),
      design: z.string().min(1, "Design is required"),
      curtain: z.boolean(),
      stitching: z.string().min(1, "Stitching is required"),
      bunkMattresses: z.string().min(1, "Bunk mattresses are required"),
      layoutId: z.string().min(1, "Layout is required"),
      layoutWidth: z.string().min(1, "Layout width is required"),
      layoutLength: z.string().min(1, "Layout length is required"),
      layoutName: z.string().min(1, "Layout name is required"),
      layoutImageUrl: z.string().min(1, "Layout image URL is required"),
    })),
    defaultValues: {
      customerName: "",
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
      headBumper: true,
      other: "",
      loungeType: "Cafe",
      design: "Essential Back",
      curtain: true,
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

  // Memoize the layout selection function
  const handleLayoutSelect = useCallback((layout: StorageLayout) => {
    setSelectedLayout(layout);
    setValue("layoutId", layout.path);
    setValue("layoutName", layout.name);
    setValue("layoutImageUrl", layout.url);
    setValue("layoutWidth", layout.width);
    setValue("layoutLength", layout.length);
  }, [setValue]);

  // Effect to load layouts
  useEffect(() => {
    const loadLayouts = async () => {
      try {
        const layoutList = await listLayouts();
        setLayouts(layoutList);
      } catch (error) {
        console.error("Error loading layouts:", error);
      }
    };
    loadLayouts();
  }, []);

  // Effect to update form when preset changes
  useEffect(() => {
    if (preset && layouts.length > 0) {
      console.log("Loading preset:", preset);
      reset(preset);
      
      // Set the selected layout if the preset has layout information
      if (preset.layoutId) {
        // Find the matching layout from the layouts list
        const matchingLayout = layouts.find(l => l.path === preset.layoutId);
        if (matchingLayout) {
          console.log("Found matching layout:", matchingLayout);
          // Set the selected layout state
          setSelectedLayout(matchingLayout);
          // Update form values
          setValue("layoutId", matchingLayout.path);
          setValue("layoutName", matchingLayout.name);
          setValue("layoutImageUrl", matchingLayout.url);
          setValue("layoutWidth", matchingLayout.width);
          setValue("layoutLength", matchingLayout.length);
        } else {
          console.log("No matching layout found for:", preset.layoutId);
        }
      }
    }
  }, [preset, reset, layouts, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      // Validate required fields
      if (!data.vanNumber || !data.model || !data.modelType || !data.brandOfSample || !data.colorOfSample) {
        alert("Please fill in all required fields");
        return;
      }

      // Validate layout selection
      if (!selectedLayout) {
        alert("Please select a layout before submitting");
        return;
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

      const { data: result, error } = await supabase
        .from("upholstery_orders")
        .insert([submissionData])
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message || "Failed to save order to database");
      }

      if (!result) {
        throw new Error("No data returned from database");
      }

      if (onOrderSubmitted) {
        onOrderSubmitted(submissionData as unknown as UpholsteryOrder);
      }

      // Set the submitted order and show success modal
      setSubmittedOrder(submissionData as unknown as UpholsteryOrder);
      setShowSuccessModal(true);

      // Reset form after successful submission
      reset();
      setSelectedLayout(null);

      toast.success("Form submitted successfully");
    } catch (error: unknown) {
      console.error("Error submitting order:", error);
      if (error instanceof Error) {
        alert(`Failed to submit order: ${error.message}`);
      } else {
        alert("An unexpected error occurred while submitting the order. Please try again.");
      }
      toast.error("Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        LTRV -
                      </span>
                      <input
                        type="number"
                        id="vanNumber"
                        min="0"
                        step="1"
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-16 pr-3 py-2 text-sm ring-offset-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        {...register("vanNumber")}
                      />
                      {errors.vanNumber && (
                        <p className="text-sm text-red-500 mt-1">{errors.vanNumber.message}</p>
                      )}
                    </div>
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
                    {errors.model && (
                      <p className="text-sm text-red-500 mt-1">{errors.model.message}</p>
                    )}
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
                    {errors.modelType && (
                      <p className="text-sm text-red-500 mt-1">{errors.modelType.message}</p>
                    )}
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
                    {errors.brandOfSample && (
                      <p className="text-sm text-red-500 mt-1">{errors.brandOfSample.message}</p>
                    )}
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
                      {errors.colorOfSample && (
                        <p className="text-sm text-red-500 mt-1">{errors.colorOfSample.message}</p>
                      )}
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
                      placeholder="Input base options"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {layouts.map((layout) => (
                    <div
                      key={layout.path}
                      className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedLayout?.path === layout.path
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      } ${selectedLayout && selectedLayout.path !== layout.path ? 'opacity-50' : ''}`}
                      onClick={() => handleLayoutSelect(layout)}
                    >
                      <div className="relative w-full h-48">
                        <Image
                          src={layout.url}
                          alt={layout.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover rounded-md"
                          priority={false}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              disabled={isSubmitting}
            >
              Submit Order
            </button>
          </div>
        </div>
      </form>

      {submittedOrder && (
        <OrderSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          order={submittedOrder}
        />
      )}
    </>
  );
}
