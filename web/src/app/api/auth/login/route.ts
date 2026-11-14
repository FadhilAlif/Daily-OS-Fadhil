import { NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  validatePassphrase,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/server/utils/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: "Terlalu banyak percobaan login. Coba 15 menit lagi." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const passphrase = body?.passphrase;

    if (typeof passphrase !== "string" || !validatePassphrase(passphrase)) {
      return NextResponse.json(
        { success: false, message: "Passphrase tidak valid." },
        { status: 401 },
      );
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Permintaan login tidak valid." },
      { status: 400 },
    );
  }
}
