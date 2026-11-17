import { compare, hash } from "bcryptjs";
import { Prisma, User } from "@prisma/client";
import { UserRepository } from "../repositories/user.repository";
import { LoginInput, RegisterInput } from "@/lib/validation/auth.schema";
import { ConflictError, UnauthorizedError } from "@/lib/errors";

const BCRYPT_COST = 12;
// Compared against when the email is unknown, so response time does not reveal registered emails
const DUMMY_HASH = "$2b$12$mZf/BR6l4pOZMfDprunU9O3WdFdP5a0WeXIEIrsbew37W9DJqJR0a";

export type PublicUser = Pick<User, "id" | "name" | "email">;

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email };
}

export class AuthService {
  static async register(input: RegisterInput): Promise<PublicUser> {
    const password = await hash(input.password, BCRYPT_COST);
    try {
      const user = await UserRepository.create({
        name: input.name,
        email: input.email,
        password,
      });
      return toPublicUser(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("Email sudah terdaftar");
      }
      throw error;
    }
  }

  static async login(input: LoginInput): Promise<PublicUser> {
    const user = await UserRepository.findByEmail(input.email);
    const valid = await compare(input.password, user?.password ?? DUMMY_HASH);
    if (!user || !valid) {
      throw new UnauthorizedError("Email atau password salah");
    }
    return toPublicUser(user);
  }
}
