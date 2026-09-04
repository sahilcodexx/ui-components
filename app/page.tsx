"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { AiImageCard } from "@/components/ai-image-card";

export default function Home() {
  const [runId, setRunId] = useState(0);

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center gap-6 p-6 dark:bg-neutral-950/70 text-white selection:bg-neutral-800">
      <AiImageCard key={runId} />
      <button
        type="button"
        onClick={() => setRunId((r) => r + 1)}
        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-900 dark:text-neutral-100 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-[0.98] transition"
      >
        <RotateCcw className="h-4 w-4" />
        Replay
      </button>
    </main>
  );
}
