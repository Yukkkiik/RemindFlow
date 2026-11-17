import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toPublicUser } from "@/server/services/auth.service";
import { errorResponse } from "@/lib/errors";

export async function GET() {
  try {
    const user = await getCurrentUser();

    return NextResponse.json({
      success: true,
      data: toPublicUser(user),
    });
  } catch (error) {
    return errorResponse(error, "Gagal memuat data pengguna");
  }
}
