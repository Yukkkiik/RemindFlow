import { NextResponse } from "next/server";
import { ApiResponse } from "@/types";

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Silakan login terlebih dahulu") {
    super(401, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}

/**
 * Map a thrown error to an ApiResponse. Unknown errors are logged and hidden
 * behind the fallback message so internals (e.g. Prisma errors) never leak.
 */
export function errorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof HttpError) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message },
      { status: error.status }
    );
  }

  // request.json() throws SyntaxError on a malformed body
  if (error instanceof SyntaxError) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Body request bukan JSON yang valid" },
      { status: 400 }
    );
  }

  console.error(error);
  return NextResponse.json<ApiResponse>(
    { success: false, error: fallbackMessage },
    { status: 500 }
  );
}
