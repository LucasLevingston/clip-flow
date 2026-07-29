import { createHash } from "node:crypto"
import type { RefreshTokenHasher } from "../../domain/identity/services/RefreshTokenHasher"

/** Refresh tokens are stored hashed, never in clear (security/secrets-encryption.md). */
export class Sha256RefreshTokenHasher implements RefreshTokenHasher {
  hash(rawToken: string): string {
    return createHash("sha256").update(rawToken).digest("hex")
  }
}
