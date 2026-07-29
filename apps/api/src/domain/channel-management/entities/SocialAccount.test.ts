import { SocialAccount } from "./SocialAccount"

describe("SocialAccount", () => {
  it("should expose the encrypted tokens and metadata via getters", () => {
    const account = SocialAccount.create({
      id: "account-1",
      channelId: "channel-1",
      platform: "YOUTUBE",
      externalAccountId: "yt-channel-123",
      status: "CONNECTED",
      encryptedTokens: Buffer.from("ciphertext"),
      tokenKeyVersion: 1,
      refreshExpiresAt: null,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    })

    expect(account.id).toBe("account-1")
    expect(account.channelId).toBe("channel-1")
    expect(account.platform).toBe("YOUTUBE")
    expect(account.externalAccountId).toBe("yt-channel-123")
    expect(account.status).toBe("CONNECTED")
    expect(account.encryptedTokens.toString()).toBe("ciphertext")
    expect(account.tokenKeyVersion).toBe(1)
    expect(account.refreshExpiresAt).toBeNull()
  })

  it("should replace tokens and become CONNECTED when refreshed", () => {
    const account = SocialAccount.create({
      id: "account-1",
      channelId: "channel-1",
      platform: "YOUTUBE",
      externalAccountId: "yt-channel-123",
      status: "NEEDS_REAUTH",
      encryptedTokens: Buffer.from("old"),
      tokenKeyVersion: 1,
      refreshExpiresAt: null,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    })

    const refreshed = account.withRefreshedTokens(Buffer.from("new"), 2)

    expect(refreshed.status).toBe("CONNECTED")
    expect(refreshed.encryptedTokens.toString()).toBe("new")
    expect(refreshed.tokenKeyVersion).toBe(2)
  })

  it("should mark the account as needing reauthentication", () => {
    const account = SocialAccount.create({
      id: "account-1",
      channelId: "channel-1",
      platform: "YOUTUBE",
      externalAccountId: "yt-channel-123",
      status: "CONNECTED",
      encryptedTokens: Buffer.from("ciphertext"),
      tokenKeyVersion: 1,
      refreshExpiresAt: null,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    })

    expect(account.markNeedsReauth().status).toBe("NEEDS_REAUTH")
  })
})
