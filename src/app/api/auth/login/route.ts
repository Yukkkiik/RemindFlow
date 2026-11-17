import { NextResponse } from "next/server";
import { AuthService } from "@/server/services/auth.service";
import { loginSchema } from "@/lib/validation/auth.schema";
import { createSession } from "@/lib/session";
import { errorResponse } from "@/lib/errors";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data login tidak valid",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    assertRateLimit(`login:${getClientIp(request)}:${validation.data.email}`, 10, 15 * 60 * 1000);
    const user = await AuthService.login(validation.data);
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      data: user,
    });
  } catch (error) {
    return errorResponse(error, "Gagal melakukan login");
  }
}
