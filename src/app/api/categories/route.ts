import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";
import { CategoryService } from "@/server/services/category.service";
import { createCategorySchema } from "@/lib/validation/category.schema";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const categories = await CategoryService.getCategories(user.id);

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return errorResponse(error, "Gagal memuat kategori");
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const validation = createCategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data kategori tidak valid",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const category = await CategoryService.createCategory(user.id, validation.data);

    return NextResponse.json(
      {
        success: true,
        message: "Kategori berhasil dibuat",
        data: category,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error, "Gagal membuat kategori");
  }
}
