export const SESSION_COOKIE_NAME = "athlete_session";
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const DEFAULT_DEV_PASSPHRASE = "fadhil2026";

function getConfiguredPassphrase(): string | null {
  const envPass = process.env.APP_PASSWORD?.trim();
  if (envPass && envPass.length > 0) {
    return envPass;
  }
  if (process.env.NODE_ENV !== "production") {
    return DEFAULT_DEV_PASSPHRASE;
  }
  return null;
}

async function deriveHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.digest(
    "SHA-256",
    enc.encode(`daily-athlete-os-v1:${secret}`),
  );
  return crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function hexToUint8Array(hex: string): Uint8Array {
  const match = hex.match(/.{1,2}/g);
  if (!match) return new Uint8Array();
  return new Uint8Array(match.map((byte) => parseInt(byte, 16)));
}

function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(): Promise<string> {
  const secret = getConfiguredPassphrase();
  if (!secret) {
    throw new Error("APP_PASSWORD belum dikonfigurasi di environment server.");
  }

  const timestamp = Date.now().toString();
  const enc = new TextEncoder();
  const key = await deriveHmacKey(secret);
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(timestamp));
  const sigHex = uint8ArrayToHex(new Uint8Array(sigBuffer));

  return `${timestamp}.${sigHex}`;
}

export async function verifySessionToken(
  token: string | null | undefined,
): Promise<boolean> {
  if (!token || typeof token !== "string") return false;

  const [timestampStr, sigHex] = token.split(".");
  if (!timestampStr || !sigHex) return false;

  const timestamp = Number(timestampStr);
  if (isNaN(timestamp)) return false;

  const now = Date.now();
  if (now - timestamp > SESSION_MAX_AGE_MS || timestamp > now + 60_000) {
    return false;
  }

  try {
    const secret = getConfiguredPassphrase();
    if (!secret) return false;

    const enc = new TextEncoder();
    const key = await deriveHmacKey(secret);
    const sigBytes = hexToUint8Array(sigHex);
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as unknown as BufferSource,
      enc.encode(timestampStr),
    );
  } catch {
    return false;
  }
}

export function validatePassphrase(passphrase: string): boolean {
  const expected = getConfiguredPassphrase();
  if (!expected) return false;
  return passphrase.trim() === expected;
}
