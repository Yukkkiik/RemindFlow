import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";
import { TaskService } from "@/server/services/task.service";
import { alarmActionSchema } from "@/lib/validation/task.schema";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const body = await request.json();

    const validation = alarmActionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Aksi alarm tidak valid (dismiss, snooze, atau complete; snooze 1-1440 menit)",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }
    const { action, snoozeMinutes } = validation.data;

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
