"use client";

import { useState, useEffect } from "react";
import { TaskWithCategory, Category, Priority, TaskStatus, REMINDER_OFFSETS } from "@/types";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskToEdit?: TaskWithCategory | null;
  categories: Category[];
  onOpenCategoryModal?: () => void;
}

export default function TaskFormModal({
  isOpen,
  onClose,
  onSuccess,
  taskToEdit,
  categories,
  onOpenCategoryModal,
}: TaskFormModalProps) {
  const isEditing = Boolean(taskToEdit);

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getDefaultTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    const hh = String(d.getHours()).padStart(2, "0");
    return `${hh}:00`;
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState(getDefaultTime());
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [categoryId, setCategoryId] = useState<string>("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderOffset, setReminderOffset] = useState<number>(15);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate or reset form whenever modal opens or taskToEdit changes
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || "");

      const dateStr = new Date(taskToEdit.dueDate).toISOString().split("T")[0];
      setDueDate(dateStr);
      setDueTime(taskToEdit.dueTime || "12:00");
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setCategoryId(taskToEdit.categoryId || "");
      setReminderEnabled(taskToEdit.reminderEnabled);
      setReminderOffset(taskToEdit.reminderOffset);
    } else {
      setTitle("");
      setDescription("");
      setDueDate(getTodayDateString());
      setDueTime(getDefaultTime());
      setPriority("MEDIUM");
      setStatus("TODO");
      setCategoryId("");
      setReminderEnabled(true);
      setReminderOffset(15);
    }
    setError(null);
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Judul tugas wajib diisi");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      dueDate,
      dueTime,
      priority,
      status,
      categoryId: categoryId || null,
      reminderEnabled,
      reminderOffset: Number(reminderOffset),
    };

    try {
      const url = isEditing ? `/api/tasks/${taskToEdit!.id}` : `/api/tasks`;
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan tugas");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isEditing ? "Edit Tugas" : "Tambah Tugas Baru"}
            </h2>
            <p className="text-xs text-slate-500">
              {isEditing
                ? "Perbarui detail dan jadwal pengingat tugas"
                : "Buat tugas baru lengkap dengan pengingat & prioritas"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Selesaikan laporan bulanan"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi (Opsional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan detail catatan atau instruksi..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tanggal Batas Waktu <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Jam Batas Waktu <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              />
            </div>
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                <option value="LOW">🟢 Rendah (Low)</option>
                <option value="MEDIUM">🔵 Sedang (Medium)</option>
                <option value="HIGH">🟠 Tinggi (High)</option>
                <option value="URGENT">🔴 Mendesak (Urgent)</option>
              </select>
            </div>

            {/* Category Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Kategori
                </label>
                {onOpenCategoryModal && (
                  <button
                    type="button"
                    onClick={onOpenCategoryModal}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    + Kelola
                  </button>
                )}
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                <option value="">Tanpa Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status (If editing) */}
          {isEditing && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Status Tugas
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                <option value="TODO">Belum Dikerjakan (TODO)</option>
                <option value="IN_PROGRESS">Sedang Berjalan (IN PROGRESS)</option>
                <option value="COMPLETED">Selesai (COMPLETED)</option>
              </select>
            </div>
          )}

          {/* Reminder Settings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🔔</span>
                <span className="text-sm font-semibold text-slate-800">
                  Aktifkan Pengingat & Alarm
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {reminderEnabled && (
              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">
                  Waktu Pengingat Sebelum Batas Waktu
                </label>
                <select
                  value={reminderOffset}
                  onChange={(e) => setReminderOffset(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-indigo-600"
                >
                  {REMINDER_OFFSETS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : isEditing ? (
                "Simpan Perubahan"
              ) : (
                "Buat Tugas"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
