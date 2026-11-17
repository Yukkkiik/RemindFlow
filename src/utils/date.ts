import {
  format,
  parseISO,
  isToday,
  isTomorrow,
  isPast,
  addMinutes,
} from "date-fns";

export const DEFAULT_TIMEZONE =
  process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "Asia/Jakarta";

/**
 * Format Date to standard readable string (e.g., "10 Oct 2026")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd MMM yyyy");
}

/**
 * Format relative or readable date with indicator (Today, Tomorrow, or date)
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "dd MMM yyyy");
}

/**
 * Day key (YYYY-MM-DD) of an instant as seen in `timeZone`.
 * The single place that decides "which day is it", so server and browser agree.
 */
const formatterCache = new Map<string, Intl.DateTimeFormat>();

/** Intl formatters are expensive to build and progress calls them per task, so reuse them. */
function cachedFormatter(
  locale: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const key = `${locale}|${timeZone}|${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { timeZone, ...options });
    formatterCache.set(key, formatter);
  }
  return formatter;
}

export function dayKey(date: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  // en-CA formats as YYYY-MM-DD
  return cachedFormatter("en-CA", timeZone, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Wall-clock time (HH:mm) of an instant as seen in `timeZone`. */
export function timeKey(date: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  return cachedFormatter("en-GB", timeZone, {
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Prisma range for "the calendar day of `now` in `timeZone`" on Task.dueDate.
 * dueDate is stored as UTC midnight of the calendar date, so the bounds are UTC
 * midnights of the day key, not the timezone's local midnight. Half-open: [start, end).
 */
export function dueDateDayRange(
  now: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE
): { start: Date; end: Date } {
  const start = new Date(`${dayKey(now, timeZone)}T00:00:00.000Z`);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

/** Offset (ms) of `timeZone` from UTC at the given instant. */
function timeZoneOffsetMs(instant: number, timeZone: string): number {
  const parts = cachedFormatter("en-US", timeZone, {
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/** The instant at which the wall clock in `timeZone` reads y-m-d hh:mm. */
function zonedWallTimeToInstant(
  y: number,
  m: number,
  d: number,
  hh: number,
  mm: number,
  timeZone: string
): Date {
  const wallAsUtc = Date.UTC(y, m - 1, d, hh, mm);
  // Second pass re-reads the offset at the first guess so DST transitions resolve correctly
  const firstGuess = wallAsUtc - timeZoneOffsetMs(wallAsUtc, timeZone);
  return new Date(wallAsUtc - timeZoneOffsetMs(firstGuess, timeZone));
}

/**
 * Combine a task's dueDate and dueTime (HH:mm, wall clock in `timeZone`) into the
 * deadline instant. Independent of the runtime's own timezone.
 * dueDate is the calendar date (string or Date stored as UTC midnight).
 */
export function combineDateTime(
  date: Date | string,
  time: string,
  timeZone: string = DEFAULT_TIMEZONE
): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const datePart = (typeof date === "string" ? date : date.toISOString()).split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  return zonedWallTimeToInstant(year, month, day, hours || 0, minutes || 0, timeZone);
}

/**
 * Calculate the exact alarm trigger time based on task due date, time, and reminder offset (in minutes)
 */
export function calculateReminderTriggerTime(
  dueDate: Date | string,
  dueTime: string,
  offsetMinutes: number
): Date {
  const eventTime = combineDateTime(dueDate, dueTime);
  return addMinutes(eventTime, -offsetMinutes);
}

/**
 * Check if a date/time has passed
 */
export function hasPassed(date: Date): boolean {
  return isPast(date);
}
