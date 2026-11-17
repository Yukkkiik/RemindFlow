import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";
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
    return errorResponse(error, "Gagal mengubah status tugas");
  }
}
