export interface DecryptedTokens {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
}

export interface EncryptedTokenPayload {
  ciphertext: Buffer
  keyVersion: number
}

/** Never persist a token in clear — see docs/security/secrets-encryption.md. */
export interface TokenEncryptor {
  encrypt(tokens: DecryptedTokens): EncryptedTokenPayload
  decrypt(payload: EncryptedTokenPayload): DecryptedTokens
}
