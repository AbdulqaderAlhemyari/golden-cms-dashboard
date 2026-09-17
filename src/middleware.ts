import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_KEY } from "@/lib/auth/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_KEY)?.value;
  const isLogin = pathname === "/login";

  if (!token && !isLogin) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isLogin) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
