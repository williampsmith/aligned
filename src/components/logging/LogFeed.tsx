"use client";

import { Trash2, Pencil } from "lucide-react";
import type { BehaviorLog, Value } from "@/lib/data/interface";
import { getValueColor, getContrastText } from "@/lib/utils/colors";
import { formatTime } from "@/lib/utils/dates";

interface LogFeedProps {
  logs: BehaviorLog[];
  values: Value[];
  onDelete: (id: string) => void;
  onEdit?: (log: BehaviorLog) => void;
}

export function LogFeed({ logs, values, onDelete, onEdit }: LogFeedProps) {
  const valueMap = new Map(values.map((v, i) => [v.id, { ...v, color: getValueColor(i) }]));

  if (logs.length === 0) {
    return (
      <p className="text-sm text-falcon-500 text-center py-8">
        No behaviors logged today. Use the form above to start.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => {
        const served = valueMap.get(log.valueServed);
        const cost = log.valueCost ? valueMap.get(log.valueCost) : null;

        return (
          <div
            key={log.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-white border border-falcon-100 group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-falcon-950">{log.description}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {served && (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: served.color,
                      color: getContrastText(served.color),
                    }}
                  >
                    {served.label}
                  </span>
                )}
                {cost && (
                  <span className="text-xs text-falcon-500">
                    at the cost of{" "}
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${cost.color}22`,
                        color: cost.color,
                        border: `1px dashed ${cost.color}66`,
                      }}
                    >
                      {cost.label}
                    </span>
                  </span>
                )}
                {!log.intentional && (
                  <span className="text-xs text-falcon-400 italic">unintentional</span>
                )}
                <span className="text-xs text-falcon-400 ml-auto">
                  {formatTime(new Date(log.timestamp))}
                </span>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={() => onEdit(log)}
                  className="p-1.5 rounded hover:bg-falcon-100 text-falcon-400 hover:text-falcon-700 transition-colors"
                  aria-label="Edit log"
                >
                  <Pencil size={14} />
                </button>
              )}
              <button
                onClick={() => onDelete(log.id)}
                className="p-1.5 rounded hover:bg-falcon-100 text-falcon-400 hover:text-falcon-700 transition-colors"
                aria-label="Delete log"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
