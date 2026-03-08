"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { TradeoffScenario } from "@/lib/data/interface";

interface ScenarioCardProps {
  scenario: TradeoffScenario;
  index: number;
  total: number;
  onAnswer: (choice: "A" | "B", reasoning: string) => void;
}

export function ScenarioCard({ scenario, index, total, onAnswer }: ScenarioCardProps) {
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const [reasoning, setReasoning] = useState("");

  const canSubmit = selected !== null && reasoning.trim().length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-falcon-400">
          {index + 1} of {total}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i <= index ? "bg-falcon-600" : "bg-falcon-200"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="text-lg text-falcon-950 leading-relaxed">
        {scenario.scenarioText}
      </p>

      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => setSelected("A")}
          className={`text-left p-4 rounded-lg border-2 transition-all ${
            selected === "A"
              ? "border-falcon-600 bg-falcon-600/5"
              : "border-falcon-100 hover:border-falcon-200 bg-white"
          }`}
        >
          <span className="text-sm text-falcon-800">{scenario.choiceA}</span>
        </button>
        <button
          type="button"
          onClick={() => setSelected("B")}
          className={`text-left p-4 rounded-lg border-2 transition-all ${
            selected === "B"
              ? "border-falcon-600 bg-falcon-600/5"
              : "border-falcon-100 hover:border-falcon-200 bg-white"
          }`}
        >
          <span className="text-sm text-falcon-800">{scenario.choiceB}</span>
        </button>
      </div>

      {selected && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <label className="text-sm text-falcon-800 font-medium">
            Why did you choose this?
          </label>
          <Textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="A sentence or two about what mattered to you here..."
            className="resize-none bg-white"
            rows={2}
          />
        </div>
      )}

      <Button
        onClick={() => {
          if (selected && canSubmit) {
            onAnswer(selected, reasoning.trim());
            setSelected(null);
            setReasoning("");
          }
        }}
        disabled={!canSubmit}
        className="w-full bg-falcon-600 hover:bg-falcon-700 text-falcon-50"
      >
        Continue
      </Button>
    </div>
  );
}
