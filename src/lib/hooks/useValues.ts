"use client";

import { useState, useEffect, useCallback } from "react";
import type { Value } from "../data/interface";
import { getDataService } from "../data/indexeddb";

export function useValues() {
  const [values, setValues] = useState<Value[]>([]);
  const [loading, setLoading] = useState(true);
  const ds = getDataService();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ds.getValues();
      setValues(data);
    } finally {
      setLoading(false);
    }
  }, [ds]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createValue = useCallback(
    async (value: Omit<Value, "id" | "createdAt" | "updatedAt">) => {
      const created = await ds.createValue(value);
      await refresh();
      return created;
    },
    [ds, refresh]
  );

  const updateValue = useCallback(
    async (id: string, updates: Partial<Omit<Value, "id" | "createdAt">>) => {
      await ds.updateValue(id, updates);
      await refresh();
    },
    [ds, refresh]
  );

  const deleteValue = useCallback(
    async (id: string) => {
      await ds.deleteValue(id);
      await refresh();
    },
    [ds, refresh]
  );

  const reorderValues = useCallback(
    async (orderedIds: string[]) => {
      await ds.reorderValues(orderedIds);
      await refresh();
    },
    [ds, refresh]
  );

  return { values, loading, refresh, createValue, updateValue, deleteValue, reorderValues };
}

export function useHasValues(refreshKey?: unknown) {
  const [hasValues, setHasValues] = useState<boolean | null>(null);
  const ds = getDataService();

  useEffect(() => {
    ds.hasValues().then(setHasValues);
  }, [ds, refreshKey]);

  return hasValues;
}
