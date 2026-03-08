import type { BehaviorLog, Value } from "../data/interface";

export interface ValueStats {
  valueId: string;
  label: string;
  rank: number;
  investments: number;
  sacrifices: number;
  net: number;
}

export interface WeeklyStats {
  totalLogs: number;
  intentionalCount: number;
  intentionalityPercent: number;
  valueStats: ValueStats[];
  mostInvested: string | null;
  mostSacrificed: string | null;
  defaultSacrificeCallout: string | null;
}

export function computeWeeklyStats(
  logs: BehaviorLog[],
  values: Value[]
): WeeklyStats {
  const investmentCount: Record<string, number> = {};
  const sacrificeCount: Record<string, number> = {};
  let intentionalCount = 0;

  for (const v of values) {
    investmentCount[v.id] = 0;
    sacrificeCount[v.id] = 0;
  }

  for (const log of logs) {
    if (investmentCount[log.valueServed] !== undefined) {
      investmentCount[log.valueServed]++;
    }
    if (log.valueCost && sacrificeCount[log.valueCost] !== undefined) {
      sacrificeCount[log.valueCost]++;
    }
    if (log.intentional) {
      intentionalCount++;
    }
  }

  const valueStats: ValueStats[] = values
    .sort((a, b) => a.rank - b.rank)
    .map((v) => ({
      valueId: v.id,
      label: v.label,
      rank: v.rank,
      investments: investmentCount[v.id] || 0,
      sacrifices: sacrificeCount[v.id] || 0,
      net: (investmentCount[v.id] || 0) - (sacrificeCount[v.id] || 0),
    }));

  let mostInvested: string | null = null;
  let mostSacrificed: string | null = null;
  let maxInvestment = 0;
  let maxSacrifice = 0;

  for (const stat of valueStats) {
    if (stat.investments > maxInvestment) {
      maxInvestment = stat.investments;
      mostInvested = stat.label;
    }
    if (stat.sacrifices > maxSacrifice) {
      maxSacrifice = stat.sacrifices;
      mostSacrificed = stat.label;
    }
  }

  const defaultSacrificeCallout =
    maxSacrifice >= 3 && mostSacrificed
      ? `${mostSacrificed} has been frequently deprioritized this week.`
      : null;

  return {
    totalLogs: logs.length,
    intentionalCount,
    intentionalityPercent:
      logs.length > 0 ? Math.round((intentionalCount / logs.length) * 100) : 0,
    valueStats,
    mostInvested,
    mostSacrificed,
    defaultSacrificeCallout,
  };
}
