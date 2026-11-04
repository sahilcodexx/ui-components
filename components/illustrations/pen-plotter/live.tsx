"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type PointerEvent } from "react";
import { useReducedMotion } from "motion/react";
import { poseAt, type PlotPoint } from "./model";
import styles from "./plotter.module.css";

type Props = { bed: ReactNode; gantry: ReactNode; head: ReactNode; trace: string; samples: PlotPoint[]; axisX: number[]; axisY: number[] };
const REST = 0.12;
const subscribeToMount = () => () => {};

export default function PlotterLive({ bed, gantry, head, trace, samples, axisX, axisY }: Props) {
  const [playing, setPlaying] = useState(true);
  const prefersReduced = useReducedMotion();
  const hydrated = useSyncExternalStore(subscribeToMount, () => true, () => false);
  const reduced = hydrated && prefersReduced;
  const running = playing && !reduced;
  const stage = useRef<SVGSVGElement>(null);
  const gantryRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const inkRef = useRef<SVGPathElement>(null);
  const state = useRef({ progress: REST, target: REST, hold: 0, dragging: false });
  const kick = useRef<() => void>(() => {});
  const rest = poseAt(samples, REST);
  const shift = (x: number, y: number) => `translate(${axisX[0] * x + axisY[0] * y} ${axisX[1] * x + axisY[1] * y})`;

  useEffect(() => {
    const svg = stage.current;
    if (!svg) return;
    let frame = 0;
    let last = 0;
    let visible = true;
    let disposed = false;
    const s = state.current;
    function draw() {
      const pose = poseAt(samples, s.progress);
      gantryRef.current?.setAttribute("transform", `translate(${axisY[0] * pose.y} ${axisY[1] * pose.y})`);
      headRef.current?.setAttribute("transform", `translate(${axisX[0] * pose.x + axisY[0] * pose.y} ${axisX[1] * pose.x + axisY[1] * pose.y})`);
      inkRef.current?.setAttribute("stroke-dashoffset", String(1 - pose.ink));
    }
    function tick(now: number) {
      frame = 0;
      if (!visible || document.hidden || disposed) return;
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 0;
      last = now;
      if (running && !s.dragging) {
        if (s.target >= 1) {
          s.hold += dt;
          if (s.hold > 1.6) { s.target = 0; s.progress = 0; s.hold = 0; }
        } else s.target = Math.min(1, s.target + dt / 18);
      }
      const delta = s.target - s.progress;
      s.progress = reduced || Math.abs(delta) < 0.00005 ? s.target : s.progress + delta * (1 - Math.exp(-dt / 0.1));
      draw();
      if (running || Math.abs(s.target - s.progress) > 0.00005) frame = requestAnimationFrame(tick);
    }
    function wake() { if (!frame && visible && !document.hidden && !disposed) { last = 0; frame = requestAnimationFrame(tick); } }
    kick.current = wake;
    draw();
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) wake(); else { cancelAnimationFrame(frame); frame = 0; } });
    observer.observe(svg);
    document.addEventListener("visibilitychange", wake);
    wake();
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener("visibilitychange", wake); };
  }, [running, reduced, samples, axisX, axisY]);

  function scrub(value: number) {
    setPlaying(false);
    state.current.target = Math.max(0, Math.min(1, value));
    state.current.hold = 0;
    kick.current();
  }

  function pointerScrub(event: PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    scrub((event.clientX - bounds.left - bounds.width * 0.15) / (bounds.width * 0.7));
  }

  return (
    <figure className={`${styles.figure} iso-plate`}>
      <div className={`${styles.card} ${styles.unframed}`}>
        <svg ref={stage} className={styles.drawing} viewBox="0 0 760 440" role="img" aria-label="Interactive isometric pen plotter drawing a five-petal rosette" tabIndex={0}
          onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); state.current.dragging = true; pointerScrub(event); }}
          onPointerMove={event => { if (state.current.dragging) pointerScrub(event); }}
          onPointerUp={() => { state.current.dragging = false; }} onPointerCancel={() => { state.current.dragging = false; }}
          onKeyDown={event => { if (["ArrowLeft", "ArrowRight", "Home", "End", " "].includes(event.key)) event.preventDefault(); if (event.key === "ArrowLeft") scrub(state.current.target - 0.03); if (event.key === "ArrowRight") scrub(state.current.target + 0.03); if (event.key === "Home") scrub(0); if (event.key === "End") scrub(1); if (event.key === " ") setPlaying(value => !value); }}>
          <title>The pen plotter</title><desc>A detailed isometric drawing of a mechanical plotter. Drag horizontally or use the arrow keys to trace the rosette. Press Space to pause or resume, Home to return to the start, or End to finish the drawing.</desc>
          {bed}
          <path className={styles.guide} d={trace} />
          <path ref={inkRef} className={styles.ink} d={trace} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - rest.ink} />
          <g ref={gantryRef} data-part="gantry" transform={shift(0, rest.y)}>{gantry}</g>
          <g ref={headRef} data-part="pen-head" transform={shift(rest.x, rest.y)}>{head}</g>
        </svg>
      </div>
    </figure>
  );
}
