import { randomBytes } from "node:crypto"
import type { SecureTokenGenerator } from "../../domain/identity/services/SecureTokenGenerator"

const TOKEN_BYTES = 32

export class RandomSecureTokenGenerator implements SecureTokenGenerator {
  generate(): string {
    return randomBytes(TOKEN_BYTES).toString("hex")
  }
}
