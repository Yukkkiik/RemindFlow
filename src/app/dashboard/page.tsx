"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import TaskCard from "@/components/task/TaskCard";
import TaskFormModal from "@/components/task/TaskFormModal";
import DeleteConfirmModal from "@/components/task/DeleteConfirmModal";
import { TaskWithCategory, Category } from "@/types";

interface StatsData {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  dueToday: number;
  highPriority: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
    dueToday: 0,
    highPriority: 0,
  });

  const [todayTasks, setTodayTasks] = useState<TaskWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskWithCategory | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskWithCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, todayRes, categoriesRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/tasks?filter=TODAY"),
        fetch("/api/categories"),
      ]);

      const [statsJson, todayJson, categoriesJson] = await Promise.all([
        statsRes.json(),
        todayRes.json(),
        categoriesRes.json(),
      ]);

      if (statsJson.success) setStats(statsJson.data);
      if (todayJson.success) setTodayTasks(todayJson.data);
      if (categoriesJson.success) setCategories(categoriesJson.data);
    } catch (err) {
      console.error("Gagal memuat data dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Toggle status
  const handleToggleStatus = async (id: string) => {
    setUpdatingTaskId(id);
    try {
      const res = await fetch(`/api/tasks/${id}/toggle`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengubah status");
      }
      fetchDashboardData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${taskToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menghapus tugas");
      }
      setTaskToDelete(null);
      fetchDashboardData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Dashboard"
          subtitle="Ringkasan aktivitas tugas dan alarm pengingat aktif Anda"
        />

        <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-8">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 sm:p-8 text-white shadow-lg shadow-indigo-600/10">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md mb-2">
                  👋 Selamat Datang Kembali
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Kelola Jadwal & Tugas dengan Efisien
                </h1>
                <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl leading-relaxed">
                  Pantau deadline penting hari ini dan jangan lewatkan alarm pengingat tugas Anda.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTaskToEdit(null);
                    setIsFormModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <span>➕</span>
                  <span>Tugas Baru</span>
                </button>
                <Link
                  href="/tasks"
                  className="px-5 py-2.5 rounded-xl bg-indigo-500/40 hover:bg-indigo-500/60 text-white text-xs font-semibold border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5"
                >
                  <span>Semua Tugas</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/30 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Tugas"
              value={stats.total}
              icon="📊"
              colorScheme="indigo"
              description="Seluruh tugas tercatat"
            />
            <StatCard
              title="Tugas Hari Ini"
              value={stats.dueToday}
              icon="📅"
              colorScheme="amber"
              description="Perlu diselesaikan hari ini"
            />
            <StatCard
              title="Sedang Berjalan"
              value={stats.inProgress + stats.todo}
              icon="⏳"
              colorScheme="blue"
              description="Tugas aktif belum tuntas"
            />
            <StatCard
              title="Selesai"
              value={stats.completed}
              icon="✅"
              colorScheme="emerald"
              description="Tugas yang telah tuntas"
            />
          </div>

          {/* Today's Tasks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>📅</span>
                  <span>Tugas Hari Ini</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Daftar tugas dengan batas waktu hari ini
                </p>
              </div>

              <Link
                href="/tasks?filter=TODAY"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
              >
                Lihat di Daftar Tugas →
              </Link>
            </div>

            {loading ? (
              <div className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ) : todayTasks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <span className="text-3xl block mb-2">🎉</span>
                <h3 className="text-sm font-bold text-slate-800">
                  Tidak ada tugas jatuh tempo hari ini!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Semua tugas hari ini telah beres atau Anda belum menjadwalkan tugas.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTaskToEdit(null);
                    setIsFormModalOpen(true);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                >
                  + Jadwalkan Tugas Hari Ini
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={handleToggleStatus}
                    onEdit={(t) => {
                      setTaskToEdit(t);
                      setIsFormModalOpen(true);
                    }}
                    onDelete={(t) => setTaskToDelete(t)}
                    isUpdating={updatingTaskId === task.id}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Task Modal */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setTaskToEdit(null);
        }}
        onSuccess={fetchDashboardData}
        taskToEdit={taskToEdit}
        categories={categories}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Hapus Tugas"
        message={`Apakah Anda yakin ingin menghapus tugas "${taskToDelete?.title}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
