"use client";

import { useEffect, useState, useId } from "react";
import { motion } from "motion/react";
import * as opentype from "opentype.js";

export interface DynamicHandwritingEffectProps {
  /**
   * Any custom text to render as handwriting animation.
   * @default "Hello World"
   */
  text?: string;

  /**
   * Font size in pixels.
   * @default 72
   */
  fontSize?: number;

  /**
   * URL to the TTF or WOFF cursive font.
   * @default "/fonts/AlexBrush-Regular.ttf"
   */
  fontUrl?: string;

  /**
   * Duration of handwriting stroke animation in seconds.
   * @default 2.5
   */
  duration?: number;

  /**
   * SVG stroke thickness.
   * @default 2.5
   */
  strokeWidth?: number;

  /**
   * Additional CSS classes for SVG container.
   */
  className?: string;

  /**
   * Called when handwriting animation finishes.
   */
  onAnimationComplete?: () => void;
}

interface PathBounds {
  pathData: string;
  viewBox: string;
  width: number;
  height: number;
}

const fontCache = new Map<string, opentype.Font>();

export function DynamicHandwritingEffect({
  text = "Hello World",
  fontSize = 72,
  fontUrl = "/fonts/AlexBrush-Regular.ttf",
  duration = 2.5,
  strokeWidth = 2.5,
  className = "",
  onAnimationComplete,
}: DynamicHandwritingEffectProps) {
  const [bounds, setBounds] = useState<PathBounds | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const componentId = useId();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function loadFontAndGeneratePath() {
      try {
        let font = fontCache.get(fontUrl);
        if (!font) {
          font = await opentype.load(fontUrl);
          fontCache.set(fontUrl, font);
        }

        if (!isMounted) return;

        // Generate raw path from text
        const path = font.getPath(text, 0, 0, fontSize);
        const bbox = path.getBoundingBox();

        const padding = strokeWidth * 6;
        const minX = bbox.x1 - padding;
        const minY = bbox.y1 - padding;
        const width = Math.max(bbox.x2 - bbox.x1 + padding * 2, 20);
        const height = Math.max(bbox.y2 - bbox.y1 + padding * 2, 20);

        const pathData = path.toPathData(3);
        const viewBox = `${minX} ${minY} ${width} ${height}`;

        setBounds({ pathData, viewBox, width, height });
      } catch (err) {
        console.error("Failed to load font or generate path:", err);
        if (isMounted) setError("Failed to load handwriting font.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFontAndGeneratePath();

    return () => {
      isMounted = false;
    };
  }, [text, fontSize, fontUrl, strokeWidth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 text-neutral-400 animate-pulse font-sans text-sm">
        Generating handwriting...
      </div>
    );
  }

  if (error || !bounds || !bounds.pathData) {
    return (
      <div className="text-red-400 text-sm p-2 font-sans">
        {error || "Could not generate path."}
      </div>
    );
  }

  return (
    <motion.svg
      className={className}
      viewBox={bounds.viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ overflow: "visible", maxHeight: "100%", maxWidth: "100%" }}
    >
      <motion.path
        key={`${text}-${fontUrl}-${componentId}`}
        d={bounds.pathData}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration, ease: "easeInOut" },
          opacity: { duration: 0.3 },
        }}
        onAnimationComplete={onAnimationComplete}
      />
    </motion.svg>
  );
}

export default DynamicHandwritingEffect;
