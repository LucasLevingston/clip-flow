import { prisma } from "@clip-flow/database"
import type {
  PlatformHealthSnapshotDto,
  PlatformHealthSnapshotRepository,
} from "../../domain/health/repositories/PlatformHealthSnapshotRepository"

export class PlatformHealthSnapshotPrismaRepository implements PlatformHealthSnapshotRepository {
  async findLatest(): Promise<PlatformHealthSnapshotDto | null> {
    const record = await prisma.platformHealthSnapshot.findFirst({ orderBy: { createdAt: "desc" } })
    if (!record) {
      return null
    }

    return {
      queues: record.queues as unknown as PlatformHealthSnapshotDto["queues"],
      integrations: record.integrations as unknown as PlatformHealthSnapshotDto["integrations"],
    }
  }
}
