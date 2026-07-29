export interface RefreshTokenHasher {
  hash(rawToken: string): string
}
