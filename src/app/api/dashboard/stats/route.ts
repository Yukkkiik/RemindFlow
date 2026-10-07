import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
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
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Gagal memuat statistik",
      },
      { status: 500 }
    );
  }
}
