import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";

export class CategoryRepository {
  static async findByUserId(userId: string) {
    return await prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  static async findById(id: string, userId: string): Promise<Category | null> {
    return await prisma.category.findFirst({
      where: { id, userId },
    });
  }

  static async findByName(userId: string, name: string): Promise<Category | null> {
    return await prisma.category.findUnique({
      where: {
        userId_name: {
          userId,
          name,
        },
      },
    });
  }

  static async create(
    userId: string,
    data: { name: string; color: string }
  ): Promise<Category> {
    return await prisma.category.create({
      data: {
        userId,
        name: data.name,
        color: data.color,
      },
    });
  }

  static async update(
    id: string,
    userId: string,
    data: { name?: string; color?: string }
  ): Promise<Category> {
    return await prisma.category.update({
      where: { id, userId },
      data,
    });
  }

  static async delete(id: string, userId: string): Promise<Category> {
    return await prisma.category.delete({
      where: { id, userId },
    });
  }
}
