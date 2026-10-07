"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TaskCard from "@/components/task/TaskCard";
import TaskFormModal from "@/components/task/TaskFormModal";
import TaskFilters from "@/components/task/TaskFilters";
import CategoryModal from "@/components/task/CategoryModal";
import DeleteConfirmModal from "@/components/task/DeleteConfirmModal";
import { TaskWithCategory, Category, TaskFilter, Priority } from "@/types";

interface CategoryWithCount extends Category {
  _count?: {
    tasks: number;
  };
}

function TasksContent() {
  const searchParams = useSearchParams();
  const initialFilter = (searchParams.get("filter") as TaskFilter) || "ALL";

  const [tasks, setTasks] = useState<TaskWithCategory[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [currentFilter, setCurrentFilter] = useState<TaskFilter>(initialFilter);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");
  const [categoryId, setCategoryId] = useState<string>("ALL");

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskWithCategory | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskWithCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Synchronize when URL search param changes
  useEffect(() => {
    const urlFilter = searchParams.get("filter") as TaskFilter | null;
    if (urlFilter && ["ALL", "TODAY", "UPCOMING", "COMPLETED"].includes(urlFilter)) {
      setCurrentFilter(urlFilter);
    }
  }, [searchParams]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat kategori:", err);
    }
  }, []);

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (currentFilter !== "ALL") params.set("filter", currentFilter);
      if (priority !== "ALL") params.set("priority", priority);
      if (categoryId !== "ALL") params.set("categoryId", categoryId);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal memuat daftar tugas");
      }

      setTasks(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  }, [currentFilter, priority, categoryId, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Toggle Task Status (Optimistic)
  const handleToggleStatus = async (id: string) => {
    setUpdatingTaskId(id);
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const nextStatus = t.status === "COMPLETED" ? "TODO" : "COMPLETED";
            return { ...t, status: nextStatus };
          }
          return t;
        })
      );

      const res = await fetch(`/api/tasks/${id}/toggle`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengubah status");
      }

      fetchTasks();
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status");
      fetchTasks();
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Open Edit Modal
  const handleEditTask = (task: TaskWithCategory) => {
    setTaskToEdit(task);
    setIsFormModalOpen(true);
  };

  // Open Create Modal
  const handleCreateTask = () => {
    setTaskToEdit(null);
    setIsFormModalOpen(true);
  };

  // Handle Delete Confirmation
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menghapus tugas");
      }

      setTaskToDelete(null);
      fetchTasks();
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus tugas");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Daftar Tugas & Pengingat"
          subtitle="Kelola, jadwalkan, dan pantau status seluruh tugas harian Anda"
        />

        <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Top Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Semua Tugas
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Total {tasks.length} tugas ditemukan
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
              >
                <span>🏷️</span>
                <span>Kelola Kategori</span>
              </button>

              <button
                type="button"
                onClick={handleCreateTask}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <span>➕</span>
                <span>Tambah Tugas Baru</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <TaskFilters
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            search={search}
            onSearchChange={setSearch}
            priority={priority}
            onPriorityChange={setPriority}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            categories={categories}
          />

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={fetchTasks}
                className="text-xs font-bold underline hover:text-rose-900"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Tasks List */}
          {loading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-28 rounded-xl bg-white border border-slate-200/60 animate-pulse p-5"
                />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 text-3xl mx-auto flex items-center justify-center mb-4">
                📋
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Tidak ada tugas ditemukan
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                {search || priority !== "ALL" || categoryId !== "ALL"
                  ? "Coba ubah kriteria pencarian atau filter yang sedang aktif."
                  : "Mulai hari Anda dengan produktif! Klik tombol di bawah untuk membuat tugas pertama Anda."}
              </p>
              <button
                type="button"
                onClick={handleCreateTask}
                className="mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2"
              >
                <span>➕</span>
                <span>Buat Tugas Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleEditTask}
                  onDelete={(t) => setTaskToDelete(t)}
                  isUpdating={updatingTaskId === task.id}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Task Form Modal (Create / Edit) */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setTaskToEdit(null);
        }}
        onSuccess={() => {
          fetchTasks();
          fetchCategories();
        }}
        taskToEdit={taskToEdit}
        categories={categories}
        onOpenCategoryModal={() => {
          setIsFormModalOpen(false);
          setIsCategoryModalOpen(true);
        }}
      />

      {/* Category Manager Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onRefresh={() => {
          fetchCategories();
          fetchTasks();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Hapus Tugas"
        message={`Apakah Anda yakin ingin menghapus tugas "${taskToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={confirmDeleteTask}
        onCancel={() => setTaskToDelete(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
          Memuat halaman tugas...
        </div>
      }
    >
      <TasksContent />
    </Suspense>
  );
}
