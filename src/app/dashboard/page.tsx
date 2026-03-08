"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeekSelector } from "@/components/dashboard/WeekSelector";
import { IntentionalityArc } from "@/components/dashboard/IntentionalityArc";
import { AlignmentBars } from "@/components/dashboard/AlignmentBars";
import { SummaryStats } from "@/components/dashboard/SummaryStats";
import { useValues } from "@/lib/hooks/useValues";
import { useWeeklyLogs } from "@/lib/hooks/useLogs";
import { useSeasons } from "@/lib/hooks/useSeasons";
import { computeWeeklyStats } from "@/lib/utils/stats";
import { daysBetween } from "@/lib/utils/dates";
import { Info } from "lucide-react";

export default function DashboardPage() {
  const [weekDate, setWeekDate] = useState(new Date());
  const { values, loading: valuesLoading } = useValues();
  const { logs, loading: logsLoading } = useWeeklyLogs(weekDate);
  const { activeSeason } = useSeasons();

  const stats = useMemo(
    () => computeWeeklyStats(logs, values),
    [logs, values]
  );

  const loading = valuesLoading || logsLoading;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {activeSeason && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-falcon-100">
          <Info size={14} className="text-falcon-400" />
          <span className="text-sm text-falcon-600">
            Current season: <span className="font-medium">{activeSeason.label}</span>
            {" — "}
            {daysBetween(new Date(activeSeason.startDate), new Date())} days in
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-falcon-950">Dashboard</h1>
        <WeekSelector currentDate={weekDate} onChange={setWeekDate} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-falcon-300 border-t-falcon-600 rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-falcon-500">
              No behaviors logged this week. Tap the + button to start.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-falcon-800">
                  Intentionality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IntentionalityArc
                  percent={stats.intentionalityPercent}
                  totalLogs={stats.totalLogs}
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-falcon-800">
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SummaryStats stats={stats} />
              </CardContent>
            </Card>
          </div>

          {stats.defaultSacrificeCallout && (
            <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-falcon-200">
              <Info size={14} className="text-falcon-400 shrink-0" />
              <p className="text-sm text-falcon-600">
                {stats.defaultSacrificeCallout}
              </p>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-falcon-800">
                Value Alignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AlignmentBars stats={stats.valueStats} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
