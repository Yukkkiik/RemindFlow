import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";
import { TaskService } from "@/server/services/task.service";
import { updateTaskSchema } from "@/lib/validation/task.schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const task = await TaskService.getTaskById(id, user.id);

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    return errorResponse(error, "Tugas tidak ditemukan");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const body = await request.json();

    const validation = updateTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data pembaruan tidak valid",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const updatedTask = await TaskService.updateTask(id, user.id, validation.data);

    return NextResponse.json({
      success: true,
      message: "Tugas berhasil diperbarui",
      data: updatedTask,
    });
  } catch (error) {
    return errorResponse(error, "Gagal memperbarui tugas");
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    await TaskService.deleteTask(id, user.id);

    return NextResponse.json({
      success: true,
      message: "Tugas berhasil dihapus",
    });
  } catch (error) {
    return errorResponse(error, "Gagal menghapus tugas");
  }
}
