"use client";

import { useEffect, useState } from "react";
import NumberFlow, { styles } from "@number-flow/react";
import { Shuffle } from "lucide-react";

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomValue() {
  // 50/50 small readable number or big number (→ M / B notation)
  return Math.random() < 0.5
    ? Math.floor(rand(120, 9_999))
    : Math.floor(rand(1_200_000, 9_800_000));
}

export function NumberFlowDemo() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setValue(1247), 200);
    return () => clearTimeout(t);
  }, []);

  const compact = value >= 1_000_000;

  return (
    <div className="flex flex-col items-center gap-10 font-sans">
      {/* NumberFlow ships its CSS as strings — inject once */}
      <style
        precedence="high"
        dangerouslySetInnerHTML={{ __html: styles.join("\n") }}
      />

      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          Items sold
        </span>
        <NumberFlow
          value={value}
          format={
            compact
              ? {
                  notation: "compact",
                  compactDisplay: "short",
                  maximumFractionDigits: 2,
                }
              : { maximumFractionDigits: 0 }
          }
          className="text-7xl font-semibold tabular-nums text-neutral-900 dark:text-white"
        />
      </div>

      <button
        type="button"
        onClick={() => setValue(randomValue())}
        className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
      >
        <Shuffle className="h-4 w-4" strokeWidth={2.25} />
        Shuffle
      </button>
    </div>
  );
}

export default NumberFlowDemo;
