"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { TaskWithCategory } from "@/types";
import { calculateReminderTriggerTime } from "@/utils/date";
import { startAlarmSound, stopAlarmSound, playTestSound } from "@/utils/sound";
import AlarmDialog from "./AlarmDialog";

export default function AlarmManager() {
  const [activeAlarmTask, setActiveAlarmTask] = useState<TaskWithCategory | null>(null);
  const tasksRef = useRef<TaskWithCategory[]>([]);
  const triggeredIdsRef = useRef<Set<string>>(new Set());

  // Unlock AudioContext on first user interaction anywhere on page
  useEffect(() => {
    const unlockAudio = () => {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const dummyCtx = new AudioCtx();
        if (dummyCtx.state === "suspended") {
          dummyCtx.resume();
        }
      }
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };

    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  // Fetch upcoming active tasks
  const fetchTasksForReminders = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        // Filter tasks that need reminders
        tasksRef.current = json.data.filter(
          (t: TaskWithCategory) => t.status !== "COMPLETED" && t.reminderEnabled
        );
      }
    } catch {
      // Background check error ignored
    }
  }, []);

  // Trigger alarm for a task
  const triggerAlarm = useCallback((task: TaskWithCategory) => {
    if (activeAlarmTask) return; // one active alarm at a time

    triggeredIdsRef.current.add(task.id);
    setActiveAlarmTask(task);
    startAlarmSound();

    // Browser Notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`⏰ Pengingat: ${task.title}`, {
        body: `Jatuh tempo pada ${task.dueTime}! Periksa tugas Anda sekarang.`,
        icon: "/favicon.ico",
      });
    }
  }, [activeAlarmTask]);

  // Check alarm times every 5 seconds
  useEffect(() => {
    fetchTasksForReminders();
    const fetchInterval = setInterval(fetchTasksForReminders, 15000);

    const checkInterval = setInterval(() => {
      if (activeAlarmTask) return;

      const now = new Date();
      for (const task of tasksRef.current) {
        if (triggeredIdsRef.current.has(task.id)) continue;

        // Check if snoozed
        if (task.snoozedUntil) {
          const snoozeDate = new Date(task.snoozedUntil);
          if (now >= snoozeDate) {
            triggerAlarm(task);
            break;
          }
          continue;
        }

        // If already triggered and not snoozed, skip
        if (task.lastTriggeredAt) continue;

        // Calculate trigger time
        try {
          const triggerTime = calculateReminderTriggerTime(
            task.dueDate,
            task.dueTime,
            task.reminderOffset || 0
          );

          // If trigger time has arrived (within last 24 hours to prevent ringing for ancient tasks)
          const timeDiff = now.getTime() - triggerTime.getTime();
          if (timeDiff >= 0 && timeDiff < 24 * 60 * 60 * 1000) {
            triggerAlarm(task);
            break;
          }
        } catch (e) {
          console.error("Error calculating trigger time:", e);
        }
      }
    }, 5000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(checkInterval);
    };
  }, [fetchTasksForReminders, triggerAlarm, activeAlarmTask]);

  // Alarm actions
  const handleDismiss = async () => {
    stopAlarmSound();
    if (!activeAlarmTask) return;

    const taskId = activeAlarmTask.id;
    setActiveAlarmTask(null);

    try {
      await fetch(`/api/tasks/${taskId}/alarm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss" }),
      });
      fetchTasksForReminders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSnooze = async (minutes: number) => {
    stopAlarmSound();
    if (!activeAlarmTask) return;

    const taskId = activeAlarmTask.id;
    triggeredIdsRef.current.delete(taskId); // Allow re-trigger after snooze
    setActiveAlarmTask(null);

    try {
      await fetch(`/api/tasks/${taskId}/alarm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "snooze", snoozeMinutes: minutes }),
      });
      fetchTasksForReminders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async () => {
    stopAlarmSound();
    if (!activeAlarmTask) return;

    const taskId = activeAlarmTask.id;
    setActiveAlarmTask(null);

    try {
      await fetch(`/api/tasks/${taskId}/alarm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
      fetchTasksForReminders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {activeAlarmTask && (
        <AlarmDialog
          task={activeAlarmTask}
          onDismiss={handleDismiss}
          onSnooze={handleSnooze}
          onComplete={handleComplete}
        />
      )}
    </>
  );
}

export { playTestSound };
