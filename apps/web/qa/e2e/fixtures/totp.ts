import { createHmac } from "node:crypto";
import { E2E_TOTP_KEY_HEX } from "./credentials";

/** Generate a 6-digit TOTP for the shared e2e hex key (SHA-1, 30s step). */
export function currentTotp(
  secretHex: string = E2E_TOTP_KEY_HEX,
  nowMs: number = Date.now(),
): string {
  const key = Buffer.from(secretHex, "hex");
  const counter = Math.floor(nowMs / 1000 / 30);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1]! & 0xf;
  const code =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);
  return String(code % 1_000_000).padStart(6, "0");
}
