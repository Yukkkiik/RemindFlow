import { describe, expect, it } from "vitest";
import {
  computeActivity,
  computeProgress,
  computeStreaks,
  consistencyScore,
  rangeBounds,
  type ProgressRange,
  type ProgressTask,
} from "./progress";

const WIB = "Asia/Jakarta";
// 12:00 WIB on 2026-11-17
const NOW = new Date("2026-11-17T05:00:00Z");

function task(overrides: Partial<ProgressTask> = {}): ProgressTask {
  return {
    status: "COMPLETED",
    dueDate: new Date("2026-11-17T00:00:00Z"),
    dueTime: "12:00",
    completedAt: new Date("2026-11-17T01:00:00Z"),
    priority: "MEDIUM",
    category: null,
    ...overrides,
  };
}

const doneAt = (iso: string, overrides: Partial<ProgressTask> = {}) =>
  task({ completedAt: new Date(iso), ...overrides });

function run(tasks: ProgressTask[], timeZone = WIB, range: ProgressRange = "7d", now = NOW) {
  return computeProgress(tasks, { now, timeZone, range });
}

describe("computeStreaks", () => {
  it("counts consecutive days ending today", () => {
    expect(computeStreaks(["2026-11-15", "2026-11-16", "2026-11-17"], "2026-11-17")).toEqual({
      current: 3,
      longest: 3,
    });
  });

  it("keeps streak alive when today has no completion yet", () => {
    expect(computeStreaks(["2026-11-15", "2026-11-16"], "2026-11-17").current).toBe(2);
  });

  it("resets current streak to 0 when neither today nor yesterday is active", () => {
    expect(computeStreaks(["2026-11-14", "2026-11-15"], "2026-11-17").current).toBe(0);
  });

  it("counts duplicate days once", () => {
    expect(computeStreaks(["2026-11-17", "2026-11-17", "2026-11-16"], "2026-11-17")).toEqual({
      current: 2,
      longest: 2,
    });
  });

  it("stops the current streak at a gap but keeps the longer old run as longest", () => {
    const days = ["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-16", "2026-11-17"];
    expect(computeStreaks(days, "2026-11-17")).toEqual({ current: 2, longest: 3 });
  });

  it("returns zeros for no active days", () => {
    expect(computeStreaks([], "2026-11-17")).toEqual({ current: 0, longest: 0 });
  });

  it("handles runs crossing month and year boundaries", () => {
    expect(computeStreaks(["2026-12-31", "2027-01-01"], "2027-01-01").current).toBe(2);
  });
});

describe("consistencyScore", () => {
  it("returns 100 for perfect rates and a 7 day streak", () => {
    expect(consistencyScore(1, 1, 7)).toBe(100);
  });

  it("caps the streak contribution at 7 days", () => {
    expect(consistencyScore(1, 1, 30)).toBe(100);
    expect(consistencyScore(0, 0, 30)).toBe(20);
  });

  it("weights on-time rate at 50%", () => {
    expect(consistencyScore(1, 0, 0)).toBe(50);
  });

  it("weights completion rate at 30%", () => {
    expect(consistencyScore(0, 1, 0)).toBe(30);
  });

  it("scales the streak linearly below 7 days", () => {
    // 0.2 * 3.5/7 = 0.1
    expect(consistencyScore(0, 0, 3.5)).toBe(10);
  });

  it("treats null rates as 0", () => {
    expect(consistencyScore(null, null, 0)).toBe(0);
  });

  it("rounds to an integer", () => {
    // 0.5 * (1/3) = 0.1666 -> 17
    expect(consistencyScore(1 / 3, 0, 0)).toBe(17);
  });
});

describe("computeProgress: streak and timezone", () => {
  it("counts completions at 23:50 and 00:10 WIB as two consecutive days", () => {
    // Both instants fall on UTC 2026-11-16 but on WIB 16 and 17 Nov
    const tasks = [doneAt("2026-11-16T16:50:00Z"), doneAt("2026-11-16T17:10:00Z")];
    const { summary, daily } = run(tasks, WIB);
    expect(summary.currentStreak).toBe(2);
    expect(summary.longestStreak).toBe(2);
    expect(daily.filter((d) => d.completed > 0).map((d) => d.date)).toEqual([
      "2026-11-16",
      "2026-11-17",
    ]);
  });

  it("sees the same two instants as a single day in UTC", () => {
    const tasks = [doneAt("2026-11-16T16:50:00Z"), doneAt("2026-11-16T17:10:00Z")];
    const { summary, daily } = run(tasks, "UTC");
    expect(summary.longestStreak).toBe(1);
    expect(daily.filter((d) => d.completed > 0)).toEqual([
      { date: "2026-11-16", completed: 2, onTime: 2 },
    ]);
  });

  it("puts a 00:30 WIB completion on the next day compared to UTC", () => {
    const tasks = [doneAt("2026-11-16T17:30:00Z")];
    const wib = run(tasks, WIB).daily.find((d) => d.completed > 0);
    const utc = run(tasks, "UTC").daily.find((d) => d.completed > 0);
    expect(wib?.date).toBe("2026-11-17");
    expect(utc?.date).toBe("2026-11-16");
  });

  it("puts a 23:30 UTC completion on the next day in WIB", () => {
    const tasks = [doneAt("2026-11-16T23:30:00Z")];
    expect(run(tasks, WIB).daily.find((d) => d.completed > 0)?.date).toBe("2026-11-17");
    expect(run(tasks, "UTC").daily.find((d) => d.completed > 0)?.date).toBe("2026-11-16");
  });

  it("keeps a 23:30 WIB completion on its own WIB day", () => {
    // 16:30Z is 23:30 WIB, same calendar day (16 Nov) in both zones
    const tasks = [doneAt("2026-11-16T16:30:00Z")];
    expect(run(tasks, WIB).daily.find((d) => d.completed > 0)?.date).toBe("2026-11-16");
    expect(run(tasks, "UTC").daily.find((d) => d.completed > 0)?.date).toBe("2026-11-16");
  });

  it("keeps streak alive when today has no completion yet", () => {
    const { summary } = run([doneAt("2026-11-16T03:00:00Z")]);
    expect(summary.currentStreak).toBe(1);
  });

  it("drops current streak to 0 when yesterday is also inactive", () => {
    const { summary } = run([doneAt("2026-11-15T03:00:00Z")]);
    expect(summary.currentStreak).toBe(0);
    expect(summary.longestStreak).toBe(1);
  });

  it("uses completions older than the range for the longest streak", () => {
    const old = [1, 2, 3, 4, 5].map((d) => doneAt(`2026-08-0${d}T03:00:00Z`));
    const { summary } = run(old, WIB, "7d");
    expect(summary.longestStreak).toBe(5);
    expect(summary.currentStreak).toBe(0);
  });
});

describe("computeProgress: reopened tasks", () => {
  it("ignores a reopened task with a stale completedAt", () => {
    const { summary, daily } = run([task({ status: "TODO" })]);
    expect(summary.currentStreak).toBe(0);
    expect(summary.longestStreak).toBe(0);
    expect(daily.every((d) => d.completed === 0)).toBe(true);
  });

  it("ignores a COMPLETED task with null completedAt", () => {
    const { summary, daily } = run([task({ completedAt: null })]);
    expect(summary.longestStreak).toBe(0);
    expect(daily.every((d) => d.completed === 0)).toBe(true);
  });

  it("does not count a reopened task as completed in the completion rate", () => {
    // deadline 11:00 WIB already passed, so it is due but not completed
    const { summary } = run([task({ status: "IN_PROGRESS", dueTime: "11:00" })]);
    expect(summary.due).toBe(1);
    expect(summary.completed).toBe(0);
    expect(summary.completionRate).toBe(0);
  });
});

describe("computeProgress: on-time boundary", () => {
  // deadline 2026-11-17 12:00 WIB = 05:00Z
  it("counts completion exactly at the deadline as on-time", () => {
    const { summary } = run([doneAt("2026-11-17T05:00:00.000Z")]);
    expect(summary.onTimeRate).toBe(1);
  });

  it("counts completion 1 ms after the deadline as late", () => {
    const { summary } = run([doneAt("2026-11-17T05:00:00.001Z")], WIB, "7d", new Date("2026-11-17T06:00:00Z"));
    expect(summary.onTimeRate).toBe(0);
  });

  it("interprets dueTime in the given timeZone", () => {
    // dueTime 10:00 is 10:00Z in UTC (completion at 05:00Z is early) but 03:00Z in WIB (late)
    const t = doneAt("2026-11-17T05:00:00Z", { dueTime: "10:00" });
    expect(run([t], "UTC").summary.onTimeRate).toBe(1);
    expect(run([t], WIB).summary.onTimeRate).toBe(0);
  });
});

describe("computeProgress: empty range", () => {
  it.each([
    ["7d", 7],
    ["30d", 30],
    ["90d", 90],
  ] as const)("returns null rates, null score and zeroed daily for %s", (range, n) => {
    const r = run([], WIB, range);
    expect(r.range).toBe(range);
    expect(r.summary).toEqual({
      due: 0,
      completed: 0,
      completionRate: null,
      onTimeRate: null,
      currentStreak: 0,
      longestStreak: 0,
      consistencyScore: null,
    });
    expect(r.daily).toHaveLength(n);
    expect(r.daily.every((d) => d.completed === 0 && d.onTime === 0)).toBe(true);
    expect(r.byCategory).toEqual([]);
    expect(r.byPriority).toEqual(
      ["LOW", "MEDIUM", "HIGH", "URGENT"].map((priority) => ({
        priority,
        completed: 0,
        onTimeRate: null,
      }))
    );
  });

  it("returns a null score when only out-of-range tasks exist", () => {
    const old = doneAt("2026-01-05T03:00:00Z", { dueDate: new Date("2026-01-05T00:00:00Z") });
    expect(run([old]).summary.consistencyScore).toBeNull();
  });
});

describe("computeProgress: daily", () => {
  it("lists exactly N consecutive days ending today, in ascending order", () => {
    const { daily } = run([], WIB, "7d");
    expect(daily.map((d) => d.date)).toEqual([
      "2026-11-11",
      "2026-11-12",
      "2026-11-13",
      "2026-11-14",
      "2026-11-15",
      "2026-11-16",
      "2026-11-17",
    ]);
  });

  it("zero-fills days without completions and counts on-time per day", () => {
    const tasks = [
      doneAt("2026-11-15T03:00:00Z", { dueDate: new Date("2026-11-15T00:00:00Z") }),
      doneAt("2026-11-15T09:00:00Z", { dueDate: new Date("2026-11-15T00:00:00Z") }), // 16:00 WIB, late for 12:00
    ];
    const { daily } = run(tasks);
    expect(daily.find((d) => d.date === "2026-11-15")).toEqual({
      date: "2026-11-15",
      completed: 2,
      onTime: 1,
    });
    expect(daily.find((d) => d.date === "2026-11-14")).toEqual({
      date: "2026-11-14",
      completed: 0,
      onTime: 0,
    });
  });

  it("excludes completions older than the range from daily", () => {
    const { daily } = run([doneAt("2026-11-10T03:00:00Z")]);
    expect(daily.reduce((s, d) => s + d.completed, 0)).toBe(0);
  });
});

describe("computeProgress: due and completion rate", () => {
  it("does not count an unfinished task whose deadline is later today", () => {
    const { summary } = run([task({ status: "TODO", completedAt: null, dueTime: "20:00" })]);
    expect(summary.due).toBe(0);
    expect(summary.completionRate).toBeNull();
  });

  it("counts a task due later today as due once it is completed", () => {
    const { summary } = run([task({ dueTime: "20:00" })]);
    expect(summary.due).toBe(1);
    expect(summary.completed).toBe(1);
    expect(summary.completionRate).toBe(1);
  });

  it("counts an unfinished task with a passed deadline as due and not completed", () => {
    const { summary } = run([
      task({ status: "TODO", completedAt: null, dueTime: "11:59" }),
      task({ dueTime: "20:00" }),
    ]);
    expect(summary.due).toBe(2);
    expect(summary.completionRate).toBe(0.5);
  });

  it("ignores tasks whose deadline is outside the range", () => {
    const { summary } = run([
      task({ status: "TODO", completedAt: null, dueDate: new Date("2026-11-10T00:00:00Z") }),
    ]);
    expect(summary.due).toBe(0);
  });

  it("combines rates into the consistency score", () => {
    // 1 completed on time, 1 overdue: completion 0.5, on-time 1, streak 1
    const { summary } = run([
      task({ completedAt: new Date("2026-11-17T01:00:00Z") }),
      task({ status: "TODO", completedAt: null, dueTime: "08:00" }),
    ]);
    expect(summary.consistencyScore).toBe(
      consistencyScore(summary.onTimeRate, summary.completionRate, summary.currentStreak)
    );
    expect(summary.consistencyScore).toBe(Math.round((0.5 + 0.15 + 0.2 / 7) * 100));
  });
});

describe("computeProgress: breakdowns", () => {
  const cat = (id: string, name: string) => ({ id, name, color: "#fff" });

  it("sorts categories by completed count then name, with uncategorized labelled", () => {
    const at = "2026-11-17T01:00:00Z";
    const tasks = [
      doneAt(at, { category: cat("b", "Beta") }),
      doneAt(at, { category: cat("a", "Alpha") }),
      doneAt(at, { category: cat("z", "Zeta") }),
      doneAt(at, { category: cat("z", "Zeta") }),
      doneAt(at, { category: null }),
    ];
    const { byCategory } = run(tasks);
    expect(byCategory.map((c) => [c.name, c.completed])).toEqual([
      ["Zeta", 2],
      ["Alpha", 1],
      ["Beta", 1],
      ["Tanpa kategori", 1],
    ]);
    expect(byCategory[3].categoryId).toBeNull();
  });

  it("computes per-category on-time rate", () => {
    const tasks = [
      doneAt("2026-11-17T01:00:00Z", { category: cat("a", "Alpha") }),
      doneAt("2026-11-17T08:00:00Z", { category: cat("a", "Alpha") }), // after 12:00 WIB deadline
    ];
    const now = new Date("2026-11-17T09:00:00Z");
    expect(run(tasks, WIB, "7d", now).byCategory[0].onTimeRate).toBe(0.5);
  });

  it("reports all four priorities in order with their counts", () => {
    const at = "2026-11-17T01:00:00Z";
    const { byPriority } = run([
      doneAt(at, { priority: "URGENT" }),
      doneAt(at, { priority: "URGENT" }),
      doneAt(at, { priority: "LOW" }),
    ]);
    expect(byPriority.map((p) => [p.priority, p.completed])).toEqual([
      ["LOW", 1],
      ["MEDIUM", 0],
      ["HIGH", 0],
      ["URGENT", 2],
    ]);
    expect(byPriority[1].onTimeRate).toBeNull();
    expect(byPriority[3].onTimeRate).toBe(1);
  });
});

describe("rangeBounds", () => {
  it("ends today in the given timezone and spans N days inclusive", () => {
    // 22:00Z on 16 Nov is already 17 Nov in WIB
    const now = new Date("2026-11-16T22:00:00Z");
    expect(rangeBounds(now, WIB, "7d")).toEqual({ startKey: "2026-11-11", todayKey: "2026-11-17" });
    expect(rangeBounds(now, "UTC", "7d")).toEqual({ startKey: "2026-11-10", todayKey: "2026-11-16" });
  });
});

describe("computeActivity", () => {
  it("starts the heatmap on the Monday 11 weeks before this week's Monday", () => {
    // 17 Nov 2026 is a Tuesday
    const { heatmap } = computeActivity([], { now: NOW, timeZone: WIB });
    expect(heatmap[0].date).toBe("2026-08-31");
    expect(new Date(`${heatmap[0].date}T00:00:00Z`).getUTCDay()).toBe(1);
    expect(heatmap[heatmap.length - 1].date).toBe("2026-11-17");
    expect(heatmap).toHaveLength(11 * 7 + 2);
  });

  it("groups days into 12 Monday-based weeks with a partial last week", () => {
    const { weekly } = computeActivity([], { now: NOW, timeZone: WIB });
    expect(weekly).toHaveLength(12);
    expect(weekly[0].weekStart).toBe("2026-08-31");
    expect(weekly[11].weekStart).toBe("2026-11-16");
  });

  it("sums completed and on-time per week", () => {
    const tasks = [
      doneAt("2026-11-16T01:00:00Z"), // Mon 16 Nov, before the 12:00 WIB deadline of 17 Nov
      doneAt("2026-11-17T03:00:00Z"), // Tue 17 Nov 10:00 WIB, on time
      doneAt("2026-11-17T08:00:00Z"), // Tue 17 Nov 15:00 WIB, late
      doneAt("2026-11-09T01:00:00Z"), // previous week
    ];
    const { weekly } = computeActivity(tasks, { now: NOW, timeZone: WIB });
    expect(weekly[11]).toEqual({ weekStart: "2026-11-16", completed: 3, onTime: 2 });
    expect(weekly[10]).toEqual({ weekStart: "2026-11-09", completed: 1, onTime: 1 });
  });

  it("is independent of the selected range and uses the timezone for day boundaries", () => {
    // 17:30Z on 16 Nov is 00:30 WIB on 17 Nov
    const { heatmap } = computeActivity([doneAt("2026-11-16T17:30:00Z")], { now: NOW, timeZone: WIB });
    expect(heatmap.find((d) => d.date === "2026-11-17")?.completed).toBe(1);
    expect(heatmap.find((d) => d.date === "2026-11-16")?.completed).toBe(0);
  });
});
