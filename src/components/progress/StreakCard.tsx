"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProgressData } from "@/lib/progress";

/** Small self-contained card for the dashboard; hides itself if the data cannot be loaded. */
export default function StreakCard() {
  const [streak, setStreak] = useState<{ current: number; longest: number } | null>(null);

  useEffect(() => {
    fetch("/api/progress?range=7d")
      .then((res) => res.json())
      .then((json: { success: boolean; data?: ProgressData }) => {
        if (json.success && json.data) {
          setStreak({
            current: json.data.summary.currentStreak,
            longest: json.data.summary.longestStreak,
          });
        }
      })
      .catch(console.error);
  }, []);

  if (!streak) return null;

  return (
    <Link
      href="/progress"
      className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-amber-100 shadow-xs hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-xs">
          🔥
        </div>
        <div>
          <p className="text-sm font-extrabold text-slate-900">
            {streak.current > 0 ? `Streak ${streak.current} hari` : "Belum ada streak"}
          </p>
          <p className="text-xs text-slate-500">
            {streak.current > 0
              ? `Terpanjang ${streak.longest} hari · selesaikan 1 tugas per hari untuk menjaganya`
              : "Selesaikan satu tugas hari ini untuk memulai streak"}
          </p>
        </div>
      </div>
      <span className="text-xs font-semibold text-indigo-600 shrink-0">Lihat progress →</span>
    </Link>
  );
}
