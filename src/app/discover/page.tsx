"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScenarioCard } from "@/components/values/ScenarioCard";
import { ValueRanker } from "@/components/values/ValueRanker";
import { VALUE_CATALOG, selectRandomScenarios } from "@/lib/data/scenarios";
import { getDataService } from "@/lib/data/indexeddb";

type Phase = "intro" | "scenarios" | "results" | "define";

interface DerivedValue {
  key: string;
  label: string;
  placeholder: string;
  score: number;
  definition: string;
}

export default function DiscoverPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [derivedValues, setDerivedValues] = useState<DerivedValue[]>([]);
  const [saving, setSaving] = useState(false);

  const scenarios = useMemo(() => selectRandomScenarios(13), []);

  const handleAnswer = useCallback(
    (choice: "A" | "B", _reasoning: string) => {
      const scenario = scenarios[scenarioIndex];
      const chosenValue = choice === "A" ? scenario.valueA : scenario.valueB;

      setScores((prev) => ({
        ...prev,
        [chosenValue]: (prev[chosenValue] || 0) + 1,
      }));

      if (scenarioIndex + 1 < scenarios.length) {
        setScenarioIndex((i) => i + 1);
      } else {
        const newScores = { ...scores, [chosenValue]: (scores[chosenValue] || 0) + 1 };
        const sorted = Object.entries(newScores)
          .sort(([, a], [, b]) => b - a)
          .filter(([, score]) => score >= 1)
          .slice(0, 7);

        const derived: DerivedValue[] = sorted.map(([key, score]) => {
          const catalog = VALUE_CATALOG.find((v) => v.key === key);
          return {
            key,
            label: catalog?.label ?? key,
            placeholder: catalog?.placeholder ?? "",
            score,
            definition: "",
          };
        });

        setDerivedValues(derived);
        setPhase("results");
      }
    },
    [scenarioIndex, scenarios, scores]
  );

  const handleSave = useCallback(async () => {
    const incomplete = derivedValues.some((v) => v.definition.trim().length === 0);
    if (incomplete) return;

    setSaving(true);
    try {
      const ds = getDataService();
      for (let i = 0; i < derivedValues.length; i++) {
        const v = derivedValues[i];
        await ds.createValue({
          label: v.label,
          definition: v.definition.trim(),
          rank: i + 1,
        });
      }
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }, [derivedValues, router]);

  const allDefined = derivedValues.every((v) => v.definition.trim().length > 0);

  if (phase === "intro") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-falcon-50 px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="py-12 px-8 text-center space-y-6">
            <h1 className="text-2xl font-medium text-falcon-950">
              Discover your values
            </h1>
            <p className="text-falcon-600 leading-relaxed">
              You&apos;ll answer {scenarios.length} quick scenarios — realistic
              dilemmas with no right answer. Your choices reveal what actually
              matters to you, not what you think should matter.
            </p>
            <p className="text-sm text-falcon-400">Takes about 5 minutes.</p>
            <Button
              onClick={() => setPhase("scenarios")}
              className="bg-falcon-600 hover:bg-falcon-700 text-falcon-50 px-8"
            >
              Begin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === "scenarios") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-falcon-50 px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="py-8 px-6">
            <ScenarioCard
              scenario={scenarios[scenarioIndex]}
              index={scenarioIndex}
              total={scenarios.length}
              onAnswer={handleAnswer}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-falcon-50 px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="py-8 px-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-medium text-falcon-950">
                Your values
              </h2>
              <p className="text-sm text-falcon-500">
                Based on your choices, these are the values that showed up most.
                Reorder them to reflect your priorities, then define each one in
                your own words.
              </p>
            </div>
            <Button
              onClick={() => setPhase("define")}
              className="w-full bg-falcon-600 hover:bg-falcon-700 text-falcon-50"
            >
              Define &amp; rank my values
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-falcon-50 px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-medium text-falcon-950">
            Define your values
          </h2>
          <p className="text-sm text-falcon-500">
            Drag to reorder. Write a personal definition for each — what does
            this value mean in <em>your</em> life?
          </p>
        </div>

        <ValueRanker derivedValues={derivedValues} onChange={setDerivedValues} />

        <Button
          onClick={handleSave}
          disabled={!allDefined || saving}
          className="w-full bg-falcon-600 hover:bg-falcon-700 text-falcon-50"
        >
          {saving ? "Saving..." : "Save values & start"}
        </Button>
      </div>
    </div>
  );
}
