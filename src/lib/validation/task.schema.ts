import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Judul tugas wajib diisi")
    .max(255, "Judul tugas maksimal 255 karakter"),
  description: z.string().nullable().optional(),
  dueDate: z.string().min(1, "Tanggal batas waktu (dueDate) wajib diisi"),
  dueTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu harus HH:mm (contoh: 09:30 atau 18:00)"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).default("TODO"),
  categoryId: z.string().nullable().optional(),
  reminderEnabled: z.boolean().default(true),
  reminderOffset: z.number().int().min(0).default(0),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskQuerySchema = z.object({
  filter: z.enum(["ALL", "TODAY", "UPCOMING", "COMPLETED"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
