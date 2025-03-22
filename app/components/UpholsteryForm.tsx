"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../lib/supabase";
import type { UpholsteryOrder } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { models } from "../lib/modelData";
import { brands } from "../lib/brandData";
import UpholsteryLayout from "./UpholsteryLayout";
import type { StorageLayout } from "../lib/storage";

interface UpholsteryFormProps {
  onOrderSubmitted?: (order: UpholsteryOrder) => void;
  preset?: UpholsteryOrder | null;
}

export default function UpholsteryForm({
  onOrderSubmitted,
  preset,
}: UpholsteryFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedLayout, setSelectedLayout] = useState<StorageLayout | null>(
    null
  );
  const [presetLayout, setPresetLayout] = useState<StorageLayout | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UpholsteryOrder>({
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
    mode: "onBlur",
  });

  // Watch for changes in the model and brand fields
  const watchModel = watch("model");
  const watchBrand = watch("brandOfSample");

  // Effect to update form when preset changes
  useEffect(() => {
    if (preset) {
      console.log("Loading preset:", preset);

      // Reset form with preset values
      reset({
        ...preset,
        orderDate: new Date().toISOString().split("T")[0],
        // Ensure modelType is properly set
        modelType: preset.modelType || "",
        // Explicitly set layout fields
        layoutId: preset.layoutId || "",
        layoutName: preset.layoutName || "",
        layoutImageUrl: preset.layoutImageUrl || "",
        layoutWidth: preset.layoutWidth || "",
        layoutLength: preset.layoutLength || "",
      });

      // Set preset layout if available
      if (preset.layoutId && preset.layoutName && preset.layoutImageUrl) {
        console.log("Setting preset layout:", {
          layoutId: preset.layoutId,
          layoutName: preset.layoutName,
          layoutImageUrl: preset.layoutImageUrl,
        });

        const layout: StorageLayout = {
          path: preset.layoutId,
          name: preset.layoutName,
          url: preset.layoutImageUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setPresetLayout(layout);
        setSelectedLayout(layout);
      } else {
        console.log("No layout found in preset:", preset);
      }

      // Set other form fields
      setSelectedModel(preset.model || "");
      setSelectedBrand(preset.brandOfSample || "");
    }
  }, [preset, reset]);

  // Effect to handle model changes
  useEffect(() => {
    if (watchModel !== selectedModel) {
      setSelectedModel(watchModel);
      setValue("modelType", "");
    }
  }, [watchModel, selectedModel, setValue]);

  // Effect to handle brand changes
  useEffect(() => {
    if (watchBrand !== selectedBrand) {
      setSelectedBrand(watchBrand);
      setValue("colorOfSample", "");
    }
  }, [watchBrand, selectedBrand, setValue]);

  // Get available model types for the selected model
  const modelTypes = useMemo(() => {
    const selectedModelData = models.find((m) => m.name === watchModel);
    return (
      selectedModelData?.types.map((type) => `${type.name} - (${type.code})`) ||
      []
    );
  }, [watchModel]);

  // Get available colors for the selected brand
  const availableColors =
    brands.find((b) => b.name === selectedBrand)?.colors || [];

  const handleLayoutSelect = (layout: StorageLayout) => {
    setSelectedLayout(layout);
    setValue("layoutId", layout.path);
    setValue("layoutName", layout.name);
    setValue("layoutImageUrl", layout.url);
  };

  const onSubmit = async (
    data: UpholsteryOrder,
    e?: React.BaseSyntheticEvent
  ) => {
    if (e) {
      e.preventDefault();
    }
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      console.log("Form data received:", data);

      // Validate required fields
      const requiredFields = {
        vanNumber: "Van number",
        model: "Model",
        modelType: "Model type",
        brandOfSample: "Brand",
        colorOfSample: "Color",
      };

      // Check all required fields
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!data[field as keyof UpholsteryOrder]) {
          throw new Error(`${label} is required`);
        }
      }

      // Check if layout is selected
      if (!selectedLayout) {
        throw new Error("Please select a layout");
      }

      // Validate and convert van number
      const vanNumberStr = String(data.vanNumber).trim();
      if (!vanNumberStr) {
        throw new Error("Please enter a valid van number");
      }

      const vanNumberInt = parseInt(vanNumberStr, 10);
      if (isNaN(vanNumberInt) || vanNumberInt <= 0) {
        throw new Error("Please enter a valid positive van number");
      }

      // Add current time to the order date
      const now = new Date();
      const orderDateTime = new Date(data.orderDate);
      orderDateTime.setHours(now.getHours(), now.getMinutes());
      data.orderDate = orderDateTime.toISOString();

      // Prepare data for submission
      const submissionData = {
        van_number: vanNumberInt,
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
        ...(user ? { user_id: user.id } : {}),
      };

      console.log("Submitting data to Supabase:", submissionData);

      const { data: insertedData, error } = await supabase
        .from("upholstery_orders")
        .insert([submissionData])
        .select();

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw new Error(error.message || "Failed to submit order");
      }

      if (!insertedData?.[0]) {
        throw new Error("No data returned from insert operation");
      }

      console.log("Successfully inserted data:", insertedData[0]);

      if (onOrderSubmitted) {
        onOrderSubmitted(data);
      }
    } catch (error: unknown) {
      console.error("Error submitting order:", error);

      if (error instanceof Error) {
        setErrorMessage(`Failed to submit order: ${error.message}`);
      } else {
        setErrorMessage(
          "An unexpected error occurred while submitting the order"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Ideal Caravans Upholstery Order Form
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log("Form validation errors:", errors);
          if (errors.layoutId) {
            setErrorMessage("Please select a layout");
          }
        })}
        className="space-y-8"
      >
        {/* Basic Information Section */}
        <section className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-900 dark:text-white">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="vanNumber"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Van Number (LTRV)
              </label>
              <div className="flex items-center">
                <span className="inline-flex items-center h-[42px] px-3 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-600 border border-r-0 border-gray-300 dark:border-gray-500 rounded-l-md">
                  LTRV
                </span>
                <input
                  id="vanNumber"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-full h-[42px] px-3 py-2 border ${
                    errors.vanNumber
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-500"
                  } rounded-none rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  {...register("vanNumber", {
                    required: "Van Number is required",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Please enter numbers only",
                    },
                    validate: {
                      isPositiveNumber: (value) => {
                        if (!value || value.trim() === "") {
                          return "Van Number is required";
                        }
                        const num = parseInt(value, 10);
                        return num > 0 || "Please enter a positive number";
                      },
                    },
                  })}
                />
              </div>
              {errors.vanNumber && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.vanNumber.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="model"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Model
              </label>
              <select
                id="model"
                className={`w-full px-3 py-2 border ${
                  errors.model
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-500"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                {...register("model", { required: "Model is required" })}
              >
                <option value="">Select a Model</option>
                {models.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name}
                  </option>
                ))}
              </select>
              {errors.model && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.model.message}
                </p>
              )}
            </div>

            {selectedModel && (
              <div>
                <label
                  htmlFor="modelType"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                >
                  Model Type
                </label>
                <select
                  id="modelType"
                  className={`w-full px-3 py-2 border ${
                    errors.modelType
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-500"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  {...register("modelType", {
                    required: "Model Type is required",
                  })}
                >
                  <option value="">Select a Model Type</option>
                  {modelTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.modelType && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.modelType.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="orderDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Order Date
              </label>
              <input
                id="orderDate"
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                {...register("orderDate", { required: true })}
              />
            </div>

            <div>
              <label
                htmlFor="brandOfSample"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Brand of Sample
              </label>
              <select
                id="brandOfSample"
                className={`w-full px-3 py-2 border ${
                  errors.brandOfSample
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-500"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                {...register("brandOfSample", {
                  required: "Brand is required",
                })}
              >
                <option value="">Select a Brand</option>
                {brands.map((brand) => (
                  <option key={brand.name} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {errors.brandOfSample && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.brandOfSample.message}
                </p>
              )}
            </div>

            {selectedBrand && (
              <div>
                <label
                  htmlFor="colorOfSample"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                >
                  Color of Sample
                </label>
                <select
                  id="colorOfSample"
                  className={`w-full px-3 py-2 border ${
                    errors.colorOfSample
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-500"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  {...register("colorOfSample", {
                    required: "Color is required",
                  })}
                >
                  <option value="">Select a Color</option>
                  {availableColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
                {errors.colorOfSample && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.colorOfSample.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Upholstery Options Section */}
        <section className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-900 dark:text-white">
            Upholstery Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="bedHead"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Bed Head
              </label>
              <select
                id="bedHead"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                {...register("bedHead")}
              >
                <option value="Small">Small</option>
                <option value="Large">Large</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="arms"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Arms
              </label>
              <select
                id="arms"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                {...register("arms")}
              >
                <option value="Short">Short</option>
                <option value="Large">Large</option>
                <option value="Recessed Footrest">Recessed Footrest</option>
                <option value="GT arm">GT arm</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="base"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Base
              </label>
              <input
                id="base"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                {...register("base")}
                placeholder="No options yet"
              />
            </div>

            <div>
              <label
                htmlFor="magPockets"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Mag Pockets
              </label>
              <select
                id="magPockets"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                {...register("magPockets")}
              >
                <option value="1 x Large">1 x Large</option>
                <option value="1 x Small">1 x Small</option>
                <option value="1 x Large + 2 small">1 x Large + 2 small</option>
                <option value="1 x Large + 3 small">1 x Large + 3 small</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="headBumper"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Head Bumper
              </label>
              <select
                id="headBumper"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                {...register("headBumper")}
              >
                <option value="true">1</option>
                <option value="false">None</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="other"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Other
              </label>
              <select
                id="other"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                {...register("other")}
              >
                <option value="">None</option>
                <option value="Bunk Facia 1">Bunk Facia 1</option>
                <option value="Bunk Facia 2">Bunk Facia 2</option>
                <option value="Bunk Facia 3">Bunk Facia 3</option>
              </select>
            </div>
          </div>
        </section>

        {/* Specific Details Section */}
        <section className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-900 dark:text-white">
            Specific Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="loungeType"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Lounge Type
              </label>
              <select
                id="loungeType"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                {...register("loungeType")}
              >
                <option value="Cafe">Cafe</option>
                <option value="Club">Club</option>
                <option value="L shape">L shape</option>
                <option value="Straight">Straight</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="design"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Design
              </label>
              <select
                id="design"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                {...register("design")}
              >
                <option value="Essential Back">Essential Back</option>
                <option value="Soft Back">Soft Back</option>
                <option value="As Per Picture">As Per Picture</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="stitching"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Stitching
              </label>
              <select
                id="stitching"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                {...register("stitching")}
              >
                <option value="Contrast">Contrast</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Same Colour">Same Colour</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="bunkMattresses"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Bunk Mattresses
              </label>
              <select
                id="bunkMattresses"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                {...register("bunkMattresses")}
              >
                <option value="None">None</option>
                <option value="2">2 (1900mm x 700mm)</option>
                <option value="3">3 (1900mm x 700mm)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="curtain"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Curtain 760mm
              </label>
              <select
                id="curtain"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                {...register("curtain")}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </section>

        {/* Upholstery Layout Section */}
        <section className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg animate-fade-in">
          <UpholsteryLayout
            onLayoutSelect={handleLayoutSelect}
            selectedLayout={selectedLayout}
            hideGrid={!!presetLayout}
          />
          {errors.layoutId && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Please select an upholstery layout
            </p>
          )}
        </section>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
          >
            {isSubmitting ? "Submitting..." : "Submit Order"}
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 rounded-md">
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
}
