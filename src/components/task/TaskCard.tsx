"use client";

import { TaskWithCategory, Priority, TaskStatus } from "@/types";
import { formatDate } from "@/utils/date";

interface TaskCardProps {
  task: TaskWithCategory;
  onToggleStatus: (id: string) => Promise<void>;
  onEdit: (task: TaskWithCategory) => void;
  onDelete: (task: TaskWithCategory) => void;
  isUpdating?: boolean;
}

export default function TaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  isUpdating = false,
}: TaskCardProps) {
  const isCompleted = task.status === "COMPLETED";

  // Priority color and label helper
  const priorityConfig: Record<
    Priority,
    { label: string; bg: string; text: string; border: string }
  > = {
    LOW: {
      label: "Rendah",
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
    },
    MEDIUM: {
      label: "Sedang",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    HIGH: {
      label: "Tinggi",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    URGENT: {
      label: "Mendesak",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
    },
  };

  const statusConfig: Record<
    TaskStatus,
    { label: string; bg: string; text: string }
  > = {
    TODO: {
      label: "Belum Dikerjakan",
      bg: "bg-slate-100",
      text: "text-slate-700",
    },
    IN_PROGRESS: {
      label: "Sedang Berjalan",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
    },
    COMPLETED: {
      label: "Selesai",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
  };

  const priorityStyle = priorityConfig[task.priority] || priorityConfig.MEDIUM;
  const statusStyle = statusConfig[task.status] || statusConfig.TODO;

  // Format date readable
  const dueDateStr = task.dueDate ? formatDate(task.dueDate) : "-";

  return (
    <div
      className={`group relative bg-white rounded-xl border p-5 transition-all duration-200 hover:shadow-md ${
        isCompleted
          ? "border-slate-200/80 bg-slate-50/50 opacity-80"
          : "border-slate-200 hover:border-indigo-200"
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Quick Complete / Toggle Checkbox */}
        <button
          type="button"
          onClick={() => onToggleStatus(task.id)}
          disabled={isUpdating}
          className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20"
              : "border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 text-transparent"
          }`}
          title={isCompleted ? "Tandai belum selesai" : "Tandai selesai"}
          aria-label="Toggle task status"
        >
          <svg
            className="w-4 h-4 stroke-current stroke-[2.5] fill-none"
            viewBox="0 0 24 24"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {/* Category Tag */}
            {task.category && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: `${task.category.color}15`,
                  color: task.category.color,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: task.category.color }}
                />
                {task.category.name}
              </span>
            )}

            {/* Priority Badge */}
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
            >
              {priorityStyle.label}
            </span>

            {/* Status Badge */}
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-md ${statusStyle.bg} ${statusStyle.text}`}
            >
              {statusStyle.label}
            </span>
          </div>

          <h3
            className={`text-base font-semibold transition-colors ${
              isCompleted
                ? "text-slate-400 line-through"
                : "text-slate-900 group-hover:text-indigo-600"
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p
              className={`text-sm mt-1 line-clamp-2 ${
                isCompleted ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Time, Due Date, and Reminder Info */}
          <div className="mt-3 flex items-center gap-4 flex-wrap text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium">
              <span>📅</span>
              <span>{dueDateStr}</span>
            </div>

            <div className="flex items-center gap-1.5 font-medium">
              <span>⏰</span>
              <span>{task.dueTime}</span>
            </div>

            {task.reminderEnabled && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                <span>🔔</span>
                <span>
                  {task.reminderOffset === 0
                    ? "Tepat waktu"
                    : `${task.reminderOffset} mnt sblm`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Edit Tugas"
            aria-label="Edit task"
          >
            <svg
              className="w-4 h-4 fill-none stroke-current stroke-2"
              viewBox="0 0 24 24"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Hapus Tugas"
            aria-label="Delete task"
          >
            <svg
              className="w-4 h-4 fill-none stroke-current stroke-2"
              viewBox="0 0 24 24"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
