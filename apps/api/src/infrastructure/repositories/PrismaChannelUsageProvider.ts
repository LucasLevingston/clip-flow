import { prisma } from "@clip-flow/database"
import type { ChannelUsageProvider } from "../../domain/billing/repositories/ChannelUsageProvider"

export class PrismaChannelUsageProvider implements ChannelUsageProvider {
  async countByTenant(tenantId: string): Promise<number> {
    return prisma.channel.count({ where: { tenantId } })
  }
}
