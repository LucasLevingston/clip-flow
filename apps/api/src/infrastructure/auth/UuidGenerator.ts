import { randomUUID } from "node:crypto"
import type { IdGenerator } from "../../domain/identity/services/IdGenerator"

export class UuidGenerator implements IdGenerator {
  generate(): string {
    return randomUUID()
  }
}
