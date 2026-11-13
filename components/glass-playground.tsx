"use client";

import { useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button, Glass, SegmentedControl, Slider, Switch } from "glisse";
import GlassDropdown from "@/components/ui/glass-dropdown";
import { Moon, RotateCcw, Sparkles, Sun } from "lucide-react";

const scenes = [
  { name: "Aurora", light: "bg-[linear-gradient(135deg,#faebd5_0%,#caeadc_34%,#78c9e4_62%,#4558a0_100%)]", dark: "bg-[linear-gradient(135deg,#10192c_0%,#243d68_42%,#161f3c_72%,#493b62_100%)]" },
  { name: "Ocean", light: "bg-[linear-gradient(135deg,#d7f2ed_0%,#8bd9e4_40%,#468fc7_70%,#263c7d_100%)]", dark: "bg-[linear-gradient(135deg,#10292f_0%,#185367_42%,#163d68_72%,#20284f_100%)]" },
  { name: "Dusk", light: "bg-[linear-gradient(135deg,#f9dfcf_0%,#e6bdd0_40%,#a280bc_70%,#373d7b_100%)]", dark: "bg-[linear-gradient(135deg,#302039_0%,#623b63_42%,#443d78_72%,#172342_100%)]" },
];

const materials = {
  Clear: { light: "rgba(255,255,255,.24)", dark: "rgba(255,255,255,.12)" },
  Soft: { light: "rgba(255,255,255,.48)", dark: "rgba(18,24,40,.48)" },
  Tint: { light: "rgba(137,190,255,.36)", dark: "rgba(82,128,210,.28)" },
};

export default function GlassPlayground() {
  const [scene, setScene] = useState(0);
  const [material, setMaterial] = useState<keyof typeof materials>("Clear");
  const [blur, setBlur] = useState(18);
  const [rim, setRim] = useState(true);
  const [dark, setDark] = useState(false);
  const reduced = useReducedMotion();
  const glassVariables = {
    "--lg-glass": materials[material][dark ? "dark" : "light"],
    "--lg-blur": `${blur}px`,
    "--lg-edge": rim ? "rgba(255,255,255,.58)" : "rgba(255,255,255,.12)",
    "--lg-drop": rim ? "rgba(12,28,55,.18)" : "transparent",
  } as CSSProperties;

  return (
    <main data-theme={dark ? "dark" : "light"} className={`relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-5 py-12 transition-colors duration-500 ${dark ? "bg-[#080b14]" : "bg-[#e8f4f5]"}`}>
      <div data-glisse-backdrop="" className="absolute inset-0 -z-10 overflow-hidden">
        <div className={`absolute inset-0 transition-colors duration-700 ${dark ? scenes[scene].dark : scenes[scene].light}`} />
        <motion.div animate={reduced ? {} : { x: [0, 26, 0], y: [0, -18, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} className={`absolute -left-[10%] top-[8%] h-[58vw] w-[58vw] rounded-full bg-[#fff3d1]/60 blur-[100px] transition-opacity duration-700 ${rim ? "opacity-80" : "opacity-30"}`} />
        <motion.div animate={reduced ? {} : { x: [0, -20, 0], y: [0, 20, 0] }} transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }} className={`absolute -right-[10%] top-[15%] h-[65vw] w-[58vw] rounded-full bg-[#54d8ee]/50 blur-[110px] transition-opacity duration-700 ${rim ? "opacity-80" : "opacity-30"}`} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#172a60]/10" />
      </div>

      <button type="button" onClick={() => setDark(value => !value)} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} className="absolute right-6 top-6 z-10 grid size-11 place-items-center rounded-full border border-white/35 bg-white/25 text-white shadow-lg shadow-slate-900/10 backdrop-blur-xl transition hover:bg-white/40 sm:right-10 sm:top-10">
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <motion.section initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.45, ease: "easeOut" }} className="w-full max-w-5xl">
        <header className={`mb-7 flex items-end justify-between gap-4 ${dark ? "text-white" : "text-slate-900"}`}>
          <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[.22em] text-blue-600">GLASS / INTERACTIVE STUDIES</p><h1 className="text-3xl font-medium tracking-[-.05em] sm:text-[40px]">Glass controls</h1><p className={`mt-2 text-sm ${dark ? "text-white/65" : "text-slate-600"}`}>Change the surface. Watch the light move through it.</p></div>
          <div className="hidden items-center gap-2 pb-1 text-xs sm:flex"><span className="size-2 rounded-full bg-emerald-400" /> Live</div>
        </header>

        <div className="grid gap-4 md:grid-cols-[1.15fr_.85fr]">
          <Glass style={glassVariables} className="relative flex min-h-[390px] flex-col justify-between overflow-hidden rounded-[30px] p-6 text-[var(--lg-foreground)] sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[.16em] text-[var(--lg-muted)]"><Sparkles size={14} /> Surface preview</span>
              <span className="rounded-full border border-[var(--lg-edge)] bg-white/15 px-3 py-1 text-[10px] text-[var(--lg-muted)]">{material} · {blur}px</span>
            </div>
            <div className="relative z-10 max-w-[370px] py-8">
              <p className="mb-3 text-xs text-[var(--lg-muted)]">A little color, held in</p>
              <h2 className="text-5xl font-medium leading-[.96] tracking-[-.06em] sm:text-[64px]">Liquid<br />glass.</h2>
              <p className="mt-5 max-w-[250px] text-sm leading-relaxed text-[var(--lg-muted)]">A translucent surface that softens and bends the scene behind it.</p>
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[11px] text-[var(--lg-muted)]">Drag or press a control</span>
              <Button variant="glass" aria-label="Cycle glass material" icon={<Sparkles size={16} />} onClick={() => setMaterial(value => value === "Clear" ? "Soft" : value === "Soft" ? "Tint" : "Clear")} />
            </div>
            <div className="pointer-events-none absolute -right-14 top-[18%] size-56 rounded-full border border-white/45 bg-white/10 shadow-[inset_14px_8px_35px_#ffffff24,0_25px_70px_#122d5d1a] backdrop-blur-[2px]" />
            <div className="pointer-events-none absolute -right-6 top-[28%] size-40 rounded-full border border-white/35 bg-gradient-to-br from-white/45 via-white/10 to-blue-300/20 shadow-[inset_-10px_-10px_30px_#18386d20]" />
          </Glass>

          <Glass className="rounded-[30px] p-5 text-[var(--lg-foreground)] sm:p-6">
            <div className="mb-5"><p className="text-[11px] font-semibold uppercase tracking-[.17em] text-[var(--lg-muted)]">Try the controls</p><p className="mt-1 text-sm">Each one changes the glass.</p></div>

            <div className="mb-5">
              <GlassDropdown label="Backdrop dropdown" value={scenes[scene].name} options={scenes.map(({ name }) => ({ value: name, label: name }))} dark={dark} onChange={value => setScene(scenes.findIndex(item => item.name === value))} />
            </div>

            <div className="mb-5">
              <p className="mb-2 text-xs text-[var(--lg-muted)]">Material</p>
              <SegmentedControl aria-label="Glass material" items={[{ value: "Clear", label: "Clear" }, { value: "Soft", label: "Soft" }, { value: "Tint", label: "Tint" }]} value={material} onValueChange={value => setMaterial(value as keyof typeof materials)} className="w-full" />
            </div>

            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-xs text-[var(--lg-muted)]"><label htmlFor="glass-blur">Blur strength</label><span>{blur}px</span></div>
              <Slider id="glass-blur" aria-label="Blur strength" min={4} max={32} value={blur} onValueChange={setBlur} />
            </div>

            <div className="flex items-center justify-between border-t border-[var(--lg-edge)] pt-4">
              <div><p className="text-sm">Edge highlight</p><p className="mt-0.5 text-[11px] text-[var(--lg-muted)]">A fine reflective rim</p></div>
              <Switch aria-label="Edge highlight" checked={rim} onCheckedChange={setRim} />
            </div>
            <button type="button" onClick={() => { setScene(0); setMaterial("Clear"); setBlur(18); setRim(true); }} className="mt-4 flex items-center gap-2 text-[11px] text-[var(--lg-muted)] transition hover:text-[var(--lg-foreground)]"><RotateCcw size={13} /> Reset controls</button>
          </Glass>
        </div>
      </motion.section>
    </main>
  );
}
