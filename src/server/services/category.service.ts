import { CategoryRepository } from "../repositories/category.repository";
import { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validation/category.schema";

const DEFAULT_CATEGORIES = [
  { name: "Pekerjaan", color: "#6366f1" },
  { name: "Pribadi", color: "#10b981" },
  { name: "Belajar", color: "#f59e0b" },
  { name: "Urgent", color: "#ef4444" },
];

export class CategoryService {
  static async getCategories(userId: string) {
    let categories = await CategoryRepository.findByUserId(userId);

    // Auto-seed helpful default categories if none exist yet
    if (categories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        try {
          await CategoryRepository.create(userId, cat);
        } catch {
          // ignore unique constraint if any
        }
      }
      categories = await CategoryRepository.findByUserId(userId);
    }

    return categories;
  }

  static async getCategoryById(id: string, userId: string) {
    const category = await CategoryRepository.findById(id, userId);
    if (!category) {
      throw new Error("Kategori tidak ditemukan");
    }
    return category;
  }

  static async createCategory(userId: string, input: CreateCategoryInput) {
    const existing = await CategoryRepository.findByName(userId, input.name.trim());
    if (existing) {
      throw new Error(`Kategori dengan nama "${input.name}" sudah ada`);
    }

    return await CategoryRepository.create(userId, {
      name: input.name.trim(),
      color: input.color || "#6366f1",
    });
  }

  static async updateCategory(id: string, userId: string, input: UpdateCategoryInput) {
    const category = await CategoryRepository.findById(id, userId);
    if (!category) {
      throw new Error("Kategori tidak ditemukan");
    }

    if (input.name && input.name.trim() !== category.name) {
      const existing = await CategoryRepository.findByName(userId, input.name.trim());
      if (existing) {
        throw new Error(`Kategori dengan nama "${input.name}" sudah digunakan`);
      }
    }

    return await CategoryRepository.update(id, userId, {
      name: input.name ? input.name.trim() : undefined,
      color: input.color,
    });
  }

  static async deleteCategory(id: string, userId: string) {
    const category = await CategoryRepository.findById(id, userId);
    if (!category) {
      throw new Error("Kategori tidak ditemukan");
    }
    return await CategoryRepository.delete(id, userId);
  }
}
