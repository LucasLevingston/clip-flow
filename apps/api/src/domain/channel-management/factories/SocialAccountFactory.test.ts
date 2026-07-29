import type {
  DecryptedTokens,
  EncryptedTokenPayload,
  TokenEncryptor,
} from "../services/TokenEncryptor"
import { SocialAccountFactory } from "./SocialAccountFactory"

class FakeTokenEncryptor implements TokenEncryptor {
  encrypt(tokens: DecryptedTokens): EncryptedTokenPayload {
    return { ciphertext: Buffer.from(JSON.stringify(tokens)), keyVersion: 1 }
  }

  decrypt(payload: EncryptedTokenPayload): DecryptedTokens {
    return JSON.parse(payload.ciphertext.toString()) as DecryptedTokens
  }
}

describe("SocialAccountFactory", () => {
  it("should create a CONNECTED social account with encrypted tokens", () => {
    const factory = new SocialAccountFactory(new FakeTokenEncryptor())

    const account = factory.create({
      id: "account-1",
      channelId: "channel-1",
      platform: "YOUTUBE",
      externalAccountId: "yt-channel-123",
      tokens: {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        accessTokenExpiresAt: "2026-01-01T01:00:00Z",
      },
      refreshExpiresAt: new Date("2026-02-01T00:00:00Z"),
    })

    expect(account.status).toBe("CONNECTED")
    expect(account.tokenKeyVersion).toBe(1)
    expect(account.refreshExpiresAt).toEqual(new Date("2026-02-01T00:00:00Z"))
    expect(JSON.parse(account.encryptedTokens.toString())).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      accessTokenExpiresAt: "2026-01-01T01:00:00Z",
    })
  })
})
