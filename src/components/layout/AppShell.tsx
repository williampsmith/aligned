"use client";

import { useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { FloatingActionButton } from "./FloatingActionButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { QuickLogForm } from "@/components/logging/QuickLogForm";
import { useValues, useHasValues } from "@/lib/hooks/useValues";
import { useSeasons } from "@/lib/hooks/useSeasons";
import { getDataService } from "@/lib/data/indexeddb";
import { seedDatabase } from "@/lib/data/seed";
import { isSunday, daysBetween, getWeekStart } from "@/lib/utils/dates";
import { useEffect, useMemo } from "react";

const NO_SHELL_PATHS = ["/discover"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hasValues = useHasValues(pathname);
  const { values } = useValues();
  const { activeSeason } = useSeasons();
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reviewNudge, setReviewNudge] = useState(false);
  const [seedReady, setSeedReady] = useState(
    process.env.NEXT_PUBLIC_SEED !== "true"
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SEED === "true") {
      seedDatabase().then(() => setSeedReady(true));
    }
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (seedReady && hasValues === false && pathname !== "/discover") {
      router.replace("/discover");
    }
  }, [seedReady, hasValues, pathname, router]);

  useEffect(() => {
    if (isSunday()) {
      const ds = getDataService();
      ds.getReviewForWeek(getWeekStart(new Date())).then((r) => {
        setReviewNudge(!r);
      });
    }
  }, []);

  const seasonInfo = useMemo(() => {
    if (!activeSeason) return { label: null, days: null };
    return {
      label: activeSeason.label,
      days: daysBetween(new Date(activeSeason.startDate), new Date()),
    };
  }, [activeSeason]);

  const handleLogSubmit = useCallback(
    async (log: Parameters<typeof getDataService>["length"] extends 0 ? never : never) => {
      const ds = getDataService();
      await ds.createLog(log as never);
    },
    []
  );

  const showShell = !NO_SHELL_PATHS.includes(pathname);

  if (!showShell) {
    return <>{children}</>;
  }

  if (!seedReady || hasValues === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-falcon-50">
        <div className="w-6 h-6 border-2 border-falcon-300 border-t-falcon-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-falcon-50">
      <Sidebar
        seasonLabel={seasonInfo.label}
        seasonDays={seasonInfo.days}
        reviewNudge={reviewNudge}
      />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <MobileNav reviewNudge={reviewNudge} />
      <FloatingActionButton onClick={() => setQuickLogOpen(true)} />

      {isMobile ? (
        <Sheet open={quickLogOpen} onOpenChange={setQuickLogOpen}>
          <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-falcon-950">Quick Log</SheetTitle>
            </SheetHeader>
            <div className="pt-4">
              <QuickLogForm
                values={values}
                activeSeason={activeSeason}
                onSubmit={async (log) => {
                  const ds = getDataService();
                  await ds.createLog(log);
                }}
                onDone={() => setQuickLogOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={quickLogOpen} onOpenChange={setQuickLogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-falcon-950">Quick Log</DialogTitle>
            </DialogHeader>
            <QuickLogForm
              values={values}
              activeSeason={activeSeason}
              onSubmit={async (log) => {
                const ds = getDataService();
                await ds.createLog(log);
              }}
              onDone={() => setQuickLogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
