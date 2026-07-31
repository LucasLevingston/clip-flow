import { HmacOAuthStateSigner } from "./HmacOAuthStateSigner"

describe("HmacOAuthStateSigner", () => {
  const signer = new HmacOAuthStateSigner("test-secret-1234567890")
  const payload = { tenantId: "tenant-1", channelId: "channel-1", platform: "YOUTUBE" }

  it("should verify a token it signed itself", () => {
    const token = signer.sign(payload)

    expect(signer.verify(token)).toEqual(payload)
  })

  it("should reject a token signed with a different secret", () => {
    const token = new HmacOAuthStateSigner("other-secret-1234567890").sign(payload)

    expect(signer.verify(token)).toBeNull()
  })

  it("should reject a tampered payload", () => {
    const token = signer.sign(payload)
    const signature = token.split(".")[1]
    const tamperedEncoded = Buffer.from(
      JSON.stringify({ ...payload, channelId: "other" }),
    ).toString("base64url")

    expect(signer.verify(`${tamperedEncoded}.${signature}`)).toBeNull()
  })

  it("should reject a malformed token", () => {
    expect(signer.verify("not-a-valid-token")).toBeNull()
    expect(signer.verify("")).toBeNull()
  })

  it("should fail closed when constructed with a missing or too-short secret", () => {
    expect(() => new HmacOAuthStateSigner("")).toThrow("OAUTH_STATE_SECRET")
    expect(() => new HmacOAuthStateSigner("short")).toThrow("OAUTH_STATE_SECRET")
  })
})
