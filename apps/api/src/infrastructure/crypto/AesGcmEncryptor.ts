import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"
import type {
  DecryptedTokens,
  EncryptedTokenPayload,
  TokenEncryptor,
} from "../../domain/channel-management/services/TokenEncryptor"

const ALGORITHM = "aes-256-gcm"
const KEY_LENGTH = 32
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

/** AES-256-GCM — see security/secrets-encryption.md. `APP_ENCRYPTION_KEY` must be 32 raw bytes. */
export class AesGcmEncryptor implements TokenEncryptor {
  constructor(
    private readonly key: Buffer,
    private readonly keyVersion: number,
  ) {
    if (key.length !== KEY_LENGTH) {
      throw new Error(`APP_ENCRYPTION_KEY must be ${KEY_LENGTH} bytes, got ${key.length}`)
    }
  }

  encrypt(tokens: DecryptedTokens): EncryptedTokenPayload {
    const iv = randomBytes(IV_LENGTH)
    const cipher = createCipheriv(ALGORITHM, this.key, iv)
    const plaintext = Buffer.from(JSON.stringify(tokens), "utf8")
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()])
    const authTag = cipher.getAuthTag()

    return { ciphertext: Buffer.concat([iv, authTag, encrypted]), keyVersion: this.keyVersion }
  }

  decrypt(payload: EncryptedTokenPayload): DecryptedTokens {
    const iv = payload.ciphertext.subarray(0, IV_LENGTH)
    const authTag = payload.ciphertext.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
    const encrypted = payload.ciphertext.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

    const decipher = createDecipheriv(ALGORITHM, this.key, iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])

    return JSON.parse(decrypted.toString("utf8")) as DecryptedTokens
  }
}
