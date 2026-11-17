import { format, parseISO } from "date-fns";
import { WeeklyProgress } from "@/lib/progress";

interface WeeklyTrendProps {
  weeks: WeeklyProgress[];
}

export default function WeeklyTrend({ weeks }: WeeklyTrendProps) {
  const max = Math.max(1, ...weeks.map((w) => w.completed));

  return (
    <div>
      <div className="flex items-end gap-1.5 sm:gap-3 h-44">
        {weeks.map((week) => (
          <div
            key={week.weekStart}
            className="flex-1 min-w-0 h-full flex flex-col items-center justify-end gap-1"
            title={`Minggu ${week.weekStart}: ${week.completed} selesai, ${week.onTime} tepat waktu`}
          >
            <span className="text-[10px] font-semibold text-slate-500">{week.completed}</span>
            <div
              className="relative w-full max-w-8 rounded-t-md bg-indigo-200 overflow-hidden"
              style={{ height: `${Math.max((week.completed / max) * 75, week.completed > 0 ? 4 : 1)}%` }}
            >
              <div
                className="absolute bottom-0 inset-x-0 bg-indigo-600"
                style={{ height: `${week.completed ? (week.onTime / week.completed) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 sm:gap-3 mt-2 border-t border-slate-200 pt-2">
        {weeks.map((week) => (
          <span
            key={week.weekStart}
            className="flex-1 min-w-0 text-center text-[9px] sm:text-[10px] text-slate-400 whitespace-nowrap [&:nth-child(even)]:invisible"
          >
            {format(parseISO(week.weekStart), "d/M")}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-indigo-600" /> Tepat waktu
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-indigo-200" /> Terlambat
        </span>
      </div>
    </div>
  );
}
