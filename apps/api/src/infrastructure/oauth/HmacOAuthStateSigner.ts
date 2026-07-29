import { createHmac, timingSafeEqual } from "node:crypto"
import type {
  OAuthStatePayload,
  OAuthStateSigner,
} from "../../domain/channel-management/services/OAuthStateSigner"

/** Self-contained anti-CSRF token — signed, not encrypted (payload has no secret data). */
export class HmacOAuthStateSigner implements OAuthStateSigner {
  constructor(private readonly secret: string) {}

  sign(payload: OAuthStatePayload): string {
    const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")
    return `${encoded}.${this.computeSignature(encoded)}`
  }

  verify(token: string): OAuthStatePayload | null {
    const [encoded, signature] = token.split(".")
    if (!encoded || !signature || !this.safeEqual(signature, this.computeSignature(encoded))) {
      return null
    }
    try {
      return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as OAuthStatePayload
    } catch {
      return null
    }
  }

  private computeSignature(encoded: string): string {
    return createHmac("sha256", this.secret).update(encoded).digest("base64url")
  }

  private safeEqual(a: string, b: string): boolean {
    const bufferA = Buffer.from(a)
    const bufferB = Buffer.from(b)
    return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB)
  }
}
