"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import {
  Island,
  IslandProvider,
  useIsland,
} from "@/lib/island";
import { NowPlayingActivity, type PlaybackState } from "@/components/islandcn/now-playing-activity";
import { TimerActivity, type TimerState } from "@/components/islandcn/timer-activity";
import { UploadActivity } from "@/components/islandcn/upload-activity";
import { CallActivity, type CallState } from "@/components/islandcn/call-activity";
import { EtaActivity } from "@/components/islandcn/eta-activity";
import { BatteryActivity } from "@/components/islandcn/battery-activity";
import { nowPlayingSample, callSample, etaSample } from "@/examples/samples";
import {
  Music,
  Timer,
  UploadCloud,
  PhoneCall,
  Car,
  Layers,
  BatteryCharging,
  CircleDot,
  Maximize2,
  Minimize2,
} from "lucide-react";

export type PresetKey =
  | "music"
  | "timer"
  | "upload"
  | "call"
  | "eta"
  | "split"
  | "battery"
  | "idle";

interface PresetItem {
  id: PresetKey;
  label: string;
  icon: typeof Music;
}

const PRESETS: PresetItem[] = [
  { id: "music", label: "Music", icon: Music },
  { id: "timer", label: "Timer", icon: Timer },
  { id: "upload", label: "Upload", icon: UploadCloud },
  { id: "call", label: "Call", icon: PhoneCall },
  { id: "eta", label: "Ride", icon: Car },
  { id: "split", label: "Split", icon: Layers },
  { id: "battery", label: "Battery", icon: BatteryCharging },
  { id: "idle", label: "Idle", icon: CircleDot },
];

/**
 * Inner activity renderer driven by the current preset
 */
function ActiveIslandPreset({ preset }: { preset: PresetKey }) {
  // Music state
  const { playlist } = nowPlayingSample;
  const [songIdx, setSongIdx] = useState(0);
  const track = playlist[songIdx % playlist.length] ?? playlist[0];
  const [playback, setPlayback] = useState<PlaybackState>({
    kind: "playing",
    startedAt: Date.now() - 48_000,
  });

  // Timer state
  const timerDuration = 5 * 60_000;
  const [timerState, setTimerState] = useState<TimerState>({
    kind: "running",
    endsAt: Date.now() + 4 * 60_000 + 58_000,
  });

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0.42);

  // Call state
  const [callState, setCallState] = useState<CallState>({ kind: "ringing" });

  // Auto-progress simulation for upload
  useEffect(() => {
    if (preset !== "upload") return;
    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 1 ? 0.05 : prev + 0.03));
    }, 500);
    return () => clearInterval(interval);
  }, [preset]);

  return (
    <>
      {preset === "music" && (
        <NowPlayingActivity
          id="music"
          title={track.title}
          artist={track.artist}
          duration={track.duration}
          artwork={track.artwork}
          accent={track.accent}
          playback={playback}
          onToggle={() =>
            setPlayback((curr) =>
              curr.kind === "playing"
                ? { kind: "paused", position: Date.now() - curr.startedAt }
                : { kind: "playing", startedAt: Date.now() - curr.position }
            )
          }
          onNext={() => {
            setSongIdx((i) => (i + 1) % playlist.length);
            setPlayback({ kind: "playing", startedAt: Date.now() });
          }}
          onPrevious={() => {
            setSongIdx((i) => (i - 1 + playlist.length) % playlist.length);
            setPlayback({ kind: "playing", startedAt: Date.now() });
          }}
          onOutput={() => undefined}
        />
      )}

      {preset === "timer" && (
        <TimerActivity
          id="timer"
          state={timerState}
          duration={timerDuration}
          label="Pasta Timer"
          priority={1}
          onToggle={() =>
            setTimerState((curr) =>
              curr.kind === "running"
                ? { kind: "paused", remaining: Math.max(0, curr.endsAt - Date.now()) }
                : { kind: "running", endsAt: Date.now() + curr.remaining }
            )
          }
          onCancel={() =>
            setTimerState({
              kind: "running",
              endsAt: Date.now() + 5 * 60_000,
            })
          }
        />
      )}

      {preset === "upload" && (
        <UploadActivity
          id="upload"
          fileName="presentation.key"
          progress={uploadProgress}
          destination="Team Drive"
          totalBytes={18_400_000}
        />
      )}

      {preset === "call" && (
        <CallActivity
          id="call"
          caller={callSample.caller}
          subtitle={callSample.subtitle}
          avatar={callSample.avatar}
          state={callState}
          onAccept={() => setCallState({ kind: "active", since: Date.now() })}
          onDecline={() => setCallState({ kind: "ringing" })}
        />
      )}

      {preset === "eta" && (
        <EtaActivity
          id="eta"
          kind="ride"
          arrivesAt={Date.now() + 4 * 60_000}
          title={etaSample.ride.title}
          driverName={etaSample.ride.driverName}
          plate={etaSample.ride.plate}
          vehicle="Tesla Model S · Obsidian Black"
          rating={4.98}
        />
      )}

      {preset === "battery" && (
        <BatteryActivity
          id="battery"
          level={0.88}
          charging={true}
          name="iPhone 16 Pro"
        />
      )}

      {preset === "split" && (
        <>
          <TimerActivity
            id="timer"
            state={timerState}
            duration={timerDuration}
            label="Cooking"
            priority={1}
            onToggle={() =>
              setTimerState((curr) =>
                curr.kind === "running"
                  ? { kind: "paused", remaining: Math.max(0, curr.endsAt - Date.now()) }
                  : { kind: "running", endsAt: Date.now() + curr.remaining }
              )
            }
          />
          <NowPlayingActivity
            id="music"
            title={track.title}
            artist={track.artist}
            duration={track.duration}
            artwork={track.artwork}
            accent={track.accent}
            playback={playback}
            priority={0}
            onToggle={() =>
              setPlayback((curr) =>
                curr.kind === "playing"
                  ? { kind: "paused", position: Date.now() - curr.startedAt }
                  : { kind: "playing", startedAt: Date.now() - curr.position }
              )
            }
          />
        </>
      )}
    </>
  );
}

/**
 * Controller inside IslandProvider that handles expansion, keyboard & click events
 */
function IslandControls({
  preset,
  isExpanded,
  onExpandedChange,
  onCycle,
  onSetPreset,
}: {
  preset: PresetKey;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onCycle: (delta: number) => void;
  onSetPreset: (preset: PresetKey) => void;
}) {
  const island = useIsland();

  // Keep parent state updated with current presentation
  useEffect(() => {
    onExpandedChange(island.presentation === "expanded");
  }, [island.presentation, onExpandedChange]);

  // Sync external expand button with island
  useEffect(() => {
    if (preset === "idle") {
      if (island.presentation === "expanded") island.collapse();
      return;
    }
    const primary = island.activities[0];
    if (!primary) return;

    if (isExpanded && island.presentation !== "expanded") {
      island.expand(primary.id);
    } else if (!isExpanded && island.presentation === "expanded") {
      island.collapse();
    }
  }, [isExpanded, preset, island]);

  // Instant click to toggle expand / collapse
  const handlePillClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        target.closest(
          "button:not([data-islandcn-hit]), input, a, [role='button']:not([data-islandcn-hit])"
        )
      ) {
        return;
      }

      const hit = target.closest<HTMLElement>("[data-islandcn-hit]");
      if (hit) {
        const hitType = hit.getAttribute("data-islandcn-hit");
        if (island.presentation === "expanded") {
          island.collapse();
        } else if (hitType === "bubble") {
          const second = island.activities[1] ?? island.activities[0];
          if (second) island.expand(second.id);
        } else {
          const primary = island.activities[0];
          if (primary) island.expand(primary.id);
        }
      }
    },
    [island]
  );

  useEffect(() => {
    document.addEventListener("click", handlePillClick);
    return () => document.removeEventListener("click", handlePillClick);
  }, [handlePillClick]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowRight" || e.key === "]" || e.key === "l") {
        e.preventDefault();
        onCycle(1);
      } else if (e.key === "ArrowLeft" || e.key === "[" || e.key === "h") {
        e.preventDefault();
        onCycle(-1);
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        const primary = island.activities[0];
        if (island.presentation === "expanded") {
          island.collapse();
        } else if (primary) {
          island.expand(primary.id);
        }
      } else if (e.key >= "1" && e.key <= "8") {
        const idx = parseInt(e.key, 10) - 1;
        if (PRESETS[idx]) {
          onSetPreset(PRESETS[idx].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [island, onCycle, onSetPreset]);

  return <ActiveIslandPreset preset={preset} />;
}

/**
 * Centered Dynamic Island Showcase with a sleek bottom dock to switch options
 * Fully responsive to light/dark themes toggled with the "d" shortcut key.
 */
export default function DynamicIslandShowcase() {
  const [presetIndex, setPresetIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const lastWheel = useRef(0);

  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme === "dark";
  const currentPreset = PRESETS[presetIndex]?.id ?? "music";

  const cyclePreset = useCallback((delta: number) => {
    setPresetIndex((prev) => (prev + delta + PRESETS.length) % PRESETS.length);
  }, []);

  const setPresetDirect = useCallback((preset: PresetKey) => {
    const idx = PRESETS.findIndex((p) => p.id === preset);
    if (idx !== -1) setPresetIndex(idx);
  }, []);

  // Wheel gestures on page/island to switch activity
  const handleWheel = (e: React.WheelEvent) => {
    const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const delta = horizontal ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 18) return;
    if (Date.now() - lastWheel.current < 350) return;
    lastWheel.current = Date.now();
    cyclePreset(delta > 0 ? 1 : -1);
  };

  // Pointer swipe gestures
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    pointerStart.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      cyclePreset(dx < 0 ? 1 : -1);
    }
  };

  return (
    <main
      className="relative min-h-screen w-full bg-[#f2f2f4] dark:bg-[#000000] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 flex flex-col items-center justify-center select-none overflow-hidden outline-none cursor-default font-sans antialiased"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      tabIndex={0}
      aria-label="Dynamic Island Showcase"
    >
      {/* Vertically and horizontally centered island stage */}
      <div className="relative w-full max-w-[402px] h-[340px] flex items-center justify-center -translate-y-8">
        <IslandProvider>
          <Island
            keyline="auto"
            placement="container"
            backdrop={isDark ? "#000000" : "#f2f2f4"}
          />
          <IslandControls
            preset={currentPreset}
            isExpanded={isExpanded}
            onExpandedChange={setIsExpanded}
            onCycle={cyclePreset}
            onSetPreset={setPresetDirect}
          />
        </IslandProvider>
      </div>

      {/* Sleek, minimal floating dock at the bottom to showcase all options */}
      <nav
        aria-label="Dynamic Island Controls"
        className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/80 dark:bg-[#141416]/85 border border-black/10 dark:border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-w-[95vw] overflow-x-auto transition-colors duration-300"
      >
        {PRESETS.map((p) => {
          const Icon = p.icon;
          const isActive = currentPreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPresetDirect(p.id);
                setIsExpanded(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-black shadow-md font-semibold scale-105"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-black/5 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10"
              }`}
            >
              <Icon size={14} className={isActive ? "text-white dark:text-black" : "text-zinc-500 dark:text-zinc-400"} />
              <span>{p.label}</span>
            </button>
          );
        })}

        <div className="w-px h-4 bg-black/10 dark:bg-white/15 mx-1" />

        {/* Expand / Collapse Action Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap border ${
            isExpanded
              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40"
              : "bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 hover:text-zinc-950 dark:hover:text-white"
          }`}
        >
          {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          <span>{isExpanded ? "Collapse" : "Expand"}</span>
        </button>
      </nav>
    </main>
  );
}
