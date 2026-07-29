import type { RefreshTokenHasher } from "../../domain/identity/services/RefreshTokenHasher"

export class FakeRefreshTokenHasher implements RefreshTokenHasher {
  hash(rawToken: string): string {
    return `hashed:${rawToken}`
  }
}
