"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Search } from "lucide-react";

export function Spotlight() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 180);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-lg font-sans">
      <motion.div
        initial={false}
        animate={{ width: open ? "100%" : 48 }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: "spring", stiffness: 500, damping: 35, mass: 0.85 }
        }
        className="relative flex h-12 items-center overflow-hidden rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_14px_-4px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(0,0,0,0.06)] dark:bg-neutral-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_4px_14px_-4px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.1)]"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open search"
          className="relative z-10 flex h-full w-12 shrink-0 items-center justify-center outline-none"
        >
          <Search
            className="h-5 w-5 text-neutral-700 dark:text-neutral-200"
            strokeWidth={2.25}
          />
        </button>

        <motion.input
          ref={inputRef}
          type="text"
          placeholder="Search"
          initial={false}
          animate={{
            opacity: open ? 1 : 0,
            transition: reduce
              ? { duration: 0 }
              : { duration: 0.2, delay: open ? 0.1 : 0 },
          }}
          tabIndex={open ? 0 : -1}
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => {
            if (!e.currentTarget.value) setOpen(false);
          }}
          className="h-full min-w-0 flex-1 bg-transparent pr-4 text-[15px] text-neutral-900 caret-neutral-900 outline-none placeholder:text-neutral-500 disabled:cursor-default dark:text-neutral-100 dark:caret-white dark:placeholder:text-neutral-400"
          style={{ pointerEvents: open ? "auto" : "none" }}
        />
      </motion.div>
    </div>
  );
}

export default Spotlight;
