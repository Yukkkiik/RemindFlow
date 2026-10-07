"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TaskCard from "@/components/task/TaskCard";
import TaskFormModal from "@/components/task/TaskFormModal";
import DeleteConfirmModal from "@/components/task/DeleteConfirmModal";
import { TaskWithCategory, Category } from "@/types";
import { formatDate } from "@/utils/date";

export default function CalendarPage() {
  const [tasks, setTasks] = useState<TaskWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskWithCategory | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskWithCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const fetchCalendarTasks = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, catRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/categories"),
      ]);
      const [tasksJson, catJson] = await Promise.all([
        tasksRes.json(),
        catRes.json(),
      ]);

      if (tasksJson.success) setTasks(tasksJson.data);
      if (catJson.success) setCategories(catJson.data);
    } catch (err) {
      console.error("Gagal memuat tugas kalender:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarTasks();
  }, [fetchCalendarTasks]);

  const handleToggleStatus = async (id: string) => {
    setUpdatingTaskId(id);
    try {
      const res = await fetch(`/api/tasks/${id}/toggle`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      fetchCalendarTasks();
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
      if (!res.ok || !data.success) throw new Error(data.error);
      setTaskToDelete(null);
      fetchCalendarTasks();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setIsDeleting(false);
    }
  };

  // Group tasks by date string
  const groupedTasks = tasks.reduce<Record<string, TaskWithCategory[]>>(
    (acc, task) => {
      const dateKey = task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "Tanpa Tanggal";

      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(task);
      return acc;
    },
    {}
  );

  const sortedDateKeys = Object.keys(groupedTasks).sort();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Kalender & Agenda"
          subtitle="Jadwal seluruh tugas diurutkan berdasarkan tanggal jatuh tempo"
        />

        <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Agenda Tugas
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {tasks.length} tugas terjadwal
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setTaskToEdit(null);
                setIsFormModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <span>➕</span>
              <span>Tambah Tugas</span>
            </button>
          </div>

          {loading ? (
            <div className="space-y-4 py-6">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-32 bg-white rounded-2xl border border-slate-200/60 animate-pulse"
                />
              ))}
            </div>
          ) : sortedDateKeys.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <span className="text-3xl block mb-2">🗓️</span>
              <h3 className="text-sm font-bold text-slate-800">
                Belum ada jadwal tugas
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Jadwalkan tugas Anda sekarang untuk melihatnya di agenda kalender.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedDateKeys.map((dateKey) => {
                const dayTasks = groupedTasks[dateKey];
                return (
                  <div key={dateKey} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                        📅 {formatDate(dateKey)}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        ({dayTasks.length} tugas)
                      </span>
                    </div>

                    <div className="space-y-3 pl-2 border-l-2 border-indigo-100">
                      {dayTasks.map((task) => (
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
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setTaskToEdit(null);
        }}
        onSuccess={fetchCalendarTasks}
        taskToEdit={taskToEdit}
        categories={categories}
      />

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
