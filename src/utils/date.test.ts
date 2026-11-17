import { describe, expect, it } from "vitest";
import { combineDateTime, dayKey, dueDateDayRange, timeKey } from "./date";

const WIB = "Asia/Jakarta";
const NY = "America/New_York";

describe("dayKey", () => {
  it("reads the calendar day in the given timezone, not the machine's", () => {
    // 05:00 WIB on 17 Nov is 22:00Z on 16 Nov
    const instant = new Date("2026-11-16T22:00:00Z");
    expect(dayKey(instant, WIB)).toBe("2026-11-17");
    expect(dayKey(instant, "UTC")).toBe("2026-11-16");
  });

  it("switches day exactly at local midnight", () => {
    expect(dayKey(new Date("2026-11-17T16:59:59.999Z"), WIB)).toBe("2026-11-17");
    expect(dayKey(new Date("2026-11-17T17:00:00.000Z"), WIB)).toBe("2026-11-18");
  });
});

describe("timeKey", () => {
  it("returns zero-padded 24h wall time, with midnight as 00:00", () => {
    expect(timeKey(new Date("2026-11-17T17:05:00Z"), WIB)).toBe("00:05");
    expect(timeKey(new Date("2026-11-17T16:30:00Z"), WIB)).toBe("23:30");
  });
});

describe("dueDateDayRange", () => {
  it("is the UTC-midnight span of the local day key, half-open", () => {
    const { start, end } = dueDateDayRange(new Date("2026-11-16T22:00:00Z"), WIB);
    expect(start.toISOString()).toBe("2026-11-17T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-11-18T00:00:00.000Z");
  });

  it("contains today's stored dueDate and excludes yesterday's and tomorrow's", () => {
    const { start, end } = dueDateDayRange(new Date("2026-11-16T22:00:00Z"), WIB);
    const contains = (iso: string) => new Date(iso) >= start && new Date(iso) < end;
    expect(contains("2026-11-17T00:00:00.000Z")).toBe(true);
    expect(contains("2026-11-16T00:00:00.000Z")).toBe(false);
    expect(contains("2026-11-18T00:00:00.000Z")).toBe(false);
  });
});

describe("combineDateTime", () => {
  it("turns a WIB wall-clock deadline into the right instant from every input form", () => {
    const want = "2026-11-17T10:00:00.000Z";
    expect(combineDateTime("2026-11-17", "17:00", WIB).toISOString()).toBe(want);
    expect(combineDateTime("2026-11-17T00:00:00.000Z", "17:00", WIB).toISOString()).toBe(want);
    expect(combineDateTime(new Date("2026-11-17T00:00:00.000Z"), "17:00", WIB).toISOString()).toBe(want);
  });

  it("puts a 00:00 deadline at the previous day's 17:00Z", () => {
    expect(combineDateTime("2026-11-17", "00:00", WIB).toISOString()).toBe("2026-11-16T17:00:00.000Z");
  });

  it("follows daylight saving time in the target zone", () => {
    expect(combineDateTime("2026-11-17", "09:00", NY).toISOString()).toBe("2026-11-17T14:00:00.000Z");
    expect(combineDateTime("2026-07-17", "09:00", NY).toISOString()).toBe("2026-07-17T13:00:00.000Z");
  });
});
