import { NextResponse } from "next/server";
import { AuthService } from "@/server/services/auth.service";
import { registerSchema } from "@/lib/validation/auth.schema";
import { createSession } from "@/lib/session";
import { errorResponse } from "@/lib/errors";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data registrasi tidak valid",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    assertRateLimit(`register:${getClientIp(request)}`, 5, 60 * 60 * 1000);
    const user = await AuthService.register(validation.data);
    await createSession(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil",
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error, "Gagal melakukan registrasi");
  }
}
