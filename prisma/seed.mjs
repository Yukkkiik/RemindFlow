// Seeds the demo account. Usage: DEMO_PASSWORD=... npm run db:seed
// If the old stub user (default_user_remindflow) exists, it becomes the demo account and keeps its tasks.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const LEGACY_USER_ID = "default_user_remindflow";
const email = (process.env.DEMO_EMAIL || "demo@remindflow.local").trim().toLowerCase();
const password = process.env.DEMO_PASSWORD;

if (!password || password.length < 8 || password.length > 72) {
  console.error("DEMO_PASSWORD wajib diisi (8-72 karakter).");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const hashed = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });
  const legacy = await prisma.user.findUnique({ where: { id: LEGACY_USER_ID } });

  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { password: hashed } });
    console.log(`Password akun demo ${email} diperbarui.`);
  } else if (legacy) {
    await prisma.user.update({
      where: { id: legacy.id },
      data: { email, password: hashed, name: "Akun Demo" },
    });
    console.log(`User default lama dijadikan akun demo ${email} (task lama tetap ada).`);
  } else {
    // dueDate is stored as UTC midnight of the calendar date (same as the API does)
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
    const dueDate = new Date(today);
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: "Akun Demo",
        tasks: {
          create: [
            { title: "Cek email pagi", dueDate, dueTime: "09:00", priority: "MEDIUM" },
            { title: "Rapat tim mingguan", dueDate, dueTime: "13:00", priority: "HIGH" },
            { title: "Olahraga sore", dueDate, dueTime: "17:30", priority: "LOW" },
          ],
        },
      },
    });
    console.log(`Akun demo ${email} dibuat dengan 3 task contoh.`);
  }

  if (existing && legacy && existing.id !== legacy.id) {
    console.warn(
      `Peringatan: user lama "${LEGACY_USER_ID}" masih ada dengan password palsu (tidak bisa login). Hapus jika tidak dipakai.`
    );
  }
} finally {
  await prisma.$disconnect();
}
