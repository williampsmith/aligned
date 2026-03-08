export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function formatWeekRange(date: Date): string {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function navigateWeek(currentDate: Date, direction: "prev" | "next"): Date {
  const d = new Date(currentDate);
  d.setDate(d.getDate() + (direction === "next" ? 7 : -7));
  return d;
}

export function isCurrentWeek(date: Date): boolean {
  const now = new Date();
  const currentStart = getWeekStart(now);
  const targetStart = getWeekStart(date);
  return currentStart.getTime() === targetStart.getTime();
}

export function isSunday(): boolean {
  return new Date().getDay() === 0;
}

export function daysBetween(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
