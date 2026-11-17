"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import Heatmap from "@/components/progress/Heatmap";
import WeeklyTrend from "@/components/progress/WeeklyTrend";
import CategoryBreakdown from "@/components/progress/CategoryBreakdown";
import ScoreFormula from "@/components/progress/ScoreFormula";
import { formatPercent } from "@/components/progress/format";
import { ProgressData, ProgressRange } from "@/lib/progress";
import { DEFAULT_TIMEZONE } from "@/utils/date";

const RANGES: { value: ProgressRange; label: string }[] = [
  { value: "7d", label: "7 hari" },
  { value: "30d", label: "30 hari" },
  { value: "90d", label: "90 hari" },
];

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs min-w-0">
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </section>
  );
}

export default function ProgressPage() {
  const [range, setRange] = useState<ProgressRange>("30d");
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/progress?range=${range}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Gagal memuat data progress");
        }
        if (!cancelled) {
          setData(json.data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range, reloadKey]);

  const changeRange = (next: ProgressRange) => {
    if (next === range) return;
    setLoading(true);
    setRange(next);
  };

  const retry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  const summary = data?.summary;
  const isEmpty = summary ? summary.consistencyScore === null && summary.longestStreak === 0 : false;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Progress"
          subtitle="Seberapa konsisten dan tepat waktu Anda menyelesaikan tugas"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Progress & Konsistensi
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Hari dihitung menurut zona waktu {DEFAULT_TIMEZONE}
              </p>
            </div>

            <div
              role="group"
              aria-label="Rentang waktu"
              className="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-xs self-start"
            >
              {RANGES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={range === item.value}
                  onClick={() => changeRange(item.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    range === item.value
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between gap-3"
            >
              <span>⚠️ {error}</span>
              <button
                type="button"
                onClick={retry}
                className="text-xs font-bold underline hover:text-rose-900 shrink-0 cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {loading && !data ? (
            <div className="space-y-4" aria-busy="true" aria-label="Memuat data progress">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-28 bg-white rounded-2xl border border-slate-200/60 animate-pulse"
                  />
                ))}
              </div>
              <div className="h-56 bg-white rounded-2xl border border-slate-200/60 animate-pulse" />
            </div>
          ) : data && summary ? (
            isEmpty ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <span className="text-3xl block mb-2">📈</span>
                <h3 className="text-sm font-bold text-slate-800">Belum ada data progress</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Selesaikan tugas pertama Anda dan progress, streak, serta grafik konsistensi akan
                  muncul di sini.
                </p>
                <Link
                  href="/tasks"
                  className="inline-block mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  Buka Daftar Tugas
                </Link>
              </div>
            ) : (
              <div
                className={`space-y-6 transition-opacity ${loading ? "opacity-60" : ""}`}
                aria-busy={loading}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Skor Konsistensi"
                    value={summary.consistencyScore ?? "—"}
                    icon="🎯"
                    colorScheme="indigo"
                    description="Skala 0–100, rumus di bawah"
                  />
                  <StatCard
                    title="Tingkat Selesai"
                    value={formatPercent(summary.completionRate)}
                    icon="✅"
                    colorScheme="emerald"
                    description={`${summary.completed} dari ${summary.due} tugas jatuh tempo`}
                  />
                  <StatCard
                    title="Tepat Waktu"
                    value={formatPercent(summary.onTimeRate)}
                    icon="⏱️"
                    colorScheme="blue"
                    description="Selesai sebelum deadline"
                  />
                  <StatCard
                    title="Streak"
                    value={`${summary.currentStreak} hari`}
                    icon="🔥"
                    colorScheme="amber"
                    description={`Terpanjang ${summary.longestStreak} hari`}
                  />
                </div>

                <Section
                  title="Aktivitas 12 Minggu Terakhir"
                  subtitle="Jumlah tugas selesai per hari, tidak terpengaruh pilihan rentang"
                >
                  <Heatmap days={data.activity.heatmap} />
                </Section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Section
                    title="Tren Mingguan"
                    subtitle="Tugas selesai per minggu, 12 minggu terakhir (label = tanggal Senin, hari/bulan)"
                  >
                    <WeeklyTrend weeks={data.activity.weekly} />
                  </Section>

                  <Section
                    title="Per Kategori"
                    subtitle={`Tugas selesai dalam ${RANGES.find((r) => r.value === range)?.label}`}
                  >
                    <CategoryBreakdown categories={data.byCategory} />
                  </Section>
                </div>

                <Section
                  title="Cara Skor Dihitung"
                  subtitle="Streak = minimal 1 tugas selesai per hari. Hari tanpa tugas jatuh tempo tidak dianggap gagal."
                >
                  <ScoreFormula summary={summary} />
                </Section>
              </div>
            )
          ) : null}
        </main>
      </div>
    </div>
  );
}
