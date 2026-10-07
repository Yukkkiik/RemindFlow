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
 * Combine date and time (HH:mm) into a single JavaScript Date object
 */
export function combineDateTime(date: Date | string, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);

  if (typeof date === "string") {
    const datePart = date.split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);
    if (year && month && day) {
      return new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
    }
  }

  const d = new Date(date);
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    hours || 0,
    minutes || 0,
    0,
    0
  );
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
