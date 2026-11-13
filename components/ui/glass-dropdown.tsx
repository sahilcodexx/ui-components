"use client";

import type { CSSProperties } from "react";
import { Glass, Menu } from "glisse";
import { Check, ChevronDown } from "lucide-react";

type GlassDropdownProps = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  dark?: boolean;
  onChange: (value: string) => void;
};

export default function GlassDropdown({ label, value, options, dark = false, onChange }: GlassDropdownProps) {
  return (
    <div>
      <p className="mb-2 text-xs text-[var(--lg-muted)]">{label}</p>
      <Glass className="flex h-[54px] items-center justify-between rounded-2xl px-4 text-sm text-[var(--lg-foreground)]">
        <span>{value}</span>
        <Menu
          aria-label={label}
          icon={<ChevronDown />}
          items={options.map(option => ({ label: option.label, icon: option.value === value ? <Check /> : undefined, onSelect: () => onChange(option.value) }))}
          style={{ "--lg-surface": dark ? "rgba(18,25,42,.3)" : "rgba(255,255,255,.24)", "--lg-surface-edge": "rgba(255,255,255,.65)", "--lg-shadow": "rgba(8,18,36,.25)" } as CSSProperties}
        />
      </Glass>
    </div>
  );
}
