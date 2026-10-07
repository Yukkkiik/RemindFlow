import { TaskRepository, TaskFilterOptions } from "../repositories/task.repository";
import { CreateTaskInput, UpdateTaskInput } from "@/lib/validation/task.schema";
import { CategoryRepository } from "../repositories/category.repository";

export class TaskService {
  static async getTasks(userId: string, filters: TaskFilterOptions = {}) {
    return await TaskRepository.findAll(userId, filters);
  }

  static async getTaskById(id: string, userId: string) {
    const task = await TaskRepository.findById(id, userId);
    if (!task) {
      throw new Error("Tugas tidak ditemukan");
    }
    return task;
  }

  static async createTask(userId: string, input: CreateTaskInput) {
    if (input.categoryId) {
      const category = await CategoryRepository.findById(input.categoryId, userId);
      if (!category) {
        throw new Error("Kategori yang dipilih tidak valid atau tidak ditemukan");
      }
    }

    return await TaskRepository.create(userId, {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      dueDate: input.dueDate,
      dueTime: input.dueTime,
      priority: input.priority,
      status: input.status,
      categoryId: input.categoryId || null,
      reminderEnabled: input.reminderEnabled,
      reminderOffset: input.reminderOffset,
    });
  }

  static async updateTask(id: string, userId: string, input: UpdateTaskInput) {
    const existing = await TaskRepository.findById(id, userId);
    if (!existing) {
      throw new Error("Tugas tidak ditemukan");
    }

    if (input.categoryId) {
      const category = await CategoryRepository.findById(input.categoryId, userId);
      if (!category) {
        throw new Error("Kategori yang dipilih tidak valid");
      }
    }

    return await TaskRepository.update(id, userId, {
      title: input.title ? input.title.trim() : undefined,
      description: input.description !== undefined ? input.description?.trim() || null : undefined,
      dueDate: input.dueDate,
      dueTime: input.dueTime,
      priority: input.priority,
      status: input.status,
      categoryId: input.categoryId,
      reminderEnabled: input.reminderEnabled,
      reminderOffset: input.reminderOffset,
    });
  }

  static async deleteTask(id: string, userId: string) {
    const existing = await TaskRepository.findById(id, userId);
    if (!existing) {
      throw new Error("Tugas tidak ditemukan");
    }
    return await TaskRepository.delete(id, userId);
  }

  static async toggleTaskStatus(id: string, userId: string) {
    return await TaskRepository.toggleStatus(id, userId);
  }

  static async handleAlarmAction(
    id: string,
    userId: string,
    action: "dismiss" | "snooze" | "complete",
    snoozeMinutes?: number
  ) {
    return await TaskRepository.handleAlarmAction(
      id,
      userId,
      action,
      snoozeMinutes
    );
  }

  static async getStatistics(userId: string) {
    return await TaskRepository.getStatistics(userId);
  }
}
