import Dexie, { type EntityTable } from "dexie";
import { v4 as uuid } from "uuid";
import type {
  BehaviorLog,
  DataService,
  Season,
  Value,
  WeeklyReview,
} from "./interface";
import { getWeekStart, getWeekEnd, startOfDay, endOfDay } from "../utils/dates";

class AlignedDatabase extends Dexie {
  values!: EntityTable<Value, "id">;
  logs!: EntityTable<BehaviorLog, "id">;
  reviews!: EntityTable<WeeklyReview, "id">;
  seasons!: EntityTable<Season, "id">;

  constructor() {
    super("AlignedDB");
    this.version(1).stores({
      values: "id, rank",
      logs: "id, timestamp, valueServed, valueCost, seasonId",
      reviews: "id, weekStartDate",
      seasons: "id, active, startDate",
    });
  }
}

const db = new AlignedDatabase();

export class IndexedDBDataService implements DataService {
  async getValues(): Promise<Value[]> {
    return db.values.orderBy("rank").toArray();
  }

  async getValue(id: string): Promise<Value | undefined> {
    return db.values.get(id);
  }

  async createValue(
    value: Omit<Value, "id" | "createdAt" | "updatedAt">
  ): Promise<Value> {
    const now = new Date();
    const newValue: Value = {
      ...value,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };
    await db.values.add(newValue);
    return newValue;
  }

  async updateValue(
    id: string,
    updates: Partial<Omit<Value, "id" | "createdAt">>
  ): Promise<void> {
    await db.values.update(id, { ...updates, updatedAt: new Date() });
  }

  async deleteValue(id: string): Promise<void> {
    await db.values.delete(id);
  }

  async reorderValues(orderedIds: string[]): Promise<void> {
    await db.transaction("rw", db.values, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.values.update(orderedIds[i], {
          rank: i + 1,
          updatedAt: new Date(),
        });
      }
    });
  }

  async hasValues(): Promise<boolean> {
    const count = await db.values.count();
    return count > 0;
  }

  async getLogs(startDate: Date, endDate: Date): Promise<BehaviorLog[]> {
    return db.logs
      .where("timestamp")
      .between(startDate, endDate, true, true)
      .reverse()
      .sortBy("timestamp");
  }

  async getLogsByDate(date: Date): Promise<BehaviorLog[]> {
    const start = startOfDay(date);
    const end = endOfDay(date);
    return this.getLogs(start, end);
  }

  async createLog(log: Omit<BehaviorLog, "id">): Promise<BehaviorLog> {
    const newLog: BehaviorLog = { ...log, id: uuid() };
    await db.logs.add(newLog);
    return newLog;
  }

  async updateLog(
    id: string,
    updates: Partial<Omit<BehaviorLog, "id">>
  ): Promise<void> {
    await db.logs.update(id, updates);
  }

  async deleteLog(id: string): Promise<void> {
    await db.logs.delete(id);
  }

  async getReviews(): Promise<WeeklyReview[]> {
    return db.reviews.orderBy("weekStartDate").reverse().toArray();
  }

  async getReviewForWeek(
    weekStartDate: Date
  ): Promise<WeeklyReview | undefined> {
    const start = startOfDay(weekStartDate);
    return db.reviews.where("weekStartDate").equals(start).first();
  }

  async getPreviousReview(
    weekStartDate: Date
  ): Promise<WeeklyReview | undefined> {
    const prevWeekStart = new Date(weekStartDate);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    return this.getReviewForWeek(prevWeekStart);
  }

  async createReview(
    review: Omit<WeeklyReview, "id" | "createdAt">
  ): Promise<WeeklyReview> {
    const newReview: WeeklyReview = {
      ...review,
      id: uuid(),
      createdAt: new Date(),
    };
    await db.reviews.add(newReview);
    return newReview;
  }

  async updateReview(
    id: string,
    updates: Partial<Omit<WeeklyReview, "id" | "createdAt">>
  ): Promise<void> {
    await db.reviews.update(id, updates);
  }

  async getSeasons(): Promise<Season[]> {
    return db.seasons.orderBy("startDate").reverse().toArray();
  }

  async getActiveSeason(): Promise<Season | undefined> {
    return db.seasons.where("active").equals(1).first();
  }

  async createSeason(season: Omit<Season, "id">): Promise<Season> {
    const newSeason: Season = { ...season, id: uuid() };
    if (season.active) {
      await db.seasons.where("active").equals(1).modify({ active: false });
    }
    await db.seasons.add(newSeason);
    return newSeason;
  }

  async updateSeason(
    id: string,
    updates: Partial<Omit<Season, "id">>
  ): Promise<void> {
    await db.seasons.update(id, updates);
  }

  async endSeason(id: string): Promise<void> {
    await db.seasons.update(id, { active: false, endDate: new Date() });
  }

  async exportAllData(): Promise<string> {
    const [values, logs, reviews, seasons] = await Promise.all([
      db.values.toArray(),
      db.logs.toArray(),
      db.reviews.toArray(),
      db.seasons.toArray(),
    ]);
    return JSON.stringify(
      { values, logs, reviews, seasons, exportedAt: new Date().toISOString() },
      null,
      2
    );
  }
}

let serviceInstance: IndexedDBDataService | null = null;

export function getDataService(): DataService {
  if (!serviceInstance) {
    serviceInstance = new IndexedDBDataService();
  }
  return serviceInstance;
}
