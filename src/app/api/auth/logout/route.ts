import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";
import { errorResponse } from "@/lib/errors";

export async function POST() {
  try {
    await destroySession();

    return NextResponse.json({
      success: true,
      message: "Logout berhasil",
    });
  } catch (error) {
    return errorResponse(error, "Gagal melakukan logout");
  }
}
