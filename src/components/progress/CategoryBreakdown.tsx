import { CategoryProgress } from "@/lib/progress";
import { formatPercent } from "./format";

interface CategoryBreakdownProps {
  categories: CategoryProgress[];
}

export default function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  if (categories.length === 0) {
    return (
      <p className="text-xs text-slate-500 py-6 text-center">
        Belum ada tugas selesai pada rentang ini.
      </p>
    );
  }

  const max = Math.max(...categories.map((c) => c.completed));

  return (
    <ul className="space-y-4">
      {categories.map((category) => (
        <li key={category.categoryId ?? "none"}>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <span className="font-semibold text-slate-800 truncate">{category.name}</span>
            </span>
            <span className="text-slate-500 shrink-0">
              {category.completed} selesai · {formatPercent(category.onTimeRate)} tepat waktu
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(category.completed / max) * 100}%`,
                backgroundColor: category.color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
