import { ProgressSummary } from "@/lib/progress";
import { formatPercent } from "./format";

interface ScoreFormulaProps {
  summary: ProgressSummary;
}

export default function ScoreFormula({ summary }: ScoreFormulaProps) {
  const streakShare = Math.min(summary.currentStreak / 7, 1);
  const rows = [
    { weight: "50%", label: "Tingkat tepat waktu", value: formatPercent(summary.onTimeRate) },
    { weight: "30%", label: "Tingkat selesai", value: formatPercent(summary.completionRate) },
    {
      weight: "20%",
      label: "Streak (maksimal di 7 hari)",
      value: `${summary.currentStreak} hari → ${formatPercent(streakShare)}`,
    },
  ];

  return (
    <div className="text-xs text-slate-600 space-y-3">
      <p className="font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 leading-relaxed">
        Skor = 0,5 × tepat waktu + 0,3 × selesai + 0,2 × min(streak ÷ 7, 1)
      </p>
      <ul className="space-y-1.5">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-3">
            <span>
              <span className="font-bold text-slate-800">{row.weight}</span> · {row.label}
            </span>
            <span className="font-semibold text-slate-800">{row.value}</span>
          </li>
        ))}
      </ul>
      <p className="text-slate-400 leading-relaxed">
        Nilai yang belum bisa diukur (belum ada data) dihitung 0. Skor “—” berarti belum ada tugas
        jatuh tempo maupun selesai pada rentang ini.
      </p>
    </div>
  );
}
