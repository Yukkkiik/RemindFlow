"use client";

import { useState } from "react";
import { Category } from "@/types";

interface CategoryWithCount extends Category {
  _count?: {
    tasks: number;
  };
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryWithCount[];
  onRefresh: () => void;
}

const COLOR_PRESETS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Rose
  "#06b6d4", // Cyan
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#64748b", // Slate
];

export default function CategoryModal({
  isOpen,
  onClose,
  categories,
  onRefresh,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal membuat kategori");
      }

      setName("");
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Hapus kategori ini? Tugas yang ada tidak akan terhapus.")) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menghapus kategori");
      }

      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus kategori");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800">Kelola Kategori</h2>
            <p className="text-xs text-slate-500">
              Atur kategori untuk mengelompokkan tugas Anda
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nama Kategori Baru
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Misal: Proyek Kantor, Belanja..."
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Color Swatches */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Pilih Warna Label
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setColor(preset)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === preset
                        ? "ring-2 ring-offset-2 ring-indigo-500 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: preset }}
                    title={preset}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full mt-2 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? "Menambahkan..." : "+ Tambah Kategori"}
            </button>
          </form>

          {/* Existing Categories List */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Daftar Kategori ({categories.length})
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {categories.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  Belum ada kategori
                </p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm font-medium text-slate-800">
                        {cat.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({cat._count?.tasks ?? 0} tugas)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                      title="Hapus kategori"
                    >
                      <svg
                        className="w-4 h-4 stroke-current stroke-2 fill-none"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
