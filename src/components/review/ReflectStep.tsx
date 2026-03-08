"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlignmentBars } from "@/components/dashboard/AlignmentBars";
import type { ValueStats } from "@/lib/utils/stats";

interface ReflectStepProps {
  valueStats: ValueStats[];
  onComplete: (satisfied: boolean) => void;
}

export function ReflectStep({ valueStats, onComplete }: ReflectStepProps) {
  const [satisfied, setSatisfied] = useState<boolean | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <p className="text-sm text-falcon-500">
          Here&apos;s how your attention was distributed this week.
        </p>
      </div>

      <div className="bg-falcon-50 rounded-lg p-4">
        <AlignmentBars stats={valueStats} />
      </div>

      <div className="space-y-3">
        <Label className="text-falcon-800">
          Is this allocation what you want right now?
        </Label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSatisfied(true)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
              satisfied === true
                ? "border-falcon-600 bg-falcon-600/5 text-falcon-800"
                : "border-falcon-100 text-falcon-500 hover:border-falcon-200"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setSatisfied(false)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
              satisfied === false
                ? "border-falcon-600 bg-falcon-600/5 text-falcon-800"
                : "border-falcon-100 text-falcon-500 hover:border-falcon-200"
            }`}
          >
            No
          </button>
        </div>
      </div>

      <Button
        onClick={() => {
          if (satisfied !== null) onComplete(satisfied);
        }}
        disabled={satisfied === null}
        className="w-full bg-falcon-600 hover:bg-falcon-700 text-falcon-50"
      >
        Continue
      </Button>
    </div>
  );
}
