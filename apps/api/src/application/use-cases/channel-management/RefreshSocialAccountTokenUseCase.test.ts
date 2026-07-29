import { randomBytes } from "node:crypto"
import { SocialAccount } from "../../../domain/channel-management/entities/SocialAccount"
import { SocialAccountNotFoundError } from "../../../domain/channel-management/errors/SocialAccountNotFoundError"
import { TokenRefreshPolicy } from "../../../domain/channel-management/policies/TokenRefreshPolicy"
import { AesGcmEncryptor } from "../../../infrastructure/crypto/AesGcmEncryptor"
import { FakeClock } from "../../../test-utils/fakes/FakeClock"
import { FakeSocialOAuthAdapter } from "../../../test-utils/fakes/FakeSocialOAuthAdapter"
import { InMemorySocialAccountRepository } from "../../../test-utils/fakes/InMemorySocialAccountRepository"
import { RefreshSocialAccountTokenUseCase } from "./RefreshSocialAccountTokenUseCase"

function buildScenario(accessTokenExpiresAt: string, refreshToken = "old-refresh-token") {
  const socialAccountRepository = new InMemorySocialAccountRepository()
  const tokenEncryptor = new AesGcmEncryptor(randomBytes(32), 1)
  const clock = new FakeClock(new Date("2026-01-01T00:00:00Z"))
  const useCase = new RefreshSocialAccountTokenUseCase({
    socialAccountRepository,
    tokenEncryptor,
    oauthAdapters: { YOUTUBE: new FakeSocialOAuthAdapter() },
    tokenRefreshPolicy: new TokenRefreshPolicy(),
    clock,
  })

  const encrypted = tokenEncryptor.encrypt({
    accessToken: "old-access-token",
    refreshToken,
    accessTokenExpiresAt,
  })
  const account = SocialAccount.create({
    id: "account-1",
    channelId: "channel-1",
    platform: "YOUTUBE",
    externalAccountId: "yt-1",
    status: "CONNECTED",
    encryptedTokens: encrypted.ciphertext,
    tokenKeyVersion: encrypted.keyVersion,
    refreshExpiresAt: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
  })

  return { useCase, socialAccountRepository, account }
}

describe("RefreshSocialAccountTokenUseCase", () => {
  it("should not refresh when the access token is still valid", async () => {
    const { useCase, socialAccountRepository, account } = buildScenario("2026-01-01T01:00:00Z")
    await socialAccountRepository.save(account)

    const status = await useCase.execute({ socialAccountId: "account-1" })

    expect(status).toBe("CONNECTED")
  })

  it("should silently renew the token when it is close to expiring", async () => {
    const { useCase, socialAccountRepository, account } = buildScenario("2026-01-01T00:05:00Z")
    await socialAccountRepository.save(account)

    const status = await useCase.execute({ socialAccountId: "account-1" })

    expect(status).toBe("CONNECTED")
    const updated = await socialAccountRepository.findById("account-1")
    expect(updated?.encryptedTokens.equals(account.encryptedTokens)).toBe(false)
  })

  it("should mark the account NEEDS_REAUTH when the refresh call fails", async () => {
    const { useCase, socialAccountRepository, account } = buildScenario(
      "2026-01-01T00:05:00Z",
      "invalid-refresh-token",
    )
    await socialAccountRepository.save(account)

    const status = await useCase.execute({ socialAccountId: "account-1" })

    expect(status).toBe("NEEDS_REAUTH")
    const updated = await socialAccountRepository.findById("account-1")
    expect(updated?.status).toBe("NEEDS_REAUTH")
  })

  it("should reject when the account does not exist", async () => {
    const { useCase } = buildScenario("2026-01-01T01:00:00Z")

    await expect(useCase.execute({ socialAccountId: "ghost" })).rejects.toThrow(
      SocialAccountNotFoundError,
    )
  })
})
