"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const CODE = "123456";
const LENGTH = 6;

type Status = "idle" | "error" | "success";

export function OtpInput() {
  const reduce = useReducedMotion();
  const [values, setValues] = useState<string[]>(Array(LENGTH).fill(""));
  const [status, setStatus] = useState<Status>("idle");
  const [shakeKey, setShakeKey] = useState(0);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const focusAt = (i: number) => inputs.current[i]?.focus();

  const verify = (digits: string[]) => {
    const code = digits.join("");
    if (code.length < LENGTH) return;

    if (code === CODE) {
      setStatus("success");
      return;
    }

    setStatus("error");
    setShakeKey((k) => k + 1);
    const t = setTimeout(() => {
      setValues(Array(LENGTH).fill(""));
      setStatus("idle");
      focusAt(0);
    }, 900);
    timers.current.push(t);
  };

  const setDigit = (index: number, digit: string) => {
    const next = [...values];
    next[index] = digit;
    setValues(next);
    if (status !== "idle") setStatus("idle");
    return next;
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit && raw !== "") return;

    const next = setDigit(index, digit);
    if (digit && index < LENGTH - 1) focusAt(index + 1);
    verify(next);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (values[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        setDigit(index - 1, "");
        focusAt(index - 1);
      }
      if (status !== "idle") setStatus("idle");
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusAt(index - 1);
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;

    const next = Array(LENGTH).fill("");
    pasted.split("").forEach((d, i) => (next[i] = d));
    setValues(next);
    if (status !== "idle") setStatus("idle");
    focusAt(Math.min(pasted.length, LENGTH - 1));
    verify(next);
  };

  const borderClass =
    status === "error"
      ? "border-red-500/70 bg-red-500/[0.04] text-red-500 dark:border-red-500/80 dark:bg-red-500/[0.06] dark:text-red-400"
      : status === "success"
        ? "border-emerald-500/70 bg-transparent text-neutral-900 dark:border-emerald-500/80 dark:text-white"
        : "border-neutral-200 bg-neutral-100/60 text-neutral-900 hover:border-neutral-300 focus-within:border-neutral-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:border-white/20 dark:focus-within:border-white/30";

  const helperText =
    status === "error"
      ? "Incorrect code. Try again."
      : status === "success"
        ? "Verified successfully."
        : "Enter 123456 to verify.";

  const helperClass =
    status === "error"
      ? "text-red-500 dark:text-red-400"
      : status === "success"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-neutral-400 dark:text-neutral-500";

  return (
    <div className="w-full max-w-[400px] rounded-2xl p-7 font-sans">
      <p className="mb-4 text-sm font-medium text-neutral-800 dark:text-neutral-200">
        Verification code
      </p>

      <motion.div
        key={shakeKey}
        animate={
          status === "error" && !reduce
            ? { x: [0, -8, 7, -5, 4, -2, 0] }
            : { x: 0 }
        }
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex gap-2.5"
      >
        {values.map((value, i) => (
          <div
            key={i}
            className={cn(
              "relative h-12 flex-1 overflow-hidden rounded-xl border transition-colors duration-200",
              borderClass
            )}
          >
            <input
              ref={(el) => {
                inputs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={value}
              aria-label={`Digit ${i + 1}`}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              className="absolute inset-0 h-full w-full bg-transparent text-center text-lg font-semibold text-transparent caret-neutral-900 outline-none selection:bg-transparent dark:caret-white"
            />
            <AnimatePresence mode="wait" initial={false}>
              {value ? (
                <motion.span
                  key={value + i}
                  initial={reduce ? false : { y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center text-lg font-semibold"
                >
                  {value}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>

      <div className="relative mt-4 h-5 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={status + helperText}
            initial={
              reduce
                ? { opacity: 0 }
                : { y: "100%", opacity: 0, filter: "blur(6px)" }
            }
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={
              reduce
                ? { opacity: 0 }
                : { y: "-100%", opacity: 0, filter: "blur(6px)" }
            }
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute inset-0 text-[13px] transition-colors duration-200",
              helperClass
            )}
          >
            {helperText}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default OtpInput;
