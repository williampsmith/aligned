"use client";

import { useState, useEffect, useCallback } from "react";
import type { WeeklyReview } from "../data/interface";
import { getDataService } from "../data/indexeddb";
import { getWeekStart } from "../utils/dates";

export function useReviews() {
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const ds = getDataService();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ds.getReviews();
      setReviews(data);
    } finally {
      setLoading(false);
    }
  }, [ds]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { reviews, loading, refresh };
}

export function useCurrentWeekReview() {
  const [review, setReview] = useState<WeeklyReview | undefined>();
  const [previousReview, setPreviousReview] = useState<WeeklyReview | undefined>();
  const [loading, setLoading] = useState(true);
  const ds = getDataService();

  const weekStart = getWeekStart(new Date());

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [current, prev] = await Promise.all([
        ds.getReviewForWeek(weekStart),
        ds.getPreviousReview(weekStart),
      ]);
      setReview(current);
      setPreviousReview(prev);
    } finally {
      setLoading(false);
    }
  }, [ds]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createReview = useCallback(
    async (data: Omit<WeeklyReview, "id" | "createdAt">) => {
      const created = await ds.createReview(data);
      await refresh();
      return created;
    },
    [ds, refresh]
  );

  const updateReview = useCallback(
    async (id: string, updates: Partial<Omit<WeeklyReview, "id" | "createdAt">>) => {
      await ds.updateReview(id, updates);
      await refresh();
    },
    [ds, refresh]
  );

  return { review, previousReview, loading, refresh, createReview, updateReview };
}
