import { prisma, type Channel as PrismaChannel } from "@clip-flow/database"
import { Channel } from "../../domain/channel-management/entities/Channel"
import type {
  ChannelListFilter,
  ChannelListResult,
  ChannelRepository,
} from "../../domain/channel-management/repositories/ChannelRepository"
import { TimeOfDay } from "../../domain/channel-management/value-objects/TimeOfDay"

function toDomain(record: PrismaChannel): Channel {
  return Channel.create({
    id: record.id,
    tenantId: record.tenantId,
    nicheId: record.nicheId,
    name: record.name,
    language: record.language,
    promptOverride: record.promptOverride,
    videosPerDay: record.videosPerDay,
    publishTimes: (record.publishTimes as string[]).map((time) => TimeOfDay.parse(time)),
    generationTime: TimeOfDay.parse(record.generationTime),
    platforms: record.platforms,
    thumbnailEnabled: record.thumbnailEnabled,
    status: record.status,
    createdAt: record.createdAt,
  })
}

export class ChannelPrismaRepository implements ChannelRepository {
  async findById(id: string, tenantId: string): Promise<Channel | null> {
    const record = await prisma.channel.findFirst({ where: { id, tenantId, deletedAt: null } })
    return record ? toDomain(record) : null
  }

  async findPaginatedByTenant(filter: ChannelListFilter): Promise<ChannelListResult> {
    const where = {
      tenantId: filter.tenantId,
      deletedAt: null,
      ...(filter.status ? { status: filter.status } : {}),
    }

    const [records, total] = await Promise.all([
      prisma.channel.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
      }),
      prisma.channel.count({ where }),
    ])

    return { items: records.map(toDomain), total }
  }

  async save(channel: Channel): Promise<void> {
    const data = {
      tenantId: channel.tenantId,
      nicheId: channel.nicheId,
      name: channel.name,
      language: channel.language,
      promptOverride: channel.promptOverride,
      videosPerDay: channel.videosPerDay,
      publishTimes: channel.publishTimes.map((time) => time.format()),
      generationTime: channel.generationTime.format(),
      platforms: channel.platforms,
      thumbnailEnabled: channel.thumbnailEnabled,
      status: channel.status,
    }

    await prisma.channel.upsert({
      where: { id: channel.id },
      create: { id: channel.id, ...data },
      update: data,
    })
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await prisma.channel.updateMany({ where: { id, tenantId }, data: { deletedAt: new Date() } })
  }
}
