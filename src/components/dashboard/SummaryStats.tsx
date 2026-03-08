"use client";

import type { WeeklyStats } from "@/lib/utils/stats";

interface SummaryStatsProps {
  stats: WeeklyStats;
}

export function SummaryStats({ stats }: SummaryStatsProps) {
  const items = [
    { label: "Total logs", value: stats.totalLogs.toString() },
    { label: "Most invested", value: stats.mostInvested ?? "—" },
    { label: "Most sacrificed", value: stats.mostSacrificed ?? "—" },
    { label: "Intentionality", value: `${stats.intentionalityPercent}%` },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-lg border border-falcon-100 p-4"
        >
          <p className="text-xs text-falcon-500">{item.label}</p>
          <p className="text-lg font-medium text-falcon-950 mt-1">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
