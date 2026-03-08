"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface IntentionalityArcProps {
  percent: number;
  totalLogs: number;
}

export function IntentionalityArc({ percent, totalLogs }: IntentionalityArcProps) {
  const data = [
    { name: "Intentional", value: percent },
    { name: "Remaining", value: 100 - percent },
  ];

  if (totalLogs === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <div className="w-24 h-24 rounded-full border-4 border-falcon-100 flex items-center justify-center">
          <span className="text-sm text-falcon-400">—</span>
        </div>
        <p className="mt-3 text-sm text-falcon-500">No data yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius={40}
              outerRadius={56}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              <Cell fill="#7d5766" />
              <Cell fill="#e5d9dd" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-medium text-falcon-950">{percent}%</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-falcon-500">of decisions were intentional</p>
    </div>
  );
}
