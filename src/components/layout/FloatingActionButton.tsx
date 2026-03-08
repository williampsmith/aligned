"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed z-50 bottom-6 right-6 md:bottom-8 md:right-8",
        "w-14 h-14 rounded-full bg-falcon-600 hover:bg-falcon-700",
        "text-falcon-50 shadow-lg hover:shadow-xl",
        "flex items-center justify-center",
        "transition-all duration-200",
        "md:bottom-8 bottom-20",
        className
      )}
      aria-label="Quick log"
    >
      <Plus size={24} />
    </button>
  );
}
