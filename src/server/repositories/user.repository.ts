import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

export class UserRepository {
  static async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { id } });
  }

  static async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }

  static async create(data: { name: string; email: string; password: string }): Promise<User> {
    return await prisma.user.create({ data });
  }
}
