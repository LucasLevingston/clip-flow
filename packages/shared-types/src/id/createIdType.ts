import { randomUUID } from "node:crypto"

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface Id<Brand extends string> {
  readonly value: string
  readonly brand: Brand
}

export interface IdType<Brand extends string> {
  create(value: string): Id<Brand>
  generate(): Id<Brand>
  equals(a: Id<Brand>, b: Id<Brand>): boolean
}

/**
 * Nominal identity Value Object factory (Shared Kernel — domain/bounded-contexts.md).
 * Guards against passing one entity's id where another's is expected, even
 * though both are plain UUID strings underneath.
 */
export function createIdType<Brand extends string>(brand: Brand): IdType<Brand> {
  return {
    create(value: string): Id<Brand> {
      if (!UUID_PATTERN.test(value)) {
        throw new Error(`Invalid ${brand}: "${value}" is not a UUID`)
      }
      return { value, brand }
    },
    generate(): Id<Brand> {
      return { value: randomUUID(), brand }
    },
    equals(a: Id<Brand>, b: Id<Brand>): boolean {
      return a.value === b.value
    },
  }
}
