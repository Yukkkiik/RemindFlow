import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
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
    console.error("GET /api/tasks/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Tugas tidak ditemukan",
      },
      { status: 404 }
    );
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
    console.error("PATCH /api/tasks/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Gagal memperbarui tugas",
      },
      { status: 500 }
    );
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
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Gagal menghapus tugas",
      },
      { status: 500 }
    );
  }
}
