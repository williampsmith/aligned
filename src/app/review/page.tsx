"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewStepper } from "@/components/review/ReviewStepper";
import { LookBackStep } from "@/components/review/LookBackStep";
import { ReflectStep } from "@/components/review/ReflectStep";
import { CommitStep } from "@/components/review/CommitStep";
import { useValues } from "@/lib/hooks/useValues";
import { useWeeklyLogs } from "@/lib/hooks/useLogs";
import { useCurrentWeekReview } from "@/lib/hooks/useReviews";
import { computeWeeklyStats } from "@/lib/utils/stats";
import { getWeekStart } from "@/lib/utils/dates";

export default function ReviewPage() {
  const { values, loading: valuesLoading } = useValues();
  const { logs, loading: logsLoading } = useWeeklyLogs(new Date());
  const {
    review,
    previousReview,
    loading: reviewLoading,
    createReview,
    updateReview,
  } = useCurrentWeekReview();

  const [step, setStep] = useState(0);
  const [lookBackData, setLookBackData] = useState<{
    commitmentMet: boolean | null;
    enabler: string | null;
    obstacle: string | null;
    obstacleCategory: string | null;
  } | null>(null);
  const [satisfied, setSatisfied] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const stats = useMemo(
    () => computeWeeklyStats(logs, values),
    [logs, values]
  );

  const loading = valuesLoading || logsLoading || reviewLoading;

  const hasPreviousReview = !!previousReview;
  const steps = hasPreviousReview
    ? ["Look back", "Reflect", "Commit"]
    : ["Reflect", "Commit"];

  const handleLookBack = useCallback(
    (data: typeof lookBackData) => {
      setLookBackData(data);
      if (previousReview && data) {
        updateReview(previousReview.id, {
          commitmentMet: data.commitmentMet,
          enabler: data.enabler,
          obstacle: data.obstacle,
          obstacleCategory: data.obstacleCategory,
        });
      }
      setStep(1);
    },
    [previousReview, updateReview]
  );

  const handleReflect = useCallback(
    (isSatisfied: boolean) => {
      setSatisfied(isSatisfied);
      setStep(hasPreviousReview ? 2 : 1);
    },
    [hasPreviousReview]
  );

  const handleCommit = useCallback(
    async (focusValueId: string, commitment: string) => {
      setSaving(true);
      try {
        await createReview({
          weekStartDate: getWeekStart(new Date()),
          satisfiedWithAllocation: satisfied,
          focusValueId,
          commitment,
          commitmentMet: null,
          enabler: null,
          obstacle: null,
          obstacleCategory: null,
        });
        setDone(true);
      } finally {
        setSaving(false);
      }
    },
    [createReview, satisfied]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-falcon-300 border-t-falcon-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (review && !done) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <h1 className="text-xl font-medium text-falcon-950">Weekly Review</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-falcon-600">
              You&apos;ve already completed this week&apos;s review. See you next week.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <h1 className="text-xl font-medium text-falcon-950">Weekly Review</h1>
        <Card>
          <CardContent className="py-12 text-center space-y-2">
            <p className="text-lg text-falcon-950 font-medium">
              Review complete.
            </p>
            <p className="text-falcon-500">See you next week.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const effectiveStep = hasPreviousReview ? step : step;
  const renderStep = () => {
    if (hasPreviousReview && step === 0) {
      return (
        <LookBackStep
          previousReview={previousReview!}
          onComplete={handleLookBack}
        />
      );
    }
    if ((hasPreviousReview && step === 1) || (!hasPreviousReview && step === 0)) {
      return (
        <ReflectStep
          valueStats={stats.valueStats}
          onComplete={handleReflect}
        />
      );
    }
    return (
      <CommitStep
        values={values}
        onComplete={handleCommit}
        saving={saving}
      />
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h1 className="text-xl font-medium text-falcon-950">Weekly Review</h1>

      <Card>
        <CardContent className="pt-6 space-y-8">
          <ReviewStepper steps={steps} currentStep={effectiveStep} />
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
}
