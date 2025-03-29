import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((req) => {
  const protectedPaths = ["/reports"];
  const isPathProtected = protectedPaths.some((path) => 
    req.nextUrl.pathname.startsWith(path)
  );

  if (isPathProtected && !req.auth) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};