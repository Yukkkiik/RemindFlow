import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(191, "Email maksimal 191 karakter")
  .pipe(z.email("Format email tidak valid"));

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
  email: emailSchema,
  // bcrypt only uses the first 72 bytes
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(72, "Password maksimal 72 karakter"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password wajib diisi").max(72, "Password maksimal 72 karakter"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
