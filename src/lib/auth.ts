import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

const DEFAULT_USER_ID = "default_user_remindflow";
const DEFAULT_USER_EMAIL = "user@remindflow.local";

/**
 * Ensures a default user exists in the database.
 * This guarantees CRUD operations work without auth friction during development or demo.
 */
export async function getOrCreateDefaultUser(): Promise<User> {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ id: DEFAULT_USER_ID }, { email: DEFAULT_USER_EMAIL }],
    },
  });

  if (existingUser) {
    return existingUser;
  }

  // Create default user if not found
  return await prisma.user.create({
    data: {
      id: DEFAULT_USER_ID,
      name: "Pengguna RemindFlow",
      email: DEFAULT_USER_EMAIL,
      password: "dev_password_hashed",
    },
  });
}

/**
 * Get current user. Supports session headers in the future,
 * defaults to the default/demo user.
 */
export async function getCurrentUser(): Promise<User> {
  return await getOrCreateDefaultUser();
}
