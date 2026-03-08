"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ValuePill } from "@/components/values/ValuePill";
import { getValueColor } from "@/lib/utils/colors";
import type { Value } from "@/lib/data/interface";

interface CommitStepProps {
  values: Value[];
  onComplete: (focusValueId: string, commitment: string) => void;
  saving?: boolean;
}

export function CommitStep({ values, onComplete, saving }: CommitStepProps) {
  const [focusValueId, setFocusValueId] = useState<string | null>(null);
  const [commitment, setCommitment] = useState("");

  const canSubmit = focusValueId !== null && commitment.trim().length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-3">
        <Label className="text-falcon-800">
          Which value do you want to invest in more this coming week?
        </Label>
        <div className="flex flex-wrap gap-2">
          {values.map((v, i) => (
            <ValuePill
              key={v.id}
              label={v.label}
              color={getValueColor(i)}
              selected={focusValueId === v.id}
              onClick={() => setFocusValueId(v.id)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-falcon-800">
          What&apos;s one specific thing you&apos;ll do?
        </Label>
        <Textarea
          value={commitment}
          onChange={(e) => setCommitment(e.target.value)}
          placeholder="Be specific — 'Run Tuesday and Thursday at 7am' not 'exercise more'."
          className="resize-none bg-white"
          rows={3}
        />
      </div>

      <Button
        onClick={() => {
          if (canSubmit && focusValueId) {
            onComplete(focusValueId, commitment.trim());
          }
        }}
        disabled={!canSubmit || saving}
        className="w-full bg-falcon-600 hover:bg-falcon-700 text-falcon-50"
      >
        {saving ? "Saving..." : "Complete review"}
      </Button>
    </div>
  );
}
