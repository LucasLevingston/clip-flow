import { Prisma, prisma } from "@clip-flow/database"
import type { PlatformHealthSnapshotRepository } from "../domain/repositories/PlatformHealthSnapshotRepository"
import type { PlatformHealthSnapshotInput } from "../domain/types"

export class PlatformHealthSnapshotPrismaRepository implements PlatformHealthSnapshotRepository {
  async save(snapshot: PlatformHealthSnapshotInput): Promise<void> {
    await prisma.platformHealthSnapshot.create({
      data: {
        queues: snapshot.queues as unknown as Prisma.InputJsonValue,
        integrations: snapshot.integrations as unknown as Prisma.InputJsonValue,
        createdAt: snapshot.createdAt,
      },
    })
  }
}
