import type { SecureTokenGenerator } from "../../domain/identity/services/SecureTokenGenerator"

export class FakeSecureTokenGenerator implements SecureTokenGenerator {
  private counter = 0

  generate(): string {
    this.counter += 1
    return `token-${this.counter}`
  }
}
