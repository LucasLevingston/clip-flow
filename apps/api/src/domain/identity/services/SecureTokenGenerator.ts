/** Opaque, high-entropy tokens — refresh tokens, invite tokens, etc. */
export interface SecureTokenGenerator {
  generate(): string
}
