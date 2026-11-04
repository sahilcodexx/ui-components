"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, ChevronRight, ChevronUp, Pause, Play, X } from "lucide-react";
import IslandActivities, { type Activity } from "./island-activities";
import { islandSpring, panelMotion, sceneMotion } from "./island-motion";

type View = "compact" | "activity" | "expanded";
const activities: Activity[] = ["coffee", "stocks", "amazon", "spending", "ethereum", "alert"];
const DURATION = 240;
const START_TIME = 207;
const sizes = { compact: { width: 292, height: 58, radius: 32 }, activity: { width: 380, height: 58, radius: 32 }, expanded: { width: 480, height: 254, radius: 48 } };


function TravelMug() {
  const id = useId();
  return <svg viewBox="0 0 48 64" aria-hidden="true" className="mt-[7px] block h-[45px] w-[34px]">
    <defs><linearGradient id={`${id}-body`} x1="0" x2="1"><stop stopColor="#080b10" /><stop offset=".18" stopColor="#232a33" /><stop offset=".36" stopColor="#151b23" /><stop offset=".8" stopColor="#070a0f" /><stop offset="1" stopColor="#141b24" /></linearGradient><linearGradient id={`${id}-rim`} x1="0" x2="0" y1="0" y2="1"><stop stopColor="#57606c" /><stop offset=".45" stopColor="#12171d" /><stop offset="1" stopColor="#030406" /></linearGradient></defs>
    <ellipse cx="24" cy="59" rx="14" ry="3" fill="#10121b" opacity=".25" />
    <path d="M10 10Q24 5 38 10L35.5 55Q24 60 12.5 55Z" fill={`url(#${id}-body)`} stroke="#111820" strokeWidth=".5" />
    <path d="M11 13Q24 17 37 13" stroke="#3a424d" strokeWidth=".7" opacity=".75" />
    <ellipse cx="24" cy="10" rx="14" ry="3.6" fill={`url(#${id}-rim)`} />
    <ellipse cx="24" cy="9.1" rx="11.8" ry="1.4" fill="#06090d" />
    <path d="M13.5 18L15.5 49" stroke="#5f6b78" opacity=".16" strokeWidth="1" />
    <text x="24" y="33" fill="#9da7b4" opacity=".65" fontFamily="Arial,sans-serif" fontSize="4.1" textAnchor="middle">ember</text>
    {[42,46,50].map(y => <circle key={y} cx="24" cy={y} r=".6" fill="#8b98a8" opacity=".7" />)}
  </svg>;
}

function CoffeeProgress({ value, expanded, ready }: { value: number; expanded: boolean; ready: boolean }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  return <span className={`grid shrink-0 place-items-center rounded-full [&>svg]:block [&>svg]:size-full ${expanded ? "absolute inset-0 z-[1] size-20" : "relative size-[42px]"}`}>
    <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r={radius} fill="none" stroke="#424244" strokeWidth="6" strokeDasharray={`${circumference * .75} ${circumference}`} strokeLinecap="round" transform="rotate(135 50 50)" /><circle cx="50" cy="50" r={radius} fill="none" stroke="#f15b30" strokeWidth="6" strokeDasharray={`${circumference * .75 * value} ${circumference}`} strokeLinecap="round" transform="rotate(135 50 50)" className="transition-[stroke-dasharray] duration-500 ease-out motion-reduce:transition-none" /></svg>
    {ready && <Check className="absolute size-[18px] text-[#f18654]" size={expanded ? 22 : 15} />}
  </span>;
}

export default function DynamicIsland() {
  const [activity, setActivity] = useState<Activity>("coffee");
  const [direction, setDirection] = useState(1);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastWheel = useRef(0);
  const dragging = useRef(false);
  const [view, setView] = useState<View>("compact");
  const [remaining, setRemaining] = useState(START_TIME);
  const [running, setRunning] = useState(true);
  const [cancelled, setCancelled] = useState(false);
  const time = useRef(START_TIME);
  const island = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const swiped = useRef(false);
  const [availableWidth, setAvailableWidth] = useState(540);
  const [appOpen, setAppOpen] = useState(false);
  const reduced = useReducedMotion();
  const transition = reduced ? { duration: 0 } : islandSpring;
  const ready = remaining === 0;
  const expanded = view === "expanded";
  const dimensions = activity === "coffee" ? sizes[view] : { width: expanded ? 370 : view === "activity" ? 380 : 320, height: expanded ? (activity === "spending" || activity === "ethereum" ? 280 : 240) : 60, radius: expanded ? 34 : 32 };
  const width = Math.min(dimensions.width, availableWidth);
  const coffeeWidth = Math.min(480, availableWidth);
  const compactWidth = Math.min(view === "activity" ? 380 : 292, availableWidth);
  const clock = `${Math.floor(remaining / 60).toString().padStart(2, "0")}:${(remaining % 60).toString().padStart(2, "0")}`;
  const status = ready ? "Your coffee is ready." : cancelled ? "Ready when you are." : running ? "Making your coffee now ..." : "A little coffee break.";

  useEffect(() => {
    if (!running) return;
    const deadline = Date.now() + time.current * 1000;
    const timer = setInterval(() => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      time.current = next;
      setRemaining(next);
      if (next === 0) setRunning(false);
    }, 200);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!expanded || appOpen) return;
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Element && !event.target.closest("[data-island-controls]") && !island.current?.contains(event.target)) setView("compact");
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setView("compact"); island.current?.focus({ preventScroll: true }); }
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); };
  }, [expanded, appOpen]);

  useEffect(() => {
    const element = island.current;
    if (!element || !expanded || appOpen) return;
    function wheel(event: WheelEvent) {
      if (event.ctrlKey || (event.target instanceof Element && event.target.closest("input"))) return;
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      const delta = (horizontal ? event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 16 : 1);
      if (Math.abs(delta) < (horizontal ? 20 : 10)) return;
      event.preventDefault();
      if (Date.now() - lastWheel.current < 450) return;
      lastWheel.current = Date.now();
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      const step = delta > 0 ? 1 : -1;
      setDirection(step);
      setActivity(current => activities[(activities.indexOf(current) + step + activities.length) % activities.length]);
    }
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [expanded, appOpen]);

  useEffect(() => () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); }, []);

  function clearHover() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }

  function selectActivity(next: Activity) {
    clearHover();
    setDirection(activities.indexOf(next) >= activities.indexOf(activity) ? 1 : -1);
    setActivity(next);
  }

  function cycleActivity(step: number) {
    clearHover();
    setDirection(step);
    setActivity(current => activities[(activities.indexOf(current) + step + activities.length) % activities.length]);
  }

  function toggleTimer() {
    if (ready) { time.current = START_TIME; setRemaining(START_TIME); }
    setCancelled(false);
    setRunning(value => !value);
  }

  function cancel() {
    setRunning(false);
    setCancelled(true);
    time.current = START_TIME;
    setRemaining(START_TIME);
    setView("compact");
  }

  const mugSize = expanded ? 67 : 41;
  const mugX = expanded ? coffeeWidth - 103 : view === "activity" ? 9 : compactWidth - 50;
  const mugY = expanded ? 68 : 8;

  return (
    <Dialog.Root open={appOpen} onOpenChange={setAppOpen}>
    <div className="flex w-full max-w-[540px] flex-col items-center font-sans">
        <div ref={stage} className="flex h-[310px] w-full items-start justify-center pt-[22px]">
          <motion.section ref={island} tabIndex={-1} initial={false} animate={{ width, height: dimensions.height, borderRadius: dimensions.radius }} transition={transition} className="group relative isolate max-w-full shrink-0 touch-none overflow-hidden bg-[#050505] text-[#fafafa] outline-none data-[view=expanded]:cursor-grab data-[view=expanded]:select-none data-[view=expanded]:active:cursor-grabbing dark:shadow-[0_0_0_1px_#ffffff08] [&_input]:select-text [&_textarea]:select-text [&_button]:cursor-pointer [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-[-3px] [&_button:focus-visible]:outline-[#e37a45]" aria-label={`${activity} live activity`} data-view={view}
            onPointerEnter={event => { if (event.pointerType === "mouse") { clearHover(); if (!expanded && !appOpen) hoverTimer.current = setTimeout(() => setView("expanded"), 180); } }}
            onPointerLeave={event => { if (event.pointerType === "mouse") { clearHover(); if (expanded && !appOpen && !dragging.current && !island.current?.querySelector("input:focus")) hoverTimer.current = setTimeout(() => setView("compact"), 240); } }}
            onKeyDown={event => { if (event.target instanceof HTMLInputElement) return; if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); cycleActivity(event.key === "ArrowRight" ? 1 : -1); } }}
            onPointerDown={event => {
              clearHover(); swiped.current = false;
              const interactive = event.target instanceof Element && event.target.closest("button, input, textarea, select, a, [contenteditable=true]");
              pointerStart.current = expanded && event.isPrimary && event.button === 0 && !interactive ? { x: event.clientX, y: event.clientY, id: event.pointerId } : null;
            }}
            onPointerMove={event => {
              const start = pointerStart.current;
              if (!start || start.id !== event.pointerId) return;
              const dx = event.clientX - start.x, dy = event.clientY - start.y;
              if (Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
                dragging.current = true; swiped.current = true;
                if (!event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId);
                event.preventDefault();
              }
            }}
            onPointerUp={event => {
              const start = pointerStart.current;
              if (start && start.id === event.pointerId) {
                const dx = event.clientX - start.x, dy = event.clientY - start.y;
                if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.2) { swiped.current = true; cycleActivity(dx < 0 ? 1 : -1); }
                else if (dy < -35 && Math.abs(dy) > Math.abs(dx) * 1.2) { swiped.current = true; setView("compact"); }
              }
              pointerStart.current = null; dragging.current = false;
            }}
            onPointerCancel={() => { pointerStart.current = null; dragging.current = false; }}
            onClickCapture={event => { if (swiped.current) { event.preventDefault(); event.stopPropagation(); swiped.current = false; } }}>
            <motion.div className="absolute inset-0" {...sceneMotion(activity === "coffee", reduced, direction)}>
              <motion.button type="button" className="absolute left-0 top-0 flex items-center gap-[9px] border-0 bg-transparent px-[9px] py-2 text-left text-inherit" aria-label="Expand coffee activity" aria-expanded={false} onClick={() => setView("expanded")} {...panelMotion(!expanded && view === "compact" && activity === "coffee", reduced)} style={{ ...panelMotion(!expanded && view === "compact" && activity === "coffee", reduced).style, width: Math.min(292, availableWidth), height: 58 }}>
                <span className="grid size-[41px] shrink-0 place-items-center rounded-full bg-[#ec5329] text-[10px] font-[650] tracking-[-.7px] text-white shadow-[inset_0_0_0_1px_#ff794750]">ember</span>
                <span className="flex-1 whitespace-nowrap text-[15px] font-[450] tracking-[-.55px]">{ready ? "Coffee is ready" : cancelled ? "Ready to brew" : running ? "Making coffee ..." : "Coffee paused"}</span>
                <span className="relative mr-[3px] flex size-[21px] shrink-0 flex-col items-center justify-center gap-1 rounded-full border border-[#222] bg-[#080808] [&>i]:h-[3px] [&>i]:w-2 [&>i]:rounded-full [&>i]:bg-[#12355f] [&>i]:shadow-[0_0_4px_#16457970] [&>i:last-child]:w-[6px] [&>i:last-child]:opacity-60 data-[active=false]:[&>i]:opacity-30" data-active={running && !ready}><i /><i /></span>
                <span className="block size-[41px] shrink-0" />
              </motion.button>
              <motion.button type="button" className="absolute left-0 top-0 flex items-center gap-[9px] border-0 bg-transparent px-[9px] py-2 text-left text-inherit" aria-label="Expand coffee activity" aria-expanded={false} onClick={() => setView("expanded")} {...panelMotion(view === "activity" && activity === "coffee", reduced)} style={{ ...panelMotion(view === "activity" && activity === "coffee", reduced).style, width: Math.min(380, availableWidth), height: 58 }}>
                <span className="block size-[41px] shrink-0" />
                <span className="min-w-0 flex-1 whitespace-nowrap text-[15px] tracking-[-.45px] max-[520px]:text-[13px]">{ready ? "Your coffee is ready ..." : cancelled ? "Start making your coffee ..." : running ? "Making your coffee ..." : "Your coffee is paused ..."}</span>
                <CoffeeProgress value={remaining / DURATION} expanded={false} ready={ready} />
              </motion.button>
              <motion.div className="absolute left-0 top-0 px-[29px] pb-[25px] pt-6" {...panelMotion(expanded && activity === "coffee", reduced)} style={{ ...panelMotion(expanded && activity === "coffee", reduced).style, width: coffeeWidth, height: 254 }}>
                <header className="relative flex min-h-[23px] items-center justify-center text-[15px] font-normal tracking-[-.45px] max-[520px]:text-sm"><span role="status">{status}</span><button className="absolute -right-1 grid size-6 place-items-center rounded-full border-0 bg-transparent p-0 text-[#626264] hover:bg-[#202020] hover:text-white" type="button" aria-label="Collapse coffee activity" onClick={() => setView("compact")}><ChevronUp size={16} /></button></header>
                <div className="flex h-[114px] items-center justify-between gap-4">
                  <div className="flex items-baseline gap-2 [&>span:first-child]:text-base [&>span:first-child]:tracking-[-.7px] [&>span:last-child]:text-[49px] [&>span:last-child]:leading-none [&>span:last-child]:font-[350] [&>span:last-child]:tracking-[-2.5px] [&>span:last-child]:tabular-nums max-[520px]:gap-[7px] max-[520px]:[&>span:first-child]:text-sm max-[520px]:[&>span:last-child]:text-[43px] max-[520px]:[&>span:last-child]:tracking-[-2px]"><span>Timer</span><span role="timer" aria-label="Time remaining" aria-live="off">{clock}</span></div>
                  <div className="relative grid h-[86px] w-20 place-items-center"><CoffeeProgress value={remaining / DURATION} expanded ready={ready} /></div>
                </div>
                <div className="mb-4 h-px bg-[#373739]" />
                <footer className="flex items-center gap-[11px] [&_button]:flex [&_button]:shrink-0 [&_button]:items-center [&_button]:justify-center [&_button]:border-0 [&_button]:p-0">
                  <button type="button" className="size-[49px] rounded-full bg-[#6b4920] text-[#ffbd50] hover:bg-[#855b27] max-[520px]:size-[45px]" aria-label={ready ? "Brew again" : running ? "Pause coffee timer" : "Resume coffee timer"} onClick={toggleTimer}>{running ? <Pause size={22} fill="currentColor" strokeWidth={1.5} /> : <Play size={21} fill="currentColor" strokeWidth={1.5} />}</button>
                  <button type="button" className="size-[49px] rounded-full bg-[#4a4a4b] text-white hover:bg-[#5d5d5e] max-[520px]:size-[45px]" aria-label="Cancel coffee timer" onClick={cancel}><X size={28} strokeWidth={1.7} /></button>
                  <Dialog.Trigger asChild><button type="button" className="ml-auto gap-[9px] bg-transparent text-[19px] tracking-[-.6px] text-white hover:text-[#dfdfdf] max-[520px]:gap-[3px] max-[520px]:text-[17px]">Open App <ChevronRight size={25} strokeWidth={2} /></button></Dialog.Trigger>
                </footer>
              </motion.div>
              <motion.span initial={false} animate={{ x: mugX, y: mugY, width: mugSize, height: mugSize }} transition={transition} className="pointer-events-none absolute left-0 top-0 grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#9399a5] [&>svg]:mt-[17%] [&>svg]:h-[110%] [&>svg]:w-[82%]"><TravelMug /></motion.span>
            </motion.div>
            {(["stocks", "amazon", "spending", "ethereum", "alert"] as const).map(value => <IslandActivities key={value} activity={value} active={activity === value} direction={direction} view={view} onView={setView} availableWidth={availableWidth} />)}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[23px] items-center justify-center transition-opacity duration-150 motion-reduce:transition-none [&>span]:h-[3px] [&>span]:w-7 [&>span]:rounded-lg [&>span]:bg-[#424246] group-hover:[&>span]:bg-[#6d6d73]" aria-hidden="true" style={{ opacity: expanded ? 1 : 0 }}><span /></div>
          </motion.section>
        </div>
      <div className="mb-[14px] flex flex-wrap justify-center gap-1 [&>button]:cursor-pointer [&>button]:rounded-2xl [&>button]:border-0 [&>button]:bg-transparent [&>button]:px-[9px] [&>button]:py-[7px] [&>button]:text-[11px] [&>button]:capitalize [&>button]:text-[#7d7d84] [&>button[aria-pressed=true]]:bg-[#0000000b] [&>button[aria-pressed=true]]:text-[#303035] dark:[&>button[aria-pressed=true]]:bg-[#ffffff12] dark:[&>button[aria-pressed=true]]:text-[#ededf0] max-[380px]:[&>button]:px-[7px]" role="group" aria-label="Choose activity" data-island-controls>
        {(["coffee", "stocks", "amazon", "spending", "ethereum", "alert"] as const).map(value => <button key={value} aria-pressed={activity === value} onClick={() => selectActivity(value)}>{value}</button>)}
      </div>
      <div className="flex items-center gap-[5px] rounded-[30px] border border-[#c5c6c940] bg-[#ffffff25] p-1 [&>button]:flex [&>button]:cursor-pointer [&>button]:items-center [&>button]:gap-1 [&>button]:rounded-[20px] [&>button]:border-0 [&>button]:bg-transparent [&>button]:px-3 [&>button]:py-[7px] [&>button]:text-[10px] [&>button]:font-[450] [&>button]:text-[#818187] [&>button[aria-pressed=true]]:bg-[#ffffffe0] [&>button[aria-pressed=true]]:text-[#353538] [&>button:focus-visible]:outline-2 [&>button:focus-visible]:outline-offset-2 [&>button:focus-visible]:outline-[#9b9ba0] dark:border-[#ffffff0d] dark:bg-[#ffffff04] dark:[&>button]:text-[#81818a] dark:[&>button[aria-pressed=true]]:bg-[#2e2e32] dark:[&>button[aria-pressed=true]]:text-[#dddde2]" role="group" aria-label="Activity view" data-island-controls>
        {([ ["compact", "Compact"], ["activity", "Activity"], ["expanded", "Expanded"] ] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={view === value} onClick={() => setView(value)}>{label}{value === "expanded" && <ArrowUpRight size={12} />}</button>)}
      </div>
      <p className="mt-4 text-[10px] tracking-[.1px] text-[#85858b]">{activity === "coffee" ? "Hover or tap to open · Swipe the island left / right" : "Interactive preview · sample financial data"}</p>
    </div>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-[#0005] backdrop-blur-[5px]" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] flex w-[min(330px,calc(100vw-40px))] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-[30px] border border-[#ffffff12] bg-[#111112] p-[30px] font-sans text-[#fafafa] shadow-[0_20px_80px_#0003] outline-none [&>h2]:mt-[18px] [&>h2]:mb-[7px] [&>h2]:text-[27px] [&>h2]:font-[450] [&>h2]:tracking-[-1px] [&>p]:m-0 [&>p]:text-xs [&>p]:text-[#8e8e93] [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-white">
        <span className="text-[15px] font-semibold tracking-[-.7px] text-[#f06b39]">ember</span>
        <Dialog.Title>Your coffee.</Dialog.Title>
        <Dialog.Description>{status}</Dialog.Description>
        <span className="mb-3 mt-[23px] grid size-[84px] place-items-center overflow-hidden rounded-full bg-[#747c8c] [&>svg]:mt-4 [&>svg]:h-[83px] [&>svg]:w-[61px]"><TravelMug /></span>
        <span className="text-[40px] font-[350] tracking-[-1.5px] tabular-nums">{clock}</span>
        <button type="button" className="mt-[25px] w-full cursor-pointer rounded-xl border-0 bg-[#ed6335] p-3 text-[13px] text-white" onClick={toggleTimer}>{ready ? "Brew again" : running ? "Pause brewing" : "Resume brewing"}</button>
        <Dialog.Close className="mt-[17px] cursor-pointer border-0 bg-transparent p-1 text-[11px] text-[#aaaab1]">Back to activity</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
    </Dialog.Root>
  );
}
