import type { PasswordHasher } from "../../domain/identity/services/PasswordHasher"

/** `hash(x) === "hashed:" + x` — good enough to assert behavior without real bcrypt cost. */
export class FakePasswordHasher implements PasswordHasher {
  hash(plainPassword: string): Promise<string> {
    return Promise.resolve(`hashed:${plainPassword}`)
  }

  compare(plainPassword: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hashed:${plainPassword}`)
  }
}
