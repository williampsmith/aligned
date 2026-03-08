"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickLogForm } from "@/components/logging/QuickLogForm";
import { LogFeed } from "@/components/logging/LogFeed";
import { useValues } from "@/lib/hooks/useValues";
import { useTodayLogs } from "@/lib/hooks/useLogs";
import { useSeasons } from "@/lib/hooks/useSeasons";
import { Separator } from "@/components/ui/separator";

export default function LogPage() {
  const { values, loading: valuesLoading } = useValues();
  const { logs, loading: logsLoading, createLog, deleteLog } = useTodayLogs();
  const { activeSeason } = useSeasons();

  const loading = valuesLoading || logsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-falcon-300 border-t-falcon-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h1 className="text-xl font-medium text-falcon-950">Log a behavior</h1>

      <Card>
        <CardContent className="pt-6">
          <QuickLogForm
            values={values}
            activeSeason={activeSeason}
            onSubmit={createLog}
          />
        </CardContent>
      </Card>

      <Separator className="bg-falcon-100" />

      <div>
        <h2 className="text-sm font-medium text-falcon-800 mb-3">Today&apos;s logs</h2>
        <LogFeed logs={logs} values={values} onDelete={deleteLog} />
      </div>
    </div>
  );
}
