"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWeekRange, isCurrentWeek, navigateWeek } from "@/lib/utils/dates";

interface WeekSelectorProps {
  currentDate: Date;
  onChange: (date: Date) => void;
}

export function WeekSelector({ currentDate, onChange }: WeekSelectorProps) {
  const isCurrent = isCurrentWeek(currentDate);

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(navigateWeek(currentDate, "prev"))}
        className="text-falcon-500 hover:text-falcon-700 hover:bg-falcon-100"
      >
        <ChevronLeft size={18} />
      </Button>
      <span className="text-sm font-medium text-falcon-800 min-w-[160px] text-center">
        {formatWeekRange(currentDate)}
        {isCurrent && (
          <span className="ml-2 text-xs text-falcon-500">This week</span>
        )}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(navigateWeek(currentDate, "next"))}
        disabled={isCurrent}
        className="text-falcon-500 hover:text-falcon-700 hover:bg-falcon-100"
      >
        <ChevronRight size={18} />
      </Button>
    </div>
  );
}
