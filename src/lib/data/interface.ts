export interface Value {
  id: string;
  label: string;
  definition: string;
  rank: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BehaviorLog {
  id: string;
  description: string;
  valueServed: string;
  valueCost: string | null;
  intentional: boolean;
  timestamp: Date;
  seasonId: string | null;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: Date;
  satisfiedWithAllocation: boolean | null;
  focusValueId: string;
  commitment: string;
  commitmentMet: boolean | null;
  enabler: string | null;
  obstacle: string | null;
  obstacleCategory: string | null;
  createdAt: Date;
}

export interface Season {
  id: string;
  label: string;
  description: string;
  valueWeights: Record<string, number>;
  startDate: Date;
  endDate: Date | null;
  active: boolean;
}

export interface TradeoffScenario {
  id: string;
  scenarioText: string;
  choiceA: string;
  choiceB: string;
  valueA: string;
  valueB: string;
}

export interface DataService {
  // Values
  getValues(): Promise<Value[]>;
  getValue(id: string): Promise<Value | undefined>;
  createValue(value: Omit<Value, "id" | "createdAt" | "updatedAt">): Promise<Value>;
  updateValue(id: string, updates: Partial<Omit<Value, "id" | "createdAt">>): Promise<void>;
  deleteValue(id: string): Promise<void>;
  reorderValues(orderedIds: string[]): Promise<void>;
  hasValues(): Promise<boolean>;

  // Behavior Logs
  getLogs(startDate: Date, endDate: Date): Promise<BehaviorLog[]>;
  getLogsByDate(date: Date): Promise<BehaviorLog[]>;
  createLog(log: Omit<BehaviorLog, "id">): Promise<BehaviorLog>;
  updateLog(id: string, updates: Partial<Omit<BehaviorLog, "id">>): Promise<void>;
  deleteLog(id: string): Promise<void>;

  // Weekly Reviews
  getReviews(): Promise<WeeklyReview[]>;
  getReviewForWeek(weekStartDate: Date): Promise<WeeklyReview | undefined>;
  getPreviousReview(weekStartDate: Date): Promise<WeeklyReview | undefined>;
  createReview(review: Omit<WeeklyReview, "id" | "createdAt">): Promise<WeeklyReview>;
  updateReview(id: string, updates: Partial<Omit<WeeklyReview, "id" | "createdAt">>): Promise<void>;

  // Seasons
  getSeasons(): Promise<Season[]>;
  getActiveSeason(): Promise<Season | undefined>;
  createSeason(season: Omit<Season, "id">): Promise<Season>;
  updateSeason(id: string, updates: Partial<Omit<Season, "id">>): Promise<void>;
  endSeason(id: string): Promise<void>;

  // Export
  exportAllData(): Promise<string>;
}
