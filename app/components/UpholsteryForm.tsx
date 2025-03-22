"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../lib/supabase";
import type { UpholsteryOrder } from "../lib/supabase";

// Helper function to convert camelCase to snake_case
function toSnakeCase(
  obj: Partial<UpholsteryOrder>
): Record<string, string | boolean | undefined> {
  const snakeCase = (str: string) =>
    str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

  return Object.keys(obj).reduce((acc, key) => {
    acc[snakeCase(key)] = obj[key as keyof Partial<UpholsteryOrder>];
    return acc;
  }, {} as Record<string, string | boolean | undefined>);
}

interface UpholsteryFormProps {
  onOrderSubmitted?: (order: UpholsteryOrder) => void;
  preset?: UpholsteryOrder | null;
}

export default function UpholsteryForm({
  onOrderSubmitted,
  preset,
}: UpholsteryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpholsteryOrder>({
    defaultValues: {
      vanNumber: "",
      model: "",
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
    },
  });

  // Effect to update form when preset changes
  useEffect(() => {
    if (preset) {
      reset({
        ...preset,
        orderDate: new Date().toISOString().split("T")[0], // Always use current date
        curtain: "Yes", // Force curtain to "Yes" even when loading a preset
      });
    }
  }, [preset, reset]);

  const onSubmit = async (data: UpholsteryOrder) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Add current time to the order date
      const now = new Date();
      const orderDateTime = new Date(data.orderDate);
      orderDateTime.setHours(now.getHours(), now.getMinutes());
      data.orderDate = orderDateTime.toISOString();

      // Remove presetName field before submitting
      const { presetName, ...orderData } = data;

      // Convert camelCase to snake_case
      const snakeCaseData = toSnakeCase(orderData);
      console.log("Submitting data:", snakeCaseData);

      const { error } = await supabase
        .from("upholstery_orders")
        .insert([snakeCaseData])
        .select();

      if (error) {
        console.error("Supabase error details:", error);
        throw error;
      }

      if (onOrderSubmitted) {
        onOrderSubmitted(data);
      }
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };
      console.error("Error submitting order:", {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code,
      });
      setErrorMessage(
        `Failed to submit order: ${err.message || "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Ideal Caravans Upholstery Order Form
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                  type="number"
                  onKeyDown={(e) => {
                    // Allow only numbers, backspace, delete, tab, enter, arrows
                    if (
                      !/^\d$/.test(e.key) && // not a number
                      ![
                        "Backspace",
                        "Delete",
                        "Tab",
                        "Enter",
                        "ArrowLeft",
                        "ArrowRight",
                      ].includes(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
                  className={`w-full h-[42px] px-3 py-2 border ${
                    errors.vanNumber
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-500"
                  } rounded-none rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  {...register("vanNumber", {
                    required: "Van Number is required",
                    pattern: {
                      value: /^\d+$/,
                      message: "Please enter numbers only",
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
              <input
                id="model"
                type="text"
                className={`w-full px-3 py-2 border ${
                  errors.model
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-500"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Please enter Model Type"
                {...register("model", {
                  required: "Model is required",
                  pattern: {
                    value: /^(?=.*[a-zA-Z])[\w\s.]+$/,
                    message:
                      "Model must contain letters and can include numbers",
                  },
                })}
              />
              {errors.model && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.model.message}
                </p>
              )}
            </div>

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
              <input
                id="brandOfSample"
                type="text"
                onKeyDown={(e) => {
                  // Allow only letters, space, backspace, delete, tab, enter, arrows
                  if (
                    !/^[A-Za-z\s]$/.test(e.key) && // not a letter or space
                    ![
                      "Backspace",
                      "Delete",
                      "Tab",
                      "Enter",
                      "ArrowLeft",
                      "ArrowRight",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                className={`w-full px-3 py-2 border ${
                  errors.brandOfSample
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-500"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                {...register("brandOfSample", {
                  required: "Brand of Sample is required",
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Please enter letters only",
                  },
                })}
              />
              {errors.brandOfSample && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.brandOfSample.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="colorOfSample"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Color of Sample
              </label>
              <input
                id="colorOfSample"
                type="text"
                onKeyDown={(e) => {
                  // Allow only letters, space, backspace, delete, tab, enter, arrows
                  if (
                    !/^[A-Za-z\s]$/.test(e.key) && // not a letter or space
                    ![
                      "Backspace",
                      "Delete",
                      "Tab",
                      "Enter",
                      "ArrowLeft",
                      "ArrowRight",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                className={`w-full px-3 py-2 border ${
                  errors.colorOfSample
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-500"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                {...register("colorOfSample", {
                  required: "Color of Sample is required",
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Please enter letters only",
                  },
                })}
              />
              {errors.colorOfSample && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.colorOfSample.message}
                </p>
              )}
            </div>
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
