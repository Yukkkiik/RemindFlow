import { describe, expect, it } from "vitest";
import { alarmActionSchema, createTaskSchema, updateTaskSchema } from "./task.schema";

const base = { title: "t", dueDate: "2026-11-17", dueTime: "09:00" };

describe("createTaskSchema dueDate", () => {
  it("accepts a plain calendar date", () => {
    expect(createTaskSchema.safeParse(base).success).toBe(true);
  });

  it.each(["abc", "2026-13-01", "2026-02-30", "2026-10-10T20:00:00+07:00", ""])(
    "rejects %j",
    (dueDate) => {
      expect(createTaskSchema.safeParse({ ...base, dueDate }).success).toBe(false);
    }
  );
});

describe("updateTaskSchema", () => {
  it("does not fill defaults for fields the client left out", () => {
    expect(updateTaskSchema.parse({ title: "x" })).toEqual({ title: "x" });
  });
});

describe("alarmActionSchema", () => {
  it("defaults snooze to 5 minutes", () => {
    expect(alarmActionSchema.parse({ action: "snooze" }).snoozeMinutes).toBe(5);
  });

  it.each([null, {}, { action: "nope" }, { action: "snooze", snoozeMinutes: "abc" }, { action: "snooze", snoozeMinutes: -5 }, { action: "snooze", snoozeMinutes: 1e9 }])(
    "rejects %j",
    (input) => {
      expect(alarmActionSchema.safeParse(input).success).toBe(false);
    }
  );
});
