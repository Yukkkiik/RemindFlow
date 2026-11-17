import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";
import { CategoryService } from "@/server/services/category.service";
import { updateCategorySchema } from "@/lib/validation/category.schema";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const body = await request.json();

    const validation = updateCategorySchema.safeParse(body);
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

    const updated = await CategoryService.updateCategory(id, user.id, validation.data);

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    return errorResponse(error, "Gagal memperbarui kategori");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    await CategoryService.deleteCategory(id, user.id);

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    return errorResponse(error, "Gagal menghapus kategori");
  }
}
