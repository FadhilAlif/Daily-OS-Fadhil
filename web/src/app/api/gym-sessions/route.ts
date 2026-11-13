import { GYM_SESSIONS } from "@engine/utils/bulking";
import { NextResponse } from "next/server";

/** Single source of truth for gym presets: the shared pure engine. */
export function GET() {
  return NextResponse.json({ success: true, sessions: GYM_SESSIONS });
}
