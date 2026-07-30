import type {
  DecryptedTokens,
  EncryptedTokenPayload,
  TokenEncryptor,
} from "../domain/services/TokenEncryptor"

/** Pass-through (JSON, no real crypto) — real AES-GCM behavior is covered by AesGcmEncryptor.test.ts. */
export class FakeTokenEncryptor implements TokenEncryptor {
  encrypt(tokens: DecryptedTokens): EncryptedTokenPayload {
    return { ciphertext: Buffer.from(JSON.stringify(tokens), "utf8"), keyVersion: 1 }
  }

  decrypt(payload: EncryptedTokenPayload): DecryptedTokens {
    return JSON.parse(payload.ciphertext.toString("utf8")) as DecryptedTokens
  }
}
