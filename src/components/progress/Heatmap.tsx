import { DailyProgress } from "@/lib/progress";

interface HeatmapProps {
  /** Starts on a Monday; the last week may be partial */
  days: DailyProgress[];
}

const WEEKDAY_LABELS = ["Sen", "", "Rab", "", "Jum", "", ""];

function levelClass(count: number): string {
  if (count === 0) return "bg-slate-100";
  if (count === 1) return "bg-indigo-200";
  if (count === 2) return "bg-indigo-300";
  if (count <= 4) return "bg-indigo-500";
  return "bg-indigo-700";
}

export default function Heatmap({ days }: HeatmapProps) {
  const total = days.reduce((sum, d) => sum + d.completed, 0);

  return (
    <div>
      <p className="sr-only">{total} tugas selesai dalam 12 minggu terakhir.</p>
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-2 w-max" aria-hidden="true">
          <div className="grid grid-rows-7 gap-1 sm:gap-1.5">
            {WEEKDAY_LABELS.map((label, i) => (
              <span key={i} className="h-4 sm:h-6 text-[10px] leading-4 sm:leading-6 text-slate-400 pr-1">
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-rows-7 grid-flow-col gap-1 sm:gap-1.5">
            {days.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.completed} tugas selesai`}
                className={`w-4 h-4 sm:w-6 sm:h-6 rounded-[4px] ${levelClass(day.completed)}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-400" aria-hidden="true">
        <span>Sedikit</span>
        {[0, 1, 2, 3, 5].map((n) => (
          <span key={n} className={`w-3.5 h-3.5 rounded-[4px] ${levelClass(n)}`} />
        ))}
        <span>Banyak</span>
      </div>
    </div>
  );
}
