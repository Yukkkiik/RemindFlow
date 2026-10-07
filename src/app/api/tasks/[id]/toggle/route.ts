import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { TaskService } from "@/server/services/task.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const updatedTask = await TaskService.toggleTaskStatus(id, user.id);

    return NextResponse.json({
      success: true,
      message: `Status tugas diubah menjadi ${updatedTask.status}`,
      data: updatedTask,
    });
  } catch (error) {
    console.error("PATCH /api/tasks/[id]/toggle error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengubah status tugas",
      },
      { status: 500 }
    );
  }
}
