"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ValueRanker } from "@/components/values/ValueRanker";
import { useValues } from "@/lib/hooks/useValues";
import { useSeasons } from "@/lib/hooks/useSeasons";
import { getDataService } from "@/lib/data/indexeddb";
import { Download, RefreshCw, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { VALUE_CATALOG } from "@/lib/data/scenarios";
import type { Season } from "@/lib/data/interface";

export default function SettingsPage() {
  const router = useRouter();
  const { values, loading: valuesLoading, reorderValues, updateValue, deleteValue } = useValues();
  const { seasons, activeSeason, createSeason, endSeason, loading: seasonsLoading } = useSeasons();

  const [newSeasonLabel, setNewSeasonLabel] = useState("");
  const [newSeasonDesc, setNewSeasonDesc] = useState("");
  const [showNewSeason, setShowNewSeason] = useState(false);

  const handleExport = useCallback(async () => {
    const ds = getDataService();
    const data = await ds.exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aligned-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Exported", { description: "Your data has been downloaded." });
  }, []);

  const handleCreateSeason = useCallback(async () => {
    if (!newSeasonLabel.trim()) return;
    await createSeason({
      label: newSeasonLabel.trim(),
      description: newSeasonDesc.trim(),
      valueWeights: {},
      startDate: new Date(),
      endDate: null,
      active: true,
    });
    setNewSeasonLabel("");
    setNewSeasonDesc("");
    setShowNewSeason(false);
    toast("Season started", { description: `${newSeasonLabel.trim()} is now active.` });
  }, [newSeasonLabel, newSeasonDesc, createSeason]);

  const rankerValues = values.map((v) => {
    const catalog = VALUE_CATALOG.find((c) => c.label === v.label);
    return {
      key: v.id,
      label: v.label,
      placeholder: catalog?.placeholder ?? "",
      score: 0,
      definition: v.definition,
    };
  });

  const handleRankerChange = useCallback(
    async (updated: typeof rankerValues) => {
      const orderedIds = updated.map((v) => v.key);
      await reorderValues(orderedIds);
      for (const v of updated) {
        const original = values.find((val) => val.id === v.key);
        if (original && original.definition !== v.definition) {
          await updateValue(v.key, { definition: v.definition });
        }
      }
    },
    [values, reorderValues, updateValue]
  );

  const loading = valuesLoading || seasonsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-falcon-300 border-t-falcon-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h1 className="text-xl font-medium text-falcon-950">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-falcon-800">
            Value Stack
          </CardTitle>
          <CardDescription className="text-falcon-500">
            Drag to reorder your priorities. Edit definitions inline.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ValueRanker
            derivedValues={rankerValues}
            onChange={handleRankerChange}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/discover")}
              className="text-falcon-600 border-falcon-200 hover:bg-falcon-50"
            >
              <RefreshCw size={14} className="mr-2" />
              Recalibrate values
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-falcon-800">
            Life Seasons
          </CardTitle>
          <CardDescription className="text-falcon-500">
            Declare a season to contextualize your priorities during a specific
            life chapter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSeason && (
            <div className="flex items-center justify-between p-3 bg-falcon-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-falcon-950">
                  {activeSeason.label}
                </p>
                {activeSeason.description && (
                  <p className="text-xs text-falcon-500 mt-0.5">
                    {activeSeason.description}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => endSeason(activeSeason.id)}
                className="text-falcon-500 hover:text-falcon-700"
              >
                End season
              </Button>
            </div>
          )}

          {!showNewSeason ? (
            <Button
              variant="outline"
              onClick={() => setShowNewSeason(true)}
              className="text-falcon-600 border-falcon-200 hover:bg-falcon-50"
            >
              <Plus size={14} className="mr-2" />
              Start new season
            </Button>
          ) : (
            <div className="space-y-3 p-4 border border-falcon-200 rounded-lg">
              <div className="flex justify-between">
                <Label className="text-falcon-800">New Season</Label>
                <button
                  onClick={() => setShowNewSeason(false)}
                  className="text-falcon-400 hover:text-falcon-600"
                >
                  <X size={14} />
                </button>
              </div>
              <Input
                value={newSeasonLabel}
                onChange={(e) => setNewSeasonLabel(e.target.value)}
                placeholder="Season name (e.g., 'New job ramp-up')"
                className="bg-white"
              />
              <Textarea
                value={newSeasonDesc}
                onChange={(e) => setNewSeasonDesc(e.target.value)}
                placeholder="What's this season about?"
                className="resize-none bg-white"
                rows={2}
              />
              <Button
                onClick={handleCreateSeason}
                disabled={!newSeasonLabel.trim()}
                className="bg-falcon-600 hover:bg-falcon-700 text-falcon-50"
              >
                Start season
              </Button>
            </div>
          )}

          {seasons.filter((s) => !s.active).length > 0 && (
            <>
              <Separator className="bg-falcon-100" />
              <div className="space-y-2">
                <p className="text-xs text-falcon-400">Past seasons</p>
                {seasons
                  .filter((s) => !s.active)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm text-falcon-600">{s.label}</span>
                      <span className="text-xs text-falcon-400">
                        {new Date(s.startDate).toLocaleDateString()}
                        {s.endDate &&
                          ` – ${new Date(s.endDate).toLocaleDateString()}`}
                      </span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-falcon-800">
            Data
          </CardTitle>
          <CardDescription className="text-falcon-500">
            Your data stays on this device. Export it anytime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleExport}
            className="text-falcon-600 border-falcon-200 hover:bg-falcon-50"
          >
            <Download size={14} className="mr-2" />
            Export all data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
