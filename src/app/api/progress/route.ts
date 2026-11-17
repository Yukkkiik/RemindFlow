import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";
import { ProgressService } from "@/server/services/progress.service";
import { progressQuerySchema } from "@/lib/validation/progress.schema";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);

    const validation = progressQuerySchema.safeParse({
      range: searchParams.get("range") ?? undefined,
    });
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Parameter range tidak valid (gunakan 7d, 30d, atau 90d)",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const data = await ProgressService.getProgress(user.id, validation.data.range);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return errorResponse(error, "Gagal memuat data progress");
  }
}
