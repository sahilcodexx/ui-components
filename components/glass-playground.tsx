"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button, Glass, Slider, TabBar } from "glisse";
import { AudioLines, BookOpen, Clock3, Compass, Headphones, House, Moon, Pause, Play, Radio, Sun, Volume2 } from "lucide-react";

const tabs = [
  { value: "home", label: "Home", icon: <House size={17} /> },
  { value: "browse", label: "Browse", icon: <Compass size={17} /> },
  { value: "radio", label: "Radio", icon: <Radio size={17} /> },
  { value: "library", label: "Library", icon: <BookOpen size={17} /> },
];

const titles = { home: "A quiet kind of blue", browse: "Find your frequency", radio: "Somewhere in the blue", library: "Saved for later" };

export default function GlassPlayground() {
  const [tab, setTab] = useState("home");
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(42);
  const [dark, setDark] = useState(false);
  const reduced = useReducedMotion();

  return (
    <main data-theme={dark ? "dark" : "light"} className={`relative isolate grid min-h-dvh place-items-center overflow-hidden px-5 py-12 transition-colors duration-500 ${dark ? "bg-[#080b14]" : "bg-[#e8f4f5]"}`}>
      <div data-glisse-backdrop="" className="absolute inset-0 -z-10 overflow-hidden">
        <div className={`absolute inset-0 transition-colors duration-500 ${dark ? "bg-[linear-gradient(135deg,#10192c_0%,#243d68_42%,#161f3c_72%,#493b62_100%)]" : "bg-[linear-gradient(135deg,#f8e9d4_0%,#c9ebdf_28%,#88cde4_52%,#4a77cb_76%,#bd8caf_100%)]"}`} />
        <div className={`absolute -left-[10%] top-[8%] h-[58vw] w-[58vw] rounded-full bg-[#fff3d1]/65 blur-[100px] transition-opacity duration-700 ${dark ? "opacity-25" : "opacity-90"}`} />
        <div className={`absolute -right-[10%] top-[15%] h-[65vw] w-[58vw] rounded-full bg-[#54d8ee]/55 blur-[110px] transition-opacity duration-700 ${dark ? "opacity-35" : "opacity-80"}`} />
        <div className={`absolute -bottom-[42%] left-[25%] h-[75vw] w-[80vw] rounded-full bg-[#202d71]/70 blur-[100px] transition-opacity duration-700 ${dark ? "opacity-80" : "opacity-65"}`} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#172a60]/10" />
      </div>

      <button type="button" onClick={() => setDark(value => !value)} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} className="absolute right-6 top-6 z-10 grid size-11 place-items-center rounded-full border border-white/30 bg-white/20 text-white shadow-lg shadow-slate-900/10 backdrop-blur-xl transition hover:bg-white/30 sm:right-10 sm:top-10">
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <motion.div aria-hidden="true" className="pointer-events-none absolute left-[9%] top-[37%] hidden md:block" animate={{ y: reduced ? 0 : [0, -7, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
        <Glass className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white">
          <Clock3 size={17} className="text-white/75" />
          <div><p className="text-sm font-medium">09:41</p><p className="text-[10px] tracking-wide text-white/60">TUESDAY</p></div>
        </Glass>
      </motion.div>
      <motion.div aria-hidden="true" className="pointer-events-none absolute bottom-[34%] right-[9%] hidden md:block" animate={{ y: reduced ? 0 : [0, 7, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}>
        <Glass className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white">
          <AudioLines size={18} className="text-white/80" />
          <div><p className="text-xs font-medium">Spatial audio</p><p className="mt-0.5 text-[10px] text-white/60">ON · IMMERSIVE</p></div>
        </Glass>
      </motion.div>

      <motion.section initial={{ opacity: 0, y: reduced ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.55, ease: "easeOut" }} className="flex w-full max-w-[390px] flex-col items-center gap-5">
        <p className="text-[11px] font-medium uppercase tracking-[.24em] text-white/80 drop-shadow">A little light, held in glass</p>
        <TabBar aria-label="Listening space" items={tabs} value={tab} onValueChange={setTab} className="max-w-full" />

        <Glass className="w-full rounded-[28px] p-5 text-white sm:p-6">
          <div className="flex items-center gap-4">
            <Button variant="glass" aria-label={playing ? "Pause preview" : "Play preview"} icon={playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />} onClick={() => setPlaying(value => !value)} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{titles[tab as keyof typeof titles]}</p>
              <p className="mt-1 text-xs text-white/65">Ambient mix · 03:24</p>
            </div>
            <Headphones size={18} className="text-white/70" />
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-white/20 pt-4 text-white/75">
            <Volume2 size={16} className="shrink-0" />
            <Slider aria-label="Volume" min={0} max={100} value={volume} onValueChange={setVolume} className="flex-1" />
            <span className="w-7 text-right text-[11px] tabular-nums">{volume}</span>
          </div>
        </Glass>
      </motion.section>
    </main>
  );
}
