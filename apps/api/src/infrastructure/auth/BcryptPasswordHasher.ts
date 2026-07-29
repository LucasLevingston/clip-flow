import { compare, hash } from "bcryptjs"
import type { PasswordHasher } from "../../domain/identity/services/PasswordHasher"

const SALT_ROUNDS = 12

export class BcryptPasswordHasher implements PasswordHasher {
  hash(plainPassword: string): Promise<string> {
    return hash(plainPassword, SALT_ROUNDS)
  }

  compare(plainPassword: string, passwordHash: string): Promise<boolean> {
    return compare(plainPassword, passwordHash)
  }
}
