import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const AUTH_PAGES = ["/login", "/register"];

/**
 * Optimistic page redirect only (cookie check, no DB). Real authorization
 * happens in getCurrentUser() inside every API route.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userId = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!userId && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (userId && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Every page except API routes and static assets; new pages are protected by default
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
