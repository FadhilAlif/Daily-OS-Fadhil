import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/server/utils/rate-limit";

const MUTATION_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
const PUBLIC_ASSET_PATHS = new Set(["/manifest.json", "/favicon.ico"]);

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://intervals.icu https://*.intervals.icu; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
  );
  return response;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Skip static assets and PWA manifest
  if (
    pathname.startsWith("/_next/") ||
    PUBLIC_ASSET_PATHS.has(pathname) ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return withSecurityHeaders(NextResponse.next());
  }

  const ip = getClientIp(request);

  // Apply rate limits (300 req/hour GET, 60 req/hour mutations)
  const isMutation = MUTATION_METHODS.includes(method);
  const limit = isMutation ? 60 : 300;
  const rateLimit = checkRateLimit(
    `ip:${ip}:${isMutation ? "mutation" : "read"}`,
    limit,
    60 * 60 * 1000,
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Terlalu banyak permintaan. Coba lagi nanti.",
        errors: [],
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString(),
        },
      },
    );
  }

  // Allow auth and cron routes; cron handler independently requires CRON_SECRET.
  if (pathname.startsWith("/api/auth/") || pathname === "/api/cron/sync-activities") {
    return withSecurityHeaders(NextResponse.next());
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isValid = await verifySessionToken(token);

  // API route protection
  if (pathname.startsWith("/api/")) {
    if (MUTATION_METHODS.includes(method)) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");
      if (!origin || !host || new URL(origin).host !== host) {
        return NextResponse.json(
          { success: false, message: "Origin tidak diizinkan.", errors: [] },
          { status: 403 },
        );
      }
    }

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: login diperlukan untuk mengakses API.",
          errors: [],
        },
        { status: 401 },
      );
    }

    return withSecurityHeaders(NextResponse.next());
  }

  // Page route protection (/login vs protected pages)
  if (pathname === "/login") {
    if (isValid) {
      return withSecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
    }
    const response = NextResponse.next();
    if (token) {
      response.cookies.delete(SESSION_COOKIE_NAME);
    }
    return withSecurityHeaders(response);
  }

  if (!isValid) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
