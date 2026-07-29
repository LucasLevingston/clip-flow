import type { User } from "../../domain/identity/entities/User"
import type { UserRepository } from "../../domain/identity/repositories/UserRepository"

export class InMemoryUserRepository implements UserRepository {
  private readonly usersById = new Map<string, User>()

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.usersById.get(id) ?? null)
  }

  findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase()
    for (const user of this.usersById.values()) {
      if (user.email.value === normalized) {
        return Promise.resolve(user)
      }
    }
    return Promise.resolve(null)
  }

  save(user: User): Promise<void> {
    this.usersById.set(user.id, user)
    return Promise.resolve()
  }
}
