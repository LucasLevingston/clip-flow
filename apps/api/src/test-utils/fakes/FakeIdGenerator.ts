import type { IdGenerator } from "../../domain/identity/services/IdGenerator"

export class FakeIdGenerator implements IdGenerator {
  private counter = 0

  generate(): string {
    this.counter += 1
    return `id-${this.counter}`
  }
}
