"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import Image from "next/image";
import React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { cn } from "../../lib/utils";
import type { UpholsteryOrder } from "../../lib/supabase";

type PresetPreviewProps = {
  children: React.ReactNode;
  preset: UpholsteryOrder & { id: string };
  className?: string;
};

export const PresetPreview = ({
  children,
  preset,
  className,
}: PresetPreviewProps) => {
  const [isOpen, setOpen] = React.useState(false);

  const springConfig = { stiffness: 100, damping: 50 };
  const x = useMotionValue(0);
  const y = useMotionValue(-500);
  const translateX = useSpring(x, springConfig);
  const translateY = useSpring(y, springConfig);

  const handleMouseMove = (event: React.MouseEvent) => {
    const targetRect = event.currentTarget.getBoundingClientRect();
    const eventOffsetX = event.clientX - targetRect.left;
    const offsetFromCenter = (eventOffsetX - targetRect.width / 2) / 2;
    x.set(offsetFromCenter);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/5 backdrop-blur-[2px] pointer-events-none z-[9998]" />
      )}
      <HoverCardPrimitive.Root
        openDelay={50}
        closeDelay={100}
        onOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <HoverCardPrimitive.Trigger
          onMouseMove={handleMouseMove}
          className={cn(
            "text-black dark:text-white relative z-[9999] bg-white dark:bg-gray-700",
            className
          )}
          asChild
        >
          {children}
        </HoverCardPrimitive.Trigger>

        <HoverCardPrimitive.Portal>
          <HoverCardPrimitive.Content
            className="fixed [transform-origin:var(--radix-hover-card-content-transform-origin)] z-[9999]"
            side="top"
            align="center"
            sideOffset={20}
          >
            <AnimatePresence>
              {isOpen && preset.layoutImageUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.6 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    },
                  }}
                  exit={{ opacity: 0, y: 20, scale: 0.6 }}
                  className="shadow-xl rounded-xl relative z-[9999] bg-white dark:bg-gray-800"
                  style={{
                    x: translateX,
                    y: translateY,
                  }}
                >
                  <div className="block p-4 border-2 border-transparent shadow-lg rounded-xl hover:border-neutral-200 dark:hover:border-neutral-800 w-80">
                    <div className="relative aspect-video w-full mb-3 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={preset.layoutImageUrl}
                        alt={preset.layoutName || "Layout preview"}
                        fill
                        className="object-cover"
                        priority
                        sizes="320px"
                      />
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {preset.presetName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Model: {preset.model}
                    </p>
                    {preset.modelType && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Type: {preset.modelType}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </HoverCardPrimitive.Content>
        </HoverCardPrimitive.Portal>
      </HoverCardPrimitive.Root>
    </>
  );
};
