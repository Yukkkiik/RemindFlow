import { User } from "@prisma/client";
import { getSessionUserId } from "@/lib/session";
import { UnauthorizedError } from "@/lib/errors";
import { UserRepository } from "@/server/repositories/user.repository";

/**
 * Get the user behind the session cookie. Throws UnauthorizedError (401)
 * when there is no valid session or the user no longer exists.
 */
export async function getCurrentUser(): Promise<User> {
  const userId = await getSessionUserId();
  const user = userId ? await UserRepository.findById(userId) : null;
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}
