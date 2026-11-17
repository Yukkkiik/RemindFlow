import type { Priority, TaskStatus } from "@prisma/client";
import { combineDateTime, dayKey } from "@/utils/date";

export type ProgressRange = "7d" | "30d" | "90d";

export const RANGE_DAYS: Record<ProgressRange, number> = { "7d": 7, "30d": 30, "90d": 90 };

const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const DAY_MS = 24 * 60 * 60 * 1000;

/** The only task columns progress needs. dueDate is the calendar date stored as UTC midnight. */
export interface ProgressTask {
  status: TaskStatus;
  dueDate: Date;
  dueTime: string;
  completedAt: Date | null;
  priority: Priority;
  category: { id: string; name: string; color: string } | null;
}

export interface ProgressOptions {
  now: Date;
  timeZone: string;
  range: ProgressRange;
}

export interface ProgressSummary {
  /** Tasks whose deadline is in the range and already passed, or that are completed */
  due: number;
  /** Of `due`, how many are completed (completionRate = completed / due) */
  completed: number;
  /** null when there is nothing to measure */
  completionRate: number | null;
  onTimeRate: number | null;
  currentStreak: number;
  longestStreak: number;
  /** 0-100, null when the range has no due and no completed tasks */
  consistencyScore: number | null;
}

export interface DailyProgress {
  date: string;
  completed: number;
  onTime: number;
}

export interface CategoryProgress {
  categoryId: string | null;
  name: string;
  color: string;
  completed: number;
  onTimeRate: number | null;
}

export interface PriorityProgress {
  priority: Priority;
  completed: number;
  onTimeRate: number | null;
}

export interface ProgressResult {
  range: ProgressRange;
  summary: ProgressSummary;
  daily: DailyProgress[];
  byCategory: CategoryProgress[];
  byPriority: PriorityProgress[];
}

const UNCATEGORIZED = { name: "Tanpa kategori", color: "#94a3b8" };

/** Add `days` to a YYYY-MM-DD key (calendar arithmetic, no timezone involved). */
function addDays(key: string, days: number): string {
  return new Date(new Date(`${key}T00:00:00.000Z`).getTime() + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/** First and last day key (inclusive) of the range ending today in `timeZone`. */
export function rangeBounds(
  now: Date,
  timeZone: string,
  range: ProgressRange
): { startKey: string; todayKey: string } {
  const todayKey = dayKey(now, timeZone);
  return { startKey: addDays(todayKey, -(RANGE_DAYS[range] - 1)), todayKey };
}

function ratio(part: number, whole: number): number | null {
  return whole === 0 ? null : part / whole;
}

/**
 * Current and longest streak from a set of active day keys.
 * An inactive today does not break the streak: counting then starts from yesterday.
 */
export function computeStreaks(
  activeDays: Iterable<string>,
  todayKey: string
): { current: number; longest: number } {
  const days = new Set(activeDays);

  let current = 0;
  let cursor = days.has(todayKey) ? todayKey : addDays(todayKey, -1);
  while (days.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  let longest = 0;
  for (const day of days) {
    // Only start counting at the first day of a run
    if (days.has(addDays(day, -1))) continue;
    let length = 1;
    while (days.has(addDays(day, length))) length++;
    longest = Math.max(longest, length);
  }

  return { current, longest };
}

/** Consistency score 0-100: 0.5 * on-time rate + 0.3 * completion rate + 0.2 * min(streak / 7, 1). */
export function consistencyScore(
  onTimeRate: number | null,
  completionRate: number | null,
  currentStreak: number
): number {
  const score =
    0.5 * (onTimeRate ?? 0) + 0.3 * (completionRate ?? 0) + 0.2 * Math.min(currentStreak / 7, 1);
  return Math.round(score * 100);
}

/**
 * Progress metrics for `tasks` (all of the user's tasks, or at least every completed one
 * and every one due in the range) as seen in `timeZone`. Pure: time comes from `options`.
 * Only status COMPLETED with completedAt set counts as done, so reopened tasks drop out.
 */
export function computeProgress(tasks: ProgressTask[], options: ProgressOptions): ProgressResult {
  const { now, timeZone, range } = options;
  const { startKey, todayKey } = rangeBounds(now, timeZone, range);
  const inRange = (key: string) => key >= startKey && key <= todayKey;

  // Deadline is computed once per task; it is the expensive part
  const withDeadline = tasks.map((task) => ({
    task,
    deadline: combineDateTime(task.dueDate, task.dueTime, timeZone),
  }));

  const done = withDeadline
    .filter(({ task }) => task.status === "COMPLETED" && task.completedAt !== null)
    .map(({ task, deadline }) => {
      const completedAt = task.completedAt as Date;
      return {
        task,
        completedAt,
        completedKey: dayKey(completedAt, timeZone),
        onTime: completedAt <= deadline,
      };
    });

  // Due: deadline day in range, and either the deadline has passed or the task is already done
  const doneSet = new Set(done.map((d) => d.task));
  let due = 0;
  let dueCompleted = 0;
  for (const { task, deadline } of withDeadline) {
    const isDone = doneSet.has(task);
    const deadlineInRange = inRange(task.dueDate.toISOString().slice(0, 10));
    const deadlinePassed = deadline <= now;
    if (deadlineInRange && (deadlinePassed || isDone)) {
      due++;
      if (isDone) dueCompleted++;
    }
  }

  const completedInRange = done.filter((d) => inRange(d.completedKey));
  const onTimeInRange = completedInRange.filter((d) => d.onTime).length;

  const streaks = computeStreaks(
    done.map((d) => d.completedKey),
    todayKey
  );

  const completionRate = ratio(dueCompleted, due);
  const onTimeRate = ratio(onTimeInRange, completedInRange.length);

  const daily: DailyProgress[] = [];
  for (let key = startKey; key <= todayKey; key = addDays(key, 1)) {
    const ofDay = completedInRange.filter((d) => d.completedKey === key);
    daily.push({ date: key, completed: ofDay.length, onTime: ofDay.filter((d) => d.onTime).length });
  }

  const byCategoryMap = new Map<string | null, typeof completedInRange>();
  for (const d of completedInRange) {
    const id = d.task.category?.id ?? null;
    const group = byCategoryMap.get(id);
    if (group) group.push(d);
    else byCategoryMap.set(id, [d]);
  }
  const byCategory: CategoryProgress[] = [...byCategoryMap.entries()]
    .map(([categoryId, items]) => ({
      categoryId,
      name: items[0].task.category?.name ?? UNCATEGORIZED.name,
      color: items[0].task.category?.color ?? UNCATEGORIZED.color,
      completed: items.length,
      onTimeRate: ratio(items.filter((i) => i.onTime).length, items.length),
    }))
    .sort((a, b) => b.completed - a.completed || a.name.localeCompare(b.name));

  const byPriority: PriorityProgress[] = PRIORITIES.map((priority) => {
    const items = completedInRange.filter((d) => d.task.priority === priority);
    return {
      priority,
      completed: items.length,
      onTimeRate: ratio(items.filter((i) => i.onTime).length, items.length),
    };
  });

  const hasData = due > 0 || completedInRange.length > 0;

  return {
    range,
    summary: {
      due,
      completed: dueCompleted,
      completionRate,
      onTimeRate,
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      consistencyScore: hasData
        ? consistencyScore(onTimeRate, completionRate, streaks.current)
        : null,
    },
    daily,
    byCategory,
    byPriority,
  };
}

export interface WeeklyProgress {
  /** Monday of the week (YYYY-MM-DD) */
  weekStart: string;
  completed: number;
  onTime: number;
}

export interface ActivityResult {
  /** Daily counts from the Monday 11 weeks before this week's Monday, through today */
  heatmap: DailyProgress[];
  /** The same days grouped per Monday-based week; the last week is partial */
  weekly: WeeklyProgress[];
}

/** Fixed 12-week activity view (independent of the selected range): heatmap and weekly trend. */
export function computeActivity(
  tasks: ProgressTask[],
  options: Pick<ProgressOptions, "now" | "timeZone">
): ActivityResult {
  const daily = computeProgress(tasks, { ...options, range: "90d" }).daily;
  const todayKey = daily[daily.length - 1].date;
  const weekdayFromMonday = (new Date(`${todayKey}T00:00:00.000Z`).getUTCDay() + 6) % 7;
  const firstMonday = addDays(todayKey, -weekdayFromMonday - 11 * 7);
  const heatmap = daily.filter((d) => d.date >= firstMonday);

  const weekly: WeeklyProgress[] = [];
  for (let i = 0; i < heatmap.length; i += 7) {
    const week = heatmap.slice(i, i + 7);
    weekly.push({
      weekStart: week[0].date,
      completed: week.reduce((sum, d) => sum + d.completed, 0),
      onTime: week.reduce((sum, d) => sum + d.onTime, 0),
    });
  }

  return { heatmap, weekly };
}

/** Shape of GET /api/progress `data`. */
export interface ProgressData extends ProgressResult {
  activity: ActivityResult;
}
