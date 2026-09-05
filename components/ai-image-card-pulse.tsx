"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type AiImageCardPulseProps = {
  generateDuration?: number;
  imageSrc?: string;
  imageAlt?: string;
  label?: string;
  className?: string;
};

export function AiImageCardPulse({
  generateDuration = 3,
  imageSrc = "/fightclub1.jpeg",
  imageAlt = "AI generated image",
  label = "Generating image",
  className,
}: AiImageCardPulseProps) {
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const elapsedMs = Date.now() - start;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      setSeconds(elapsedSec);
      setProgress(Math.min(100, (elapsedMs / (generateDuration * 1000)) * 100));
      if (elapsedSec >= generateDuration) {
        setDone(true);
        clearInterval(id);
      }
    }, 50);
    return () => clearInterval(id);
  }, [generateDuration]);

  return (
    <div
      className={
        "relative w-[360px] aspect-square rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 " +
        (className ?? "")
      }
    >
      <AnimatePresence>
        {!done && (
          <motion.div
            key="loading"
            className="absolute inset-0 flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hand-drawn spark icon — drawn with mask reveal, then gentle pulse */}
            <div className="relative w-16 h-16">
              <svg
                viewBox="0 0 64 64"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <mask id="sparkMask">
                    <motion.rect
                      x="0"
                      y="0"
                      width="0"
                      height="64"
                      fill="white"
                      initial={{ width: 0 }}
                      animate={{ width: 64 }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                    />
                  </mask>
                </defs>
                <g mask="url(#sparkMask)">
                  {/* Vertical stroke */}
                  <path
                    d="M32 8 L32 56"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  {/* Horizontal stroke */}
                  <path
                    d="M8 32 L56 32"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  {/* Diagonal strokes */}
                  <path
                    d="M16 16 L48 48"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                  <path
                    d="M16 48 L48 16"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </g>
              </svg>

              {/* Gentle pulse on the whole icon after the draw completes */}
              <motion.div
                className="absolute inset-0"
                animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "center" }}
              >
                <svg
                  viewBox="0 0 64 64"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g>
                    <path
                      d="M32 8 L32 56"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8 32 L56 32"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M16 16 L48 48"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                    <path
                      d="M16 48 L48 16"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                  </g>
                </svg>
              </motion.div>
            </div>

            {/* "Generating" text — same mask-reveal style as letter-ui */}
            <div className="relative h-7 w-44 overflow-hidden flex items-center justify-center">
              <svg
                width="176"
                height="28"
                viewBox="0 0 176 28"
                className="overflow-visible"
              >
                <defs>
                  <mask id="labelMask">
                    <motion.rect
                      x="0"
                      y="0"
                      width="0"
                      height="28"
                      fill="white"
                      initial={{ width: 0 }}
                      animate={{ width: 176 }}
                      transition={{ duration: 0.6, ease: "easeInOut", delay: 0.4 }}
                    />
                  </mask>
                </defs>
                <text
                  x="88"
                  y="20"
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="500"
                  letterSpacing="-0.01em"
                  className="fill-neutral-900 dark:fill-neutral-100"
                  mask="url(#labelMask)"
                >
                  Generating
                </text>
              </svg>
            </div>

            {/* Thin progress line — same vocabulary as the apple-hello underline */}
            <div className="relative w-32 h-[1px] bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-neutral-900 dark:bg-neutral-100"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {done && (
          <motion.div
            key="image"
            className="absolute inset-0"
            initial={{ opacity: 0, filter: "blur(20px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-cover"
            />
            <motion.div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              initial={{ x: "-120%" }}
              animate={{ x: "120%" }}
              transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1], delay: 0.3 }}
            >
              <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {done && (
          <motion.div
            key="flash"
            aria-hidden
            className="absolute inset-0 pointer-events-none bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.18, 0] }}
            transition={{ duration: 0.7, times: [0, 0.25, 1], ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <div
        className="absolute inset-x-0 bottom-0 h-24 bg-white/40 backdrop-blur-md dark:bg-black/50"
        style={{
          maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, transparent 100%)",
        }}
      >
        <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-900 dark:text-white dark:drop-shadow-sm">
            {done ? "Generated" : label}
          </span>
          <span className="text-sm font-medium text-neutral-900/90 dark:text-white/90 tabular-nums dark:drop-shadow-sm">
            {seconds}s
          </span>
        </div>
      </div>
    </div>
  );
}
