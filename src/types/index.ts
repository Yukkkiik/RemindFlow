import { Priority, TaskStatus, Task, Category, User } from "@prisma/client";

export { Priority, TaskStatus };
export type { Task, Category, User };

export type TaskWithCategory = Task & {
  category: Category | null;
};

export type TaskFilter = "ALL" | "TODAY" | "UPCOMING" | "COMPLETED";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
}

export type ReminderOffsetOption = {
  label: string;
  value: number; // in minutes
};

export const REMINDER_OFFSETS: ReminderOffsetOption[] = [
  { label: "At time of event", value: 0 },
  { label: "5 minutes before", value: 5 },
  { label: "10 minutes before", value: 10 },
  { label: "15 minutes before", value: 15 },
  { label: "30 minutes before", value: 30 },
  { label: "1 hour before", value: 60 },
  { label: "1 day before", value: 1440 },
];
