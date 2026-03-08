"use client";

import { useState, useEffect, useCallback } from "react";
import type { Season } from "../data/interface";
import { getDataService } from "../data/indexeddb";

export function useSeasons() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | undefined>();
  const [loading, setLoading] = useState(true);
  const ds = getDataService();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [all, active] = await Promise.all([
        ds.getSeasons(),
        ds.getActiveSeason(),
      ]);
      setSeasons(all);
      setActiveSeason(active);
    } finally {
      setLoading(false);
    }
  }, [ds]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createSeason = useCallback(
    async (season: Omit<Season, "id">) => {
      const created = await ds.createSeason(season);
      await refresh();
      return created;
    },
    [ds, refresh]
  );

  const updateSeason = useCallback(
    async (id: string, updates: Partial<Omit<Season, "id">>) => {
      await ds.updateSeason(id, updates);
      await refresh();
    },
    [ds, refresh]
  );

  const endSeason = useCallback(
    async (id: string) => {
      await ds.endSeason(id);
      await refresh();
    },
    [ds, refresh]
  );

  return { seasons, activeSeason, loading, refresh, createSeason, updateSeason, endSeason };
}
