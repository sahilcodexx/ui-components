"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { KEY_LABELS, stepKey, TRAVEL_MM } from "./model";
import frame from "../pen-plotter/plotter.module.css";
import styles from "./keypad.module.css";

const subscribe = () => () => {};
type Props = { base: ReactNode; keys: { id: number; label: string; socket: ReactNode; cap: ReactNode }[]; travel: number; displayTransform: string; displayClip: string };

export default function KeypadLive({ base, keys, travel, displayTransform, displayClip }: Props) {
  const [demo, setDemo] = useState(true);
  const [active, setActive] = useState<Set<number>>(new Set());
  const [typed, setTyped] = useState("");
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const preference = useReducedMotion();
  const reduced = hydrated && preference;
  const running = demo && !reduced;
  const stage = useRef<SVGSVGElement>(null);
  const caps = useRef<(SVGGElement | null)[]>([]);
  const held = useRef(new Set<number>());
  const springs = useRef(KEY_LABELS.map(() => ({ position: 0, velocity: 0 })));
  const autoHeld = useRef<number | null>(null);
  const kick = useRef<() => void>(() => {});
  const clip = useId();

  function press(id: number, manual = true) {
    if (manual) {
      setDemo(false);
      if (autoHeld.current !== null) { held.current.delete(autoHeld.current); autoHeld.current = null; }
    } else autoHeld.current = id;
    if (held.current.has(id)) return;
    held.current.add(id);
    setActive(new Set(held.current));
    setTyped(value => (value + KEY_LABELS[id]).slice(-12));
    kick.current();
  }

  function release(id: number) {
    if (!held.current.delete(id)) return;
    if (autoHeld.current === id) autoHeld.current = null;
    setActive(new Set(held.current));
    kick.current();
  }

  function releaseAll() { autoHeld.current = null; held.current.clear(); setActive(new Set()); kick.current(); }

  useEffect(() => {
    const svg = stage.current;
    if (!svg) return;
    let frameId = 0, last = 0, clock = 0, demoKey = -1, sequence = 0;
    let visible = true, disposed = false, processing = false;
    function tick(now: number) {
      frameId = 0;
      if (!visible || document.hidden || disposed) return;
      processing = true;
      const dt = last ? Math.min((now - last) / 1000, .05) : 0;
      last = now;
      clock += dt;
      if (running) {
        if (demoKey >= 0 && clock >= .30) { release(demoKey); demoKey = -1; }
        if (clock >= 1.1) { clock = 0; demoKey = sequence % 12; sequence++; press(demoKey, false); }
      }
      let moving = false;
      springs.current.forEach((spring, id) => {
        stepKey(spring, held.current.has(id), dt, !!reduced);
        caps.current[id]?.setAttribute("transform", `translate(0 ${spring.position * travel})`);
        caps.current[id]?.setAttribute("data-travel", (spring.position * TRAVEL_MM).toFixed(2));
        if (spring.velocity || spring.position !== (held.current.has(id) ? 1 : 0)) moving = true;
      });
      processing = false;
      if (running || moving) frameId = requestAnimationFrame(tick);
    }
    function wake() { if (!frameId && !processing && visible && !document.hidden && !disposed) { last = 0; frameId = requestAnimationFrame(tick); } }
    function loseFocus() { releaseAll(); }
    kick.current = wake;
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) wake(); else { if (demoKey >= 0) release(demoKey); demoKey = -1; clock = 0; cancelAnimationFrame(frameId); frameId = 0; } });
    observer.observe(svg);
    window.addEventListener("blur", loseFocus);
    document.addEventListener("visibilitychange", wake);
    wake();
    return () => { disposed = true; cancelAnimationFrame(frameId); observer.disconnect(); window.removeEventListener("blur", loseFocus); document.removeEventListener("visibilitychange", wake); if (demoKey >= 0) { held.current.delete(demoKey); } };
  }, [running, reduced, travel]);

  return (
    <figure className={`${frame.figure} ${styles.figure} iso-plate`} tabIndex={0} role="group" aria-label="Mechanical macro keypad" onKeyDownCapture={event => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      if (event.key === "Escape") { releaseAll(); setTyped(""); setDemo(true); return; }
      const id = KEY_LABELS.indexOf(event.key.toUpperCase());
      if (id >= 0) { event.preventDefault(); event.stopPropagation(); press(id); }
    }} onKeyUp={event => { const id = KEY_LABELS.indexOf(event.key.toUpperCase()); if (id >= 0) { event.stopPropagation(); release(id); } }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) releaseAll(); }}>
      <div className={`${frame.card} ${frame.unframed} ${styles.card}`}>
        <svg ref={stage} className={`${frame.drawing} ${styles.drawing}`} viewBox="0 0 760 440" role="group" aria-label="Isometric twelve-key mechanical keypad">
          <title>The macro pad</title><desc>Press any key with your pointer, or focus the illustration and type QWER, ASDF, or ZXCV. Each cap moves through 3.6 millimetres of spring travel. Press Escape to clear the display and restart the automatic demo.</desc>
          <defs><clipPath id={clip}><path d={displayClip} /></clipPath></defs>
          {base}
          <g clipPath={`url(#${clip})`}><text className={styles.displayText} transform={displayTransform} fontSize={4.2} textAnchor="middle">{typed.slice(-8) || "READY"}</text></g>
          {keys.map(key => <g key={key.id}>
            {key.socket}
            <g ref={element => { caps.current[key.id] = element; }} className={styles.key} data-key={key.label} data-travel="0.00" role="button" tabIndex={0} aria-label={`Key ${key.label}`} aria-pressed={active.has(key.id)}
              onPointerDown={event => { event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); press(key.id); }}
              onPointerUp={() => release(key.id)} onPointerCancel={() => release(key.id)}
              onKeyDown={event => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); event.stopPropagation(); if (!event.repeat) press(key.id); } }}
              onKeyUp={event => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); event.stopPropagation(); release(key.id); } }}>
              {key.cap}
            </g>
          </g>)}
        </svg>
      </div>
    </figure>
  );
}
