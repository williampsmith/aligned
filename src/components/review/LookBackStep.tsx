"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { WeeklyReview } from "@/lib/data/interface";

interface LookBackStepProps {
  previousReview: WeeklyReview;
  onComplete: (data: {
    commitmentMet: boolean | null;
    enabler: string | null;
    obstacle: string | null;
    obstacleCategory: string | null;
  }) => void;
}

const OBSTACLE_CATEGORIES = [
  { value: "energy", label: "Energy" },
  { value: "time", label: "Time" },
  { value: "social_pressure", label: "Social Pressure" },
  { value: "emotional_state", label: "Emotional State" },
  { value: "logistical", label: "Logistical" },
];

export function LookBackStep({ previousReview, onComplete }: LookBackStepProps) {
  const [commitmentMet, setCommitmentMet] = useState<"yes" | "partially" | "no" | null>(null);
  const [enabler, setEnabler] = useState("");
  const [obstacle, setObstacle] = useState("");
  const [obstacleCategory, setObstacleCategory] = useState<string | null>(null);

  const showEnabler = commitmentMet === "yes" || commitmentMet === "partially";
  const showObstacle = commitmentMet === "partially" || commitmentMet === "no";
  const canContinue =
    commitmentMet !== null &&
    (!showEnabler || enabler.trim().length > 0) &&
    (!showObstacle || (obstacle.trim().length > 0 && obstacleCategory !== null));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <p className="text-sm text-falcon-500">Last week&apos;s commitment:</p>
        <p className="text-falcon-950 font-medium bg-falcon-50 p-3 rounded-lg">
          &ldquo;{previousReview.commitment}&rdquo;
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-falcon-800">Did you follow through?</Label>
        <div className="flex gap-2">
          {(["yes", "partially", "no"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCommitmentMet(option)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-2 transition-all capitalize ${
                commitmentMet === option
                  ? "border-falcon-600 bg-falcon-600/5 text-falcon-800"
                  : "border-falcon-100 text-falcon-500 hover:border-falcon-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {showEnabler && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <Label className="text-falcon-800">What helped?</Label>
          <Textarea
            value={enabler}
            onChange={(e) => setEnabler(e.target.value)}
            placeholder="What made it possible to follow through?"
            className="resize-none bg-white"
            rows={2}
          />
        </div>
      )}

      {showObstacle && (
        <>
          <div className="space-y-2 animate-in fade-in duration-200">
            <Label className="text-falcon-800">What got in the way?</Label>
            <Textarea
              value={obstacle}
              onChange={(e) => setObstacle(e.target.value)}
              placeholder="What prevented you from following through?"
              className="resize-none bg-white"
              rows={2}
            />
          </div>
          <div className="space-y-2 animate-in fade-in duration-200">
            <Label className="text-falcon-800">What kind of obstacle?</Label>
            <div className="flex flex-wrap gap-2">
              {OBSTACLE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setObstacleCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    obstacleCategory === cat.value
                      ? "border-falcon-600 bg-falcon-600/5 text-falcon-800"
                      : "border-falcon-100 text-falcon-500 hover:border-falcon-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <Button
        onClick={() =>
          onComplete({
            commitmentMet:
              commitmentMet === "yes"
                ? true
                : commitmentMet === "no"
                  ? false
                  : null,
            enabler: showEnabler ? enabler.trim() : null,
            obstacle: showObstacle ? obstacle.trim() : null,
            obstacleCategory: showObstacle ? obstacleCategory : null,
          })
        }
        disabled={!canContinue}
        className="w-full bg-falcon-600 hover:bg-falcon-700 text-falcon-50"
      >
        Continue
      </Button>
    </div>
  );
}
