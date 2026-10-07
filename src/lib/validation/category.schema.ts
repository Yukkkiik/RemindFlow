import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Nama kategori wajib diisi")
    .max(50, "Nama kategori maksimal 50 karakter"),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Format warna harus berupa kode HEX (#6366f1)")
    .default("#6366f1"),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
