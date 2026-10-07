import { prisma } from "@/lib/prisma";
import { Priority, TaskStatus, Prisma } from "@prisma/client";
import { TaskWithCategory } from "@/types";

export interface TaskFilterOptions {
  filter?: "ALL" | "TODAY" | "UPCOMING" | "COMPLETED";
  status?: TaskStatus;
  priority?: Priority;
  categoryId?: string;
  search?: string;
}

export class TaskRepository {
  static async findAll(
    userId: string,
    options: TaskFilterOptions = {}
  ): Promise<TaskWithCategory[]> {
    const where: Prisma.TaskWhereInput = {
      userId,
    };

    // Filter by specific status if provided
    if (options.status) {
      where.status = options.status;
    }

    // Filter by priority
    if (options.priority) {
      where.priority = options.priority;
    }

    // Filter by category
    if (options.categoryId) {
      where.categoryId = options.categoryId;
    }

    // Search query on title or description
    if (options.search && options.search.trim()) {
      const term = options.search.trim();
      where.OR = [
        { title: { contains: term } },
        { description: { contains: term } },
      ];
    }

    // Date/Status preset filter
    if (options.filter) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      if (options.filter === "TODAY") {
        where.dueDate = {
          gte: startOfDay,
          lte: endOfDay,
        };
      } else if (options.filter === "UPCOMING") {
        where.dueDate = {
          gt: endOfDay,
        };
        where.status = {
          not: "COMPLETED",
        };
      } else if (options.filter === "COMPLETED") {
        where.status = "COMPLETED";
      }
    }

    return (await prisma.task.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
        { dueTime: "asc" },
      ],
    })) as TaskWithCategory[];
  }

  static async findById(id: string, userId: string): Promise<TaskWithCategory | null> {
    return (await prisma.task.findFirst({
      where: { id, userId },
      include: { category: true },
    })) as TaskWithCategory | null;
  }

  static async create(
    userId: string,
    data: {
      title: string;
      description?: string | null;
      dueDate: Date | string;
      dueTime: string;
      priority?: Priority;
      status?: TaskStatus;
      categoryId?: string | null;
      reminderEnabled?: boolean;
      reminderOffset?: number;
    }
  ): Promise<TaskWithCategory> {
    const dueDateParsed =
      typeof data.dueDate === "string" ? new Date(data.dueDate) : data.dueDate;

    return (await prisma.task.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        dueDate: dueDateParsed,
        dueTime: data.dueTime,
        priority: data.priority ?? "MEDIUM",
        status: data.status ?? "TODO",
        categoryId: data.categoryId || null,
        reminderEnabled: data.reminderEnabled ?? true,
        reminderOffset: data.reminderOffset ?? 0,
      },
      include: {
        category: true,
      },
    })) as TaskWithCategory;
  }

  static async update(
    id: string,
    userId: string,
    data: {
      title?: string;
      description?: string | null;
      dueDate?: Date | string;
      dueTime?: string;
      priority?: Priority;
      status?: TaskStatus;
      categoryId?: string | null;
      reminderEnabled?: boolean;
      reminderOffset?: number;
    }
  ): Promise<TaskWithCategory> {
    const updateData: Prisma.TaskUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate !== undefined) {
      updateData.dueDate =
        typeof data.dueDate === "string" ? new Date(data.dueDate) : data.dueDate;
    }
    if (data.dueTime !== undefined) updateData.dueTime = data.dueTime;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.reminderEnabled !== undefined)
      updateData.reminderEnabled = data.reminderEnabled;
    if (data.reminderOffset !== undefined)
      updateData.reminderOffset = data.reminderOffset;

    if (data.categoryId !== undefined) {
      if (data.categoryId) {
        updateData.category = { connect: { id: data.categoryId } };
      } else {
        updateData.category = { disconnect: true };
      }
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "COMPLETED") {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    return (await prisma.task.update({
      where: { id, userId },
      data: updateData,
      include: {
        category: true,
      },
    })) as TaskWithCategory;
  }

  static async delete(id: string, userId: string): Promise<TaskWithCategory> {
    return (await prisma.task.delete({
      where: { id, userId },
      include: {
        category: true,
      },
    })) as TaskWithCategory;
  }

  static async toggleStatus(id: string, userId: string): Promise<TaskWithCategory> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error("Tugas tidak ditemukan");
    }

    const nextStatus: TaskStatus =
      existing.status === "COMPLETED" ? "TODO" : "COMPLETED";
    const completedAt = nextStatus === "COMPLETED" ? new Date() : null;

    return (await prisma.task.update({
      where: { id, userId },
      data: {
        status: nextStatus,
        completedAt,
      },
      include: {
        category: true,
      },
    })) as TaskWithCategory;
  }

  static async handleAlarmAction(
    id: string,
    userId: string,
    action: "dismiss" | "snooze" | "complete",
    snoozeMinutes = 5
  ): Promise<TaskWithCategory> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new Error("Tugas tidak ditemukan");
    }

    if (action === "dismiss") {
      return (await prisma.task.update({
        where: { id, userId },
        data: {
          lastTriggeredAt: new Date(),
          snoozedUntil: null,
        },
        include: { category: true },
      })) as TaskWithCategory;
    }

    if (action === "snooze") {
      const snoozedUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000);
      return (await prisma.task.update({
        where: { id, userId },
        data: {
          lastTriggeredAt: new Date(),
          snoozedUntil,
        },
        include: { category: true },
      })) as TaskWithCategory;
    }

    // action === "complete"
    return (await prisma.task.update({
      where: { id, userId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
      include: { category: true },
    })) as TaskWithCategory;
  }

  static async getStatistics(userId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [total, todo, inProgress, completed, dueToday, highPriority] =
      await Promise.all([
        prisma.task.count({ where: { userId } }),
        prisma.task.count({ where: { userId, status: "TODO" } }),
        prisma.task.count({ where: { userId, status: "IN_PROGRESS" } }),
        prisma.task.count({ where: { userId, status: "COMPLETED" } }),
        prisma.task.count({
          where: {
            userId,
            dueDate: { gte: startOfDay, lte: endOfDay },
            status: { not: "COMPLETED" },
          },
        }),
        prisma.task.count({
          where: {
            userId,
            priority: { in: ["HIGH", "URGENT"] },
            status: { not: "COMPLETED" },
          },
        }),
      ]);

    return {
      total,
      todo,
      inProgress,
      completed,
      dueToday,
      highPriority,
    };
  }
}
