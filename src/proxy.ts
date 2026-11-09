import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("stockpilot_session")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!token) {
    if (isLoginPage) return NextResponse.next();

    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = process.env.AUTH_SECRET;

    if (!secret || secret.length < 32) {
      throw new Error("Invalid AUTH_SECRET");
    }

    await jwtVerify(token, new TextEncoder().encode(secret));

    if (isLoginPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(
      new URL("/login", request.url)
    );

    response.cookies.set("stockpilot_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
