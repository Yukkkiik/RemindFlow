"use client";

import { TaskFilter, Priority, Category } from "@/types";

interface TaskFiltersProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
  priority: Priority | "ALL";
  onPriorityChange: (priority: Priority | "ALL") => void;
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  categories: Category[];
}

export default function TaskFilters({
  currentFilter,
  onFilterChange,
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  categoryId,
  onCategoryChange,
  categories,
}: TaskFiltersProps) {
  const tabs: { key: TaskFilter; label: string; icon: string }[] = [
    { key: "ALL", label: "Semua", icon: "📑" },
    { key: "TODAY", label: "Hari Ini", icon: "📅" },
    { key: "UPCOMING", label: "Mendatang", icon: "⏳" },
    { key: "COMPLETED", label: "Selesai", icon: "✅" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
      {/* Top row: Preset Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Preset Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = currentFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onFilterChange(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari berdasarkan judul atau deskripsi..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Dropdown Filters (Category & Priority) */}
      <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-slate-100 text-xs">
        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
          Filter Berdasarkan:
        </span>

        {/* Priority Filter */}
        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value as Priority | "ALL")}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700 text-xs font-medium focus:outline-none focus:border-indigo-600"
        >
          <option value="ALL">Semua Prioritas</option>
          <option value="URGENT">🔴 Mendesak (Urgent)</option>
          <option value="HIGH">🟠 Tinggi (High)</option>
          <option value="MEDIUM">🔵 Sedang (Medium)</option>
          <option value="LOW">🟢 Rendah (Low)</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-700 text-xs font-medium focus:outline-none focus:border-indigo-600"
        >
          <option value="ALL">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Reset Filter Button if active */}
        {(priority !== "ALL" || categoryId !== "ALL" || search) && (
          <button
            type="button"
            onClick={() => {
              onPriorityChange("ALL");
              onCategoryChange("ALL");
              onSearchChange("");
            }}
            className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
          >
            Reset Filter
          </button>
        )}
      </div>
    </div>
  );
}
