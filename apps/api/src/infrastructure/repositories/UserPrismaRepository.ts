import { prisma, type User as PrismaUser } from "@clip-flow/database"
import { User } from "../../domain/identity/entities/User"
import type { UserRepository } from "../../domain/identity/repositories/UserRepository"

function toDomain(record: PrismaUser): User {
  return User.create({
    id: record.id,
    email: record.email,
    passwordHash: record.passwordHash,
    isPlatformAdmin: record.isPlatformAdmin,
    createdAt: record.createdAt,
  })
}

export class UserPrismaRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { id } })
    return record ? toDomain(record) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    return record ? toDomain(record) : null
  }

  async save(user: User): Promise<void> {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email.value,
        passwordHash: user.passwordHash,
        isPlatformAdmin: user.isPlatformAdmin,
      },
      update: { passwordHash: user.passwordHash, isPlatformAdmin: user.isPlatformAdmin },
    })
  }
}
