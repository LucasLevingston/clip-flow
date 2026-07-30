import { randomBytes } from "node:crypto"
import { AesGcmEncryptor } from "./AesGcmEncryptor"

const key = randomBytes(32)
const sampleTokens = {
  accessToken: "super-secret-access-token",
  refreshToken: "super-secret-refresh-token",
  accessTokenExpiresAt: "2026-01-01T00:00:00Z",
}

describe("AesGcmEncryptor", () => {
  it("should round-trip encrypt/decrypt tokens", () => {
    const encryptor = new AesGcmEncryptor(key, 1)

    const payload = encryptor.encrypt(sampleTokens)
    const decrypted = encryptor.decrypt(payload)

    expect(decrypted).toEqual(sampleTokens)
    expect(payload.keyVersion).toBe(1)
  })

  it("should never expose the plaintext tokens in the ciphertext bytes", () => {
    const encryptor = new AesGcmEncryptor(key, 1)

    const payload = encryptor.encrypt(sampleTokens)

    expect(payload.ciphertext.toString("latin1")).not.toContain(sampleTokens.accessToken)
    expect(payload.ciphertext.toString("latin1")).not.toContain(sampleTokens.refreshToken)
  })

  it("should fail to decrypt with the wrong key", () => {
    const encryptor = new AesGcmEncryptor(key, 1)
    const wrongEncryptor = new AesGcmEncryptor(randomBytes(32), 1)

    const payload = encryptor.encrypt(sampleTokens)

    expect(() => wrongEncryptor.decrypt(payload)).toThrow()
  })

  it("should reject a key that is not 32 bytes", () => {
    expect(() => new AesGcmEncryptor(Buffer.alloc(16), 1)).toThrow(
      "APP_ENCRYPTION_KEY must be 32 bytes, got 16",
    )
  })
})
