"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type AiImageCardScanProps = {
  generateDuration?: number;
  imageSrc?: string;
  imageAlt?: string;
  label?: string;
  className?: string;
};

export function AiImageCardScan({
  generateDuration = 3,
  imageSrc = "/fightclub1.jpeg",
  imageAlt = "AI generated image",
  label = "Generating image",
  className,
}: AiImageCardScanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setSeconds(elapsed);
      if (elapsed >= generateDuration) {
        setDone(true);
        clearInterval(id);
      }
    }, 250);
    return () => clearInterval(id);
  }, [generateDuration]);

  useEffect(() => {
    if (done) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    const size = 4;
    const gap = 2;
    const step = size + gap;

    let cols = 0;
    let rows = 0;
    let offsets: number[][] = [];
    let speeds: number[][] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
        cols = Math.ceil(width / step);
        rows = Math.ceil(height / step);
        offsets = Array.from({ length: cols }, () =>
          Array.from({ length: rows }, () => Math.random() * Math.PI * 2)
        );
        speeds = Array.from({ length: cols }, () =>
          Array.from({ length: rows }, () => 0.35 + Math.random() * 0.95)
        );
      }
    };

    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const time = Date.now() * 0.001;

      const isDark = document.documentElement.classList.contains("dark");
      const r = isDark ? 129 : 110;
      const g = isDark ? 129 : 110;
      const b = isDark ? 137 : 120;

      // Horizontal scan line: sweeps left → right, wraps around
      const scanSpeed = 90; // px/sec
      const scanPos = ((time * scanSpeed) % (width + 200)) - 100;
      const bandWidth = 60; // px — how wide the bright band is

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const cellCx = i * step + step / 2;
          const cellCy = j * step + step / 2;
          const dist = Math.abs(cellCx - scanPos);

          // Gaussian-ish falloff from the scan line
          const scanFalloff = Math.exp(-(dist * dist) / (2 * bandWidth * bandWidth));

          // Per-cell twinkle so the band isn't a perfect stripe
          const offset = offsets[i][j];
          const speed = speeds[i][j];
          const cellWave = Math.sin(time * speed + offset);
          const cell01 = (cellWave + 1) * 0.5;

          // 65% scan band, 35% per-cell twinkle
          const combined = scanFalloff * 0.65 + cell01 * 0.35;

          const opacity = 0.03 + Math.pow(combined, 1.5) * 0.7;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          ctx.fillRect(i * step, j * step, size, size);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [done, generateDuration]);

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
            key="grid"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.08, filter: "blur(14px)" }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          >
            <canvas ref={canvasRef} className="w-full h-full" />
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
