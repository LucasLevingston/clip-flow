import type { RefreshTokenRepository } from "../../../domain/identity/repositories/RefreshTokenRepository"
import type { RefreshTokenHasher } from "../../../domain/identity/services/RefreshTokenHasher"

export interface LogoutInput {
  refreshToken: string
}

export interface LogoutUseCaseDeps {
  refreshTokenRepository: RefreshTokenRepository
  refreshTokenHasher: RefreshTokenHasher
}

/** Idempotent — an already-revoked or unknown token is not an error. */
export class LogoutUseCase {
  constructor(private readonly deps: LogoutUseCaseDeps) {}

  async execute(input: LogoutInput): Promise<void> {
    const tokenHash = this.deps.refreshTokenHasher.hash(input.refreshToken)
    const record = await this.deps.refreshTokenRepository.findByTokenHash(tokenHash)

    if (record) {
      await this.deps.refreshTokenRepository.revoke(record.id)
    }
  }
}
