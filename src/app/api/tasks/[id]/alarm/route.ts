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
    const body = await request.json();

    const action = body.action as "dismiss" | "snooze" | "complete";
    const snoozeMinutes = body.snoozeMinutes ? Number(body.snoozeMinutes) : 5;

    if (!["dismiss", "snooze", "complete"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: "Aksi alarm harus 'dismiss', 'snooze', atau 'complete'",
        },
        { status: 400 }
      );
    }

    const updatedTask = await TaskService.handleAlarmAction(
      id,
      user.id,
      action,
      snoozeMinutes
    );

    return NextResponse.json({
      success: true,
      message: `Aksi alarm '${action}' berhasil dijalankan`,
      data: updatedTask,
    });
  } catch (error) {
    return errorResponse(error, "Gagal memproses aksi alarm");
  }
}
