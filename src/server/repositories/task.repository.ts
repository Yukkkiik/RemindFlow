import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { Priority, TaskStatus, Prisma } from "@prisma/client";
import { TaskWithCategory } from "@/types";
import { dueDateDayRange } from "@/utils/date";
import type { ProgressTask } from "@/lib/progress";

export interface TaskFilterOptions {
  filter?: "ALL" | "TODAY" | "UPCOMING" | "COMPLETED";
  status?: TaskStatus;
  priority?: Priority;
  categoryId?: string;
  search?: string;
}

/**
 * Keeps the invariant `status === COMPLETED` <=> `completedAt != null`.
 * Re-saving an already completed task keeps its original completion time.
 */
function completedAtFor(
  nextStatus: TaskStatus,
  current?: { status: TaskStatus; completedAt: Date | null } | null
): Date | null {
  if (nextStatus !== "COMPLETED") return null;
  return current?.status === "COMPLETED" && current.completedAt
    ? current.completedAt
    : new Date();
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
      const today = dueDateDayRange();

      if (options.filter === "TODAY") {
        where.dueDate = {
          gte: today.start,
          lt: today.end,
        };
      } else if (options.filter === "UPCOMING") {
        where.dueDate = {
          gte: today.end,
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
        completedAt: completedAtFor(data.status ?? "TODO"),
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
      const current = await prisma.task.findFirst({
        where: { id, userId },
        select: { status: true, completedAt: true },
      });
      updateData.status = data.status;
      updateData.completedAt = completedAtFor(data.status, current);
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
      throw new NotFoundError("Tugas tidak ditemukan");
    }

    const nextStatus: TaskStatus =
      existing.status === "COMPLETED" ? "TODO" : "COMPLETED";
    const completedAt = completedAtFor(nextStatus, existing);

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
      throw new NotFoundError("Tugas tidak ditemukan");
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
        completedAt: completedAtFor("COMPLETED", existing),
      },
      include: { category: true },
    })) as TaskWithCategory;
  }

  /**
   * Minimal columns for progress metrics: every completed task (streaks need the whole
   * history) plus tasks whose due date falls in [dueFrom, dueTo].
   */
  static async findForProgress(
    userId: string,
    dueFrom: Date,
    dueTo: Date
  ): Promise<ProgressTask[]> {
    return await prisma.task.findMany({
      where: {
        userId,
        OR: [{ status: "COMPLETED" }, { dueDate: { gte: dueFrom, lte: dueTo } }],
      },
      select: {
        status: true,
        dueDate: true,
        dueTime: true,
        completedAt: true,
        priority: true,
        category: { select: { id: true, name: true, color: true } },
      },
    });
  }

  static async getStatistics(userId: string) {
    const today = dueDateDayRange();

    const [total, todo, inProgress, completed, dueToday, highPriority] =
      await Promise.all([
        prisma.task.count({ where: { userId } }),
        prisma.task.count({ where: { userId, status: "TODO" } }),
        prisma.task.count({ where: { userId, status: "IN_PROGRESS" } }),
        prisma.task.count({ where: { userId, status: "COMPLETED" } }),
        prisma.task.count({
          where: {
            userId,
            dueDate: { gte: today.start, lt: today.end },
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
