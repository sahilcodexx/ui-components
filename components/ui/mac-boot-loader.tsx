"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppleHelloEffectEnglish } from "@/components/apple-hello-effect-english";

export type MacLoaderPhase = "hello" | "done";

export interface MacBootLoaderProps {
  /**
   * Called once the full handwriting sequence finishes and the overlay is about to unmount.
   */
  onComplete?: () => void;

  /**
   * Scales the duration and delay of the handwriting animation.
   * Values below 1 speed up, values above 1 slow down.
   * @default 0.6
   */
  durationScale?: number;
}

/**
 * Apple Hello Handwriting Loader Animation.
 *
 * Sequence on reload / initial mount:
 * 1. `hello` — Apple SVG handwriting "hello" effect.
 * 2. `done`  — Overlay fades out & unmounts upon completion.
 */
export function MacBootLoader({
  onComplete,
  durationScale = 0.6,
}: MacBootLoaderProps) {
  const [phase, setPhase] = useState<MacLoaderPhase>("hello");

  // Called when handwriting SVG path animation finishes
  const handleHelloComplete = useCallback(() => {
    setPhase("done");
  }, []);

  // Done -> Unmount
  useEffect(() => {
    if (phase !== "done") return;
    const timer = setTimeout(() => {
      onComplete?.();
    }, 600);
    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white text-black dark:bg-black dark:text-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "done" ? 0 : 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      aria-label="Loading"
      role="status"
    >
      <AnimatePresence mode="wait">
        {phase === "hello" && (
          <motion.div
            key="hello"
            className="flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: "blur(6px)", scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <AppleHelloEffectEnglish
              durationScale={durationScale}
              onAnimationComplete={handleHelloComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default MacBootLoader;


