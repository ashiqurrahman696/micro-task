import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Role-based route guard. Only redirects when NO session cookie exists,
// so a page reload on a private route never kicks out a logged-in user.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedRoutes = ["/dashboard"];
  const isProtected = protectedRoutes.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!isProtected) return NextResponse.next();

  const cookieNames = [
    "better-auth.session_token",
    "__Secure-better-auth.session_token",
    "better-auth.session-token",
  ];
  const hasSession = cookieNames.some((n) => req.cookies.get(n)?.value);
  if (!hasSession) {
    // Also allow the client-side guard to handle it gracefully via ?next=
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
