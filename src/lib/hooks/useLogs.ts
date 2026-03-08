"use client";

import { useState, useEffect, useCallback } from "react";
import type { BehaviorLog } from "../data/interface";
import { getDataService } from "../data/indexeddb";
import { getWeekStart, getWeekEnd } from "../utils/dates";

export function useLogs(startDate: Date, endDate: Date) {
  const [logs, setLogs] = useState<BehaviorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const ds = getDataService();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ds.getLogs(startDate, endDate);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }, [ds, startDate.getTime(), endDate.getTime()]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createLog = useCallback(
    async (log: Omit<BehaviorLog, "id">) => {
      const created = await ds.createLog(log);
      await refresh();
      return created;
    },
    [ds, refresh]
  );

  const updateLog = useCallback(
    async (id: string, updates: Partial<Omit<BehaviorLog, "id">>) => {
      await ds.updateLog(id, updates);
      await refresh();
    },
    [ds, refresh]
  );

  const deleteLog = useCallback(
    async (id: string) => {
      await ds.deleteLog(id);
      await refresh();
    },
    [ds, refresh]
  );

  return { logs, loading, refresh, createLog, updateLog, deleteLog };
}

export function useWeeklyLogs(weekDate: Date) {
  const start = getWeekStart(weekDate);
  const end = getWeekEnd(weekDate);
  return useLogs(start, end);
}

export function useTodayLogs() {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);
  return useLogs(start, end);
}
