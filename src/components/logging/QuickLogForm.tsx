"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ValuePill } from "@/components/values/ValuePill";
import type { Value, BehaviorLog } from "@/lib/data/interface";
import { getValueColor } from "@/lib/utils/colors";
import { toast } from "sonner";

interface QuickLogFormProps {
  values: Value[];
  activeSeason?: { id: string } | null;
  onSubmit: (log: Omit<BehaviorLog, "id">) => Promise<unknown>;
  onDone?: () => void;
}

export function QuickLogForm({ values, activeSeason, onSubmit, onDone }: QuickLogFormProps) {
  const [description, setDescription] = useState("");
  const [valueServed, setValueServed] = useState<string | null>(null);
  const [valueCost, setValueCost] = useState<string | null>(null);
  const [intentional, setIntentional] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = description.trim().length > 0 && valueServed !== null;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !valueServed) return;
    setSubmitting(true);
    try {
      await onSubmit({
        description: description.trim(),
        valueServed,
        valueCost,
        intentional,
        timestamp: new Date(),
        seasonId: activeSeason?.id ?? null,
      });
      setDescription("");
      setValueServed(null);
      setValueCost(null);
      setIntentional(true);
      toast("Logged", { description: "Behavior recorded." });
      onDone?.();
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, description, valueServed, valueCost, intentional, activeSeason, onSubmit, onDone]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="description" className="text-falcon-800">
          What did I do?
        </Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 200))}
          placeholder="Skipped gym to help Sarah move."
          maxLength={200}
          autoFocus
          className="bg-white"
        />
        <p className="text-xs text-falcon-500 text-right">{description.length}/200</p>
      </div>

      <div className="space-y-2">
        <Label className="text-falcon-800">Which value did this serve?</Label>
        <div className="flex flex-wrap gap-2">
          {values.map((v, i) => (
            <ValuePill
              key={v.id}
              label={v.label}
              color={getValueColor(i)}
              selected={valueServed === v.id}
              onClick={() => {
                setValueServed(valueServed === v.id ? null : v.id);
                if (valueCost === v.id) setValueCost(null);
              }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-falcon-800">Which value did this cost?</Label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setValueCost(null)}
            className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-all border ${
              valueCost === null
                ? "bg-falcon-200 text-falcon-800 border-falcon-300"
                : "bg-white text-falcon-500 border-falcon-100 hover:bg-falcon-50"
            }`}
          >
            No tradeoff
          </button>
          {values.map((v, i) => (
            <ValuePill
              key={v.id}
              label={v.label}
              color={getValueColor(i)}
              selected={valueCost === v.id}
              disabled={valueServed === v.id}
              onClick={() => setValueCost(valueCost === v.id ? null : v.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="intentional" className="text-falcon-800">
          Was this intentional?
        </Label>
        <Switch
          id="intentional"
          checked={intentional}
          onCheckedChange={setIntentional}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full bg-falcon-600 hover:bg-falcon-700 text-falcon-50"
      >
        {submitting ? "Saving..." : "Log behavior"}
      </Button>
    </div>
  );
}
