import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";
import { TaskService } from "@/server/services/task.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const stats = await TaskService.getStatistics(user.id);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return errorResponse(error, "Gagal memuat statistik");
  }
}
