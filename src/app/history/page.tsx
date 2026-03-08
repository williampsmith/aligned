"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h1 className="text-xl font-medium text-falcon-950">History</h1>
      <Card>
        <CardContent className="py-16 text-center space-y-3">
          <Clock size={32} className="mx-auto text-falcon-300" />
          <p className="text-falcon-600 font-medium">Coming soon</p>
          <p className="text-sm text-falcon-400 max-w-sm mx-auto">
            Historical trends and pattern recognition will appear here as you
            log more behaviors over time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
