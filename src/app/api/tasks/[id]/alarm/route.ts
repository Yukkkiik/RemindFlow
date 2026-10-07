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
    console.error("PATCH /api/tasks/[id]/alarm error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Gagal memproses aksi alarm",
      },
      { status: 500 }
    );
  }
}
