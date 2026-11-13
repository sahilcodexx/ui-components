"use client";

import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { DropdownMenu } from "radix-ui";
import { Glass } from "glisse";
import { Check, ChevronDown } from "lucide-react";

type GlassDropdownProps = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  dark?: boolean;
  onChange: (value: string) => void;
};

export default function GlassDropdown({ label, value, options, dark = false, onChange }: GlassDropdownProps) {
  const popupStyle = {
    "--lg-glass": dark ? "rgba(18,25,42,.32)" : "rgba(255,255,255,.24)",
    "--lg-blur": "22px",
    "--lg-edge": "rgba(255,255,255,.68)",
    "--lg-drop": "rgba(8,18,36,.25)",
  } as CSSProperties;

  return (
    <DropdownMenu.Root>
      <div>
        <p className="mb-2 text-xs text-[var(--lg-muted)]">{label}</p>
        <Glass className="flex h-[54px] items-center justify-between rounded-2xl px-4 text-sm text-[var(--lg-foreground)]">
          <span>{value}</span>
          <DropdownMenu.Trigger asChild>
            <button type="button" aria-label={`Open ${label}`} className="grid size-9 place-items-center rounded-full text-[var(--lg-foreground)] transition hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80">
              <ChevronDown size={17} />
            </button>
          </DropdownMenu.Trigger>
        </Glass>

        <DropdownMenu.Content asChild align="end" sideOffset={8}>
          <motion.div initial={{ opacity: 0, y: -5, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.16, ease: "easeOut" }} className="z-50 min-w-[190px] outline-none">
            <Glass style={popupStyle} className="rounded-[20px] p-1.5 text-[var(--lg-foreground)]">
              <DropdownMenu.RadioGroup value={value} onValueChange={onChange}>
                {options.map(option => (
                  <DropdownMenu.RadioItem key={option.value} value={option.value} className="flex min-h-10 cursor-pointer items-center justify-between gap-4 rounded-[14px] px-3 text-sm outline-none transition-colors data-[highlighted]:bg-[var(--lg-highlight)]">
                    {option.label}<DropdownMenu.ItemIndicator><Check size={15} /></DropdownMenu.ItemIndicator>
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </Glass>
          </motion.div>
        </DropdownMenu.Content>
      </div>
    </DropdownMenu.Root>
  );
}
