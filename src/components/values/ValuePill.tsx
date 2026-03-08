"use client";

import { cn } from "@/lib/utils";
import { getContrastText } from "@/lib/utils/colors";

interface ValuePillProps {
  label: string;
  color: string;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
  disabled?: boolean;
}

export function ValuePill({
  label,
  color,
  selected,
  onClick,
  size = "md",
  disabled,
}: ValuePillProps) {
  const textColor = getContrastText(color);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-all duration-150",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3.5 py-1.5 text-sm",
        onClick && !disabled ? "cursor-pointer hover:opacity-90" : "cursor-default",
        disabled && "opacity-40 cursor-not-allowed",
        selected ? "ring-2 ring-falcon-950 ring-offset-2" : ""
      )}
      style={{
        backgroundColor: selected ? color : `${color}22`,
        color: selected ? textColor : color,
        borderWidth: "1px",
        borderColor: selected ? color : `${color}44`,
      }}
    >
      {label}
    </button>
  );
}
