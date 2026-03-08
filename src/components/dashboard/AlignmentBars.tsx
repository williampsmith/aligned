"use client";

import type { ValueStats } from "@/lib/utils/stats";

interface AlignmentBarsProps {
  stats: ValueStats[];
}

export function AlignmentBars({ stats }: AlignmentBarsProps) {
  const maxCount = Math.max(
    1,
    ...stats.map((s) => Math.max(s.investments, s.sacrifices))
  );

  if (stats.length === 0) {
    return (
      <p className="text-sm text-falcon-500 text-center py-6">
        No values to display.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {stats.map((stat) => (
        <div key={stat.valueId} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-falcon-800">
              {stat.label}
            </span>
            <span className="text-xs font-medium text-falcon-600 tabular-nums">
              {stat.net > 0 ? "+" : ""}
              {stat.net}
            </span>
          </div>

          {/* Investment bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-falcon-400 w-16 text-right">Invested</span>
            <div className="flex-1 h-5 bg-falcon-50 rounded overflow-hidden">
              <div
                className="h-full bg-falcon-400 rounded transition-all duration-500"
                style={{
                  width: `${(stat.investments / maxCount) * 100}%`,
                  minWidth: stat.investments > 0 ? "8px" : "0",
                }}
              />
            </div>
            <span className="text-xs text-falcon-500 w-6 text-right tabular-nums">
              {stat.investments}
            </span>
          </div>

          {/* Sacrifice bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-falcon-400 w-16 text-right">Cost</span>
            <div className="flex-1 h-5 bg-falcon-50 rounded overflow-hidden">
              <div
                className="h-full bg-falcon-200 rounded border border-dashed border-falcon-300 transition-all duration-500"
                style={{
                  width: `${(stat.sacrifices / maxCount) * 100}%`,
                  minWidth: stat.sacrifices > 0 ? "8px" : "0",
                }}
              />
            </div>
            <span className="text-xs text-falcon-500 w-6 text-right tabular-nums">
              {stat.sacrifices}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
