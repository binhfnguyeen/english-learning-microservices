import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("accessToken")?.value;
    const secret = process.env.JWT_SECRET!;

    if (pathname.startsWith("/admin")) {
        if (pathname !== "/admin/login") {
            if (!token) {
                return NextResponse.redirect(new URL("/admin/login", request.url));
            }

            try {
                const { payload } = await jwtVerify(
                    token,
                    new TextEncoder().encode(secret),
                    { algorithms: ["HS512"] }
                );

                if (payload.scope !== "ROLE_ADMIN") {
                    return NextResponse.redirect(new URL("/not-found", request.url));
                }
            } catch (err: unknown) {
                if (err instanceof Error) {
                    console.error("JWT Verification failed:", err.message);
                } else {
                    console.error("JWT Verification failed:", err);
                }
                return NextResponse.redirect(new URL("/admin/login", request.url));
            }
        }
        return NextResponse.next();
    }

    const publicPaths = ["/", "/login", "/register", "/forgot-password"];
    if (!token && !publicPaths.includes(pathname)) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|api|static|favicon.ico|template).*)"],
};