"use client";

import { useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button, Glass } from "glisse";
import { Moon, Sparkles, Sun } from "lucide-react";

export default function GlassPlayground() {
  const [dark, setDark] = useState(false);
  const reduced = useReducedMotion();
  const previewStyle = { "--lg-glass": dark ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.24)", "--lg-blur": "18px", "--lg-edge": "rgba(255,255,255,.58)" } as CSSProperties;

  return (
    <main data-theme={dark ? "dark" : "light"} className={`relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-5 py-12 transition-colors duration-500 ${dark ? "bg-[#080b14]" : "bg-[#e8f4f5]"}`}>
      <div data-glisse-backdrop="" className="absolute inset-0 -z-10 overflow-hidden">
        <div className={`absolute inset-0 ${dark ? "bg-[linear-gradient(135deg,#10192c_0%,#243d68_42%,#161f3c_72%,#493b62_100%)]" : "bg-[linear-gradient(135deg,#faebd5_0%,#caeadc_34%,#78c9e4_62%,#4558a0_100%)]"}`} />
        <motion.div animate={reduced ? {} : { x: [0, 26, 0], y: [0, -18, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-[10%] top-[8%] h-[58vw] w-[58vw] rounded-full bg-[#fff3d1]/60 blur-[100px]" />
        <motion.div animate={reduced ? {} : { x: [0, -20, 0], y: [0, 20, 0] }} transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-[10%] top-[15%] h-[65vw] w-[58vw] rounded-full bg-[#54d8ee]/50 blur-[110px]" />
      </div>

      <button type="button" onClick={() => setDark(value => !value)} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} className="absolute right-6 top-6 z-10 grid size-11 place-items-center rounded-full border border-white/35 bg-white/25 text-white shadow-lg shadow-slate-900/10 backdrop-blur-xl transition hover:bg-white/40 sm:right-10 sm:top-10">
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <motion.section initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.45, ease: "easeOut" }} className="w-full max-w-5xl">
        <header className={`mb-7 ${dark ? "text-white" : "text-slate-900"}`}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.22em] text-blue-600">GLASS / INTERACTIVE STUDIES</p>
          <h1 className="text-3xl font-medium tracking-[-.05em] sm:text-[40px]">Glass controls</h1>
          <p className={`mt-2 text-sm ${dark ? "text-white/65" : "text-slate-600"}`}>Change the surface. Watch the light move through it.</p>
        </header>

        <Glass style={previewStyle} className="relative flex min-h-[430px] flex-col justify-between overflow-hidden rounded-[32px] p-6 text-[var(--lg-foreground)] sm:p-9">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[.16em] text-[var(--lg-muted)]"><Sparkles size={14} /> Surface preview</span>
            <span className="rounded-full border border-[var(--lg-edge)] bg-white/15 px-3 py-1 text-[10px] text-[var(--lg-muted)]">Clear · 18px</span>
          </div>
          <div className="relative z-10 max-w-[420px] py-8">
            <p className="mb-3 text-xs text-[var(--lg-muted)]">A little color, held in</p>
            <h2 className="text-5xl font-medium leading-[.96] tracking-[-.06em] sm:text-[72px]">Liquid<br />glass.</h2>
            <p className="mt-5 max-w-[280px] text-sm leading-relaxed text-[var(--lg-muted)]">A translucent surface that softens and bends the scene behind it.</p>
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[11px] text-[var(--lg-muted)]">Try the same surface in another theme</span>
            <Button variant="glass" aria-label="Toggle preview theme" icon={<Sparkles size={16} />} onClick={() => setDark(value => !value)} />
          </div>
          <div className="pointer-events-none absolute -right-12 top-[17%] size-64 rounded-full border border-white/45 bg-white/10 shadow-[inset_14px_8px_35px_#ffffff24,0_25px_70px_#122d5d1a] backdrop-blur-[2px]" />
          <div className="pointer-events-none absolute -right-3 top-[28%] size-44 rounded-full border border-white/35 bg-gradient-to-br from-white/45 via-white/10 to-blue-300/20 shadow-[inset_-10px_-10px_30px_#18386d20]" />
        </Glass>
      </motion.section>
    </main>
  );
}
