"use client";

import { useState, useRef } from "react";
import UpholsteryForm from "./components/UpholsteryForm";
import PresetsLoader from "./components/PresetsLoader";
import PDFGenerator from "./components/PDFGenerator";
import LoginButton from "./components/LoginButton";
import { supabase } from "./lib/supabase";
import type { UpholsteryOrder } from "./lib/supabase";
import { useAuth } from "./contexts/AuthContext";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [activeOrder, setActiveOrder] = useState<UpholsteryOrder | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isClosingPreset, setIsClosingPreset] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [presetName, setPresetName] = useState("");
  const topRef = useRef<HTMLDivElement>(null);
  const [isClosingPresets, setIsClosingPresets] = useState(false);

  const handlePresetSelect = (preset: UpholsteryOrder) => {
    setActiveOrder(preset);
    setShowPresets(false);
    // Scroll to form
    const formElement = document.querySelector("form");
    formElement?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOrderSubmitted = (order: UpholsteryOrder) => {
    setActiveOrder(order);
    setShowModal(true);
    setIsClosing(false);
    // Show notification
    setNotification("Order submitted successfully!");
    // Remove notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
    // Smooth scroll to top
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 300);
  };

  const handleCloseSavePresetModal = () => {
    setIsClosingPreset(true);
    setTimeout(() => {
      setShowSavePresetModal(false);
      setIsClosingPreset(false);
      setPresetName("");
    }, 300);
  };

  const handleSavePreset = async () => {
    if (!activeOrder || !presetName.trim()) {
      setNotification("Please enter a preset name");
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      // Convert camelCase to snake_case for database
      const presetData = {
        preset_name: presetName,
        van_number: activeOrder.vanNumber,
        model: activeOrder.model,
        order_date: new Date().toISOString().split("T")[0],
        brand_of_sample: activeOrder.brandOfSample,
        color_of_sample: activeOrder.colorOfSample,
        bed_head: activeOrder.bedHead,
        arms: activeOrder.arms,
        base: activeOrder.base || "",
        mag_pockets: activeOrder.magPockets,
        head_bumper: activeOrder.headBumper,
        other: activeOrder.other || "",
        lounge_type: activeOrder.loungeType,
        design: activeOrder.design,
        curtain: activeOrder.curtain,
        stitching: activeOrder.stitching,
        bunk_mattresses: activeOrder.bunkMattresses,
        user_id: user?.id,
      };

      const { error } = await supabase
        .from("upholstery_presets")
        .insert([presetData]);

      if (error) throw error;

      setNotification("Preset saved successfully!");
      setTimeout(() => setNotification(null), 5000);
      handleCloseSavePresetModal();

      // Refresh presets if they're currently shown
      if (showPresets) {
        // Force a re-render of PresetsLoader
        setShowPresets(false);
        setTimeout(() => setShowPresets(true), 100);
      }
    } catch (error: unknown) {
      const err = error as { message: string };
      console.error("Error saving preset:", err.message);
      setNotification("Failed to save preset. Please try again.");
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleTogglePresets = () => {
    if (showPresets) {
      setIsClosingPresets(true);
      setTimeout(() => {
        setShowPresets(false);
        setIsClosingPresets(false);
      }, 300);
    } else {
      setShowPresets(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header with Login Button */}
      <div className="max-w-6xl mx-auto mb-8">
        {/* Login Button in absolute position */}
        <div className="absolute top-8 right-8">
          <LoginButton />
        </div>
        {/* Centered Title */}
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white">
          Ideal Caravans Upholstery
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Notification */}
          {notification && (
            <div className="fixed top-4 right-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded shadow-lg z-50 animate-fade-in-out">
              <p>{notification}</p>
            </div>
          )}

          <div ref={topRef} className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                Order Form
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Select your desired upholstery options and submit your order
              </p>
              {!user && (
                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                  Sign in to access additional features like saving and loading
                  presets
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mb-6">
              {/* Show presets button only for authenticated users */}
              {user && (
                <button
                  onClick={handleTogglePresets}
                  className="w-[200px] h-[40px] px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {showPresets ? "Hide Presets" : "Show Saved Presets"}
                </button>
              )}
              {/* Show PDF generator for all users */}
              {activeOrder && !showModal && (
                <PDFGenerator order={activeOrder} />
              )}
              {/* Show save preset button only for authenticated users */}
              {user && activeOrder && (
                <button
                  onClick={() => setShowSavePresetModal(true)}
                  className="w-[180px] h-[40px] px-4 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Save as Preset
                </button>
              )}
            </div>

            {/* Presets Section - Only show for authenticated users */}
            {user && (
              <div
                className={`transition-all duration-300 ease-in-out transform ${
                  showPresets && !isClosingPresets
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-4 pointer-events-none"
                }`}
              >
                {(showPresets || isClosingPresets) && (
                  <div className="mb-8">
                    <PresetsLoader onPresetSelect={handlePresetSelect} />
                  </div>
                )}
              </div>
            )}

            {/* Form Section - Available to all users */}
            <div className="mb-8">
              <UpholsteryForm
                onOrderSubmitted={handleOrderSubmitted}
                preset={activeOrder}
              />
            </div>
          </div>

          {/* Modals */}
          {/* Save Preset Modal - Only show for authenticated users */}
          {user && showSavePresetModal && (
            <div
              className={`fixed inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30 flex items-center justify-center z-50 transition-opacity duration-300 ${
                isClosingPreset ? "opacity-0" : "opacity-100"
              }`}
            >
              <div
                className={`bg-white dark:bg-gray-800 rounded-lg p-8 max-w-lg w-full mx-4 relative shadow-xl transition-all duration-300 ${
                  isClosingPreset
                    ? "scale-95 opacity-0"
                    : "scale-100 opacity-100"
                }`}
              >
                <button
                  onClick={handleCloseSavePresetModal}
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
                  <h2 className="text-2xl font-semibold mb-6 dark:text-white">
                    Save Preset
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="presetName"
                        className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2"
                      >
                        Preset Name
                      </label>
                      <input
                        type="text"
                        id="presetName"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        className="w-full px-3 py-2 text-lg border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter a name for this preset"
                      />
                    </div>

                    <div>
                      <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Van Model
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        LTRV - {activeOrder?.vanNumber} | {activeOrder?.model}
                      </p>
                    </div>

                    <div>
                      <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Preset Save Date
                      </label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {new Date().toLocaleDateString("en-GB")}{" "}
                        {new Date().toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-8">
                    <button
                      onClick={handleSavePreset}
                      className="px-6 py-3 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                      Save Preset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Submitted Modal - Show for all users */}
          {showModal && activeOrder && (
            <div
              className={`fixed inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30 flex items-center justify-center z-50 transition-opacity duration-300 ${
                isClosing ? "opacity-0" : "opacity-100"
              }`}
            >
              <div
                className={`bg-white dark:bg-gray-800 rounded-lg p-8 max-w-lg w-full mx-4 relative shadow-xl transition-all duration-300 ${
                  isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
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
                  <h2 className="text-2xl font-semibold mb-6 dark:text-white">
                    PDF Ready
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Your PDF For:
                  </p>
                  <p className="text-lg font-medium mb-1 dark:text-white">
                    LTRV - {activeOrder.vanNumber}
                  </p>
                  <p className="text-lg font-medium mb-4 dark:text-white">
                    Model - {activeOrder.model}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    is ready
                  </p>
                  <div className="flex justify-center">
                    <PDFGenerator order={activeOrder} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
