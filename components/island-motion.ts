import type { Transition } from "motion/react";

export const islandSpring: Transition = { type: "spring", stiffness: 260, damping: 30, mass: 1 };

export function panelMotion(visible: boolean, reduced: boolean | null) {
  return {
    initial: false as const,
    animate: { opacity: visible ? 1 : 0, y: visible || reduced ? 0 : 6 },
    transition: { duration: reduced ? 0 : visible ? .22 : .1, delay: reduced || !visible ? 0 : .12, ease: "easeOut" as const },
    inert: !visible,
    "aria-hidden": !visible,
    style: { pointerEvents: visible ? "auto" as const : "none" as const },
  };
}

export function sceneMotion(visible: boolean, reduced: boolean | null, direction: number) {
  return {
    ...panelMotion(visible, reduced),
    animate: {
      opacity: visible ? [0, 1] : 0,
      x: reduced ? 0 : visible ? [direction * 24, 0] : -direction * 24,
    },
    transition: { duration: reduced ? 0 : visible ? .28 : .14, delay: reduced || !visible ? 0 : .06, ease: [.22, 1, .36, 1] as const },
  };
}
