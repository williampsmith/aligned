import { getDataService } from "./indexeddb";
import { getWeekStart } from "../utils/dates";

const SEED_VALUES = [
  { label: "Family", definition: "Being present for the people I love — showing up, not just being around.", rank: 1 },
  { label: "Health", definition: "Taking care of my body through movement, sleep, and what I eat.", rank: 2 },
  { label: "Career", definition: "Building something meaningful through my work and growing my craft.", rank: 3 },
  { label: "Growth", definition: "Staying curious, learning new things, pushing past what's comfortable.", rank: 4 },
  { label: "Connection", definition: "Maintaining real friendships — not just keeping in touch, but actually connecting.", rank: 5 },
  { label: "Rest", definition: "Protecting time to do nothing without guilt.", rank: 6 },
];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursAgo(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

export async function seedDatabase(): Promise<void> {
  const ds = getDataService();
  const hasExisting = await ds.hasValues();
  if (hasExisting) return;

  console.log("[seed] Populating database with test data...");

  const createdValues = await Promise.all(
    SEED_VALUES.map((v) => ds.createValue(v))
  );

  const valueByLabel = new Map(createdValues.map((v) => [v.label, v.id]));
  const family = valueByLabel.get("Family")!;
  const health = valueByLabel.get("Health")!;
  const career = valueByLabel.get("Career")!;
  const growth = valueByLabel.get("Growth")!;
  const connection = valueByLabel.get("Connection")!;
  const rest = valueByLabel.get("Rest")!;

  const sampleLogs = [
    { description: "Skipped gym to help partner with errands", valueServed: family, valueCost: health, intentional: true, timestamp: hoursAgo(2), seasonId: null },
    { description: "Morning run before work", valueServed: health, valueCost: null, intentional: true, timestamp: hoursAgo(5), seasonId: null },
    { description: "Stayed late to finish the feature demo", valueServed: career, valueCost: rest, intentional: true, timestamp: hoursAgo(8), seasonId: null },
    { description: "Read a chapter of the systems design book", valueServed: growth, valueCost: null, intentional: true, timestamp: hoursAgo(10), seasonId: null },
    { description: "Called Mom to check in", valueServed: family, valueCost: null, intentional: true, timestamp: hoursAgo(26), seasonId: null },
    { description: "Scrolled phone instead of going to the gym", valueServed: rest, valueCost: health, intentional: false, timestamp: hoursAgo(28), seasonId: null },
    { description: "Grabbed dinner with Alex", valueServed: connection, valueCost: career, intentional: true, timestamp: hoursAgo(30), seasonId: null },
    { description: "Deep work session on the API refactor", valueServed: career, valueCost: null, intentional: true, timestamp: hoursAgo(48), seasonId: null },
    { description: "Took a nap instead of working out", valueServed: rest, valueCost: health, intentional: false, timestamp: hoursAgo(50), seasonId: null },
    { description: "Cooked a real dinner instead of ordering out", valueServed: health, valueCost: rest, intentional: true, timestamp: hoursAgo(52), seasonId: null },
    { description: "Pair-programmed with a junior teammate", valueServed: connection, valueCost: career, intentional: true, timestamp: hoursAgo(72), seasonId: null },
    { description: "Skipped team happy hour to study", valueServed: growth, valueCost: connection, intentional: true, timestamp: hoursAgo(74), seasonId: null },
    { description: "Weekend hike with the family", valueServed: family, valueCost: null, intentional: true, timestamp: daysAgo(4), seasonId: null },
    { description: "Cancelled plans to catch up on sleep", valueServed: rest, valueCost: connection, intentional: false, timestamp: daysAgo(5), seasonId: null },
    { description: "Wrote the project proposal", valueServed: career, valueCost: rest, intentional: true, timestamp: daysAgo(5), seasonId: null },
  ];

  await Promise.all(sampleLogs.map((log) => ds.createLog(log)));

  const weekStart = getWeekStart(daysAgo(7));
  await ds.createReview({
    weekStartDate: weekStart,
    satisfiedWithAllocation: false,
    focusValueId: health,
    commitment: "Run Tuesday and Thursday at 7am before work",
    commitmentMet: null,
    enabler: null,
    obstacle: null,
    obstacleCategory: null,
  });

  console.log(
    `[seed] Done — ${createdValues.length} values, ${sampleLogs.length} logs, 1 review`
  );
}
