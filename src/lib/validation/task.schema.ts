import { z } from "zod";

const taskFields = z.object({
  title: z
    .string()
    .min(1, "Judul tugas wajib diisi")
    .max(255, "Judul tugas maksimal 255 karakter"),
  description: z.string().max(5000, "Deskripsi maksimal 5000 karakter").nullable().optional(),
  // Calendar date only: dueDate is stored as UTC midnight and the day logic relies on that
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
    .refine((value) => {
      // refine also runs when the regex failed, and toISOString() throws on Invalid Date
      const time = Date.parse(`${value}T00:00:00.000Z`);
      return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value;
    }, "Tanggal tidak valid"),
  dueTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu harus HH:mm (contoh: 09:30 atau 18:00)"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]),
  categoryId: z.string().max(191).nullable().optional(),
  reminderEnabled: z.boolean(),
  reminderOffset: z.number().int().min(0).max(10080), // up to one week
});

export const createTaskSchema = taskFields.extend({
  priority: taskFields.shape.priority.default("MEDIUM"),
  status: taskFields.shape.status.default("TODO"),
  reminderEnabled: taskFields.shape.reminderEnabled.default(true),
  reminderOffset: taskFields.shape.reminderOffset.default(0),
});

// No defaults here: a partial update must not reset fields the client did not send
export const updateTaskSchema = taskFields.partial();

export const taskQuerySchema = z.object({
  filter: z.enum(["ALL", "TODAY", "UPCOMING", "COMPLETED"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  categoryId: z.string().max(191).optional(),
  search: z.string().max(100).optional(),
});

export const alarmActionSchema = z.object({
  action: z.enum(["dismiss", "snooze", "complete"]),
  snoozeMinutes: z.number().int().min(1).max(1440).default(5),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AlarmActionInput = z.infer<typeof alarmActionSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
