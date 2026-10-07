"use client";

import { TaskWithCategory } from "@/types";
import { formatDate } from "@/utils/date";

interface AlarmDialogProps {
  task: TaskWithCategory;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  onComplete: () => void;
}

export default function AlarmDialog({
  task,
  onDismiss,
  onSnooze,
  onComplete,
}: AlarmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-indigo-500 overflow-hidden text-center p-6 sm:p-8 space-y-6 animate-bounce-short">
        {/* Animated Ringing Bell Icon */}
        <div className="relative inline-flex items-center justify-center mx-auto">
          <div className="absolute w-20 h-20 rounded-full bg-indigo-500/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-4xl shadow-lg shadow-indigo-500/30">
            ⏰
          </div>
        </div>

        {/* Alarm Banner & Title */}
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-extrabold uppercase tracking-widest mb-2 border border-rose-200">
            🚨 Alarm Pengingat Berbunyi
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {task.title}
          </h2>
          {task.description && (
            <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-3">
              {task.description}
            </p>
          )}
        </div>

        {/* Task Details Pill */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-around font-medium">
          <div className="flex items-center gap-1.5">
            <span>📅</span>
            <span>{formatDate(task.dueDate)}</span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <span>⏰</span>
            <span className="font-bold text-slate-900">{task.dueTime}</span>
          </div>
          {task.category && (
            <>
              <div className="h-4 w-px bg-slate-300" />
              <div className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: task.category.color }}
                />
                <span>{task.category.name}</span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Complete button */}
          <button
            type="button"
            onClick={onComplete}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>✅</span>
            <span>Tandai Selesai</span>
          </button>

          {/* Snooze options */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSnooze(5)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              ⏳ Tunda 5 Mnt
            </button>
            <button
              type="button"
              onClick={() => onSnooze(10)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              ⏳ Tunda 10 Mnt
            </button>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Matikan Suara Alarm
          </button>
        </div>
      </div>
    </div>
  );
}
