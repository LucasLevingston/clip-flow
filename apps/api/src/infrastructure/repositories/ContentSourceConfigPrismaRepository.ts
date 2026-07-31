import { prisma, type ContentSourceConfig as PrismaContentSourceConfig } from "@clip-flow/database"
import {
  ContentSourceConfig,
  type ContentSourceConfigSettings,
} from "../../domain/catalog/entities/ContentSourceConfig"
import type { ContentSourceConfigRepository } from "../../domain/catalog/repositories/ContentSourceConfigRepository"
import { LicenseInfo } from "../../domain/catalog/value-objects/LicenseInfo"

function toDomain(record: PrismaContentSourceConfig): ContentSourceConfig {
  return ContentSourceConfig.create({
    id: record.id,
    nicheId: record.nicheId,
    providerType: record.providerType,
    name: record.name,
    settings: record.config as unknown as ContentSourceConfigSettings,
    license: LicenseInfo.create(record.licenseType, record.licenseReference),
    isActive: record.isActive,
    createdAt: record.createdAt,
  })
}

export class ContentSourceConfigPrismaRepository implements ContentSourceConfigRepository {
  async findActiveByNiche(nicheId: string): Promise<ContentSourceConfig[]> {
    const records = await prisma.contentSourceConfig.findMany({
      where: { nicheId, isActive: true },
      orderBy: { createdAt: "asc" },
    })
    return records.map(toDomain)
  }

  async findByNiche(nicheId: string): Promise<ContentSourceConfig[]> {
    const records = await prisma.contentSourceConfig.findMany({
      where: { nicheId },
      orderBy: { createdAt: "desc" },
    })
    return records.map(toDomain)
  }

  async save(contentSourceConfig: ContentSourceConfig): Promise<void> {
    const data = {
      nicheId: contentSourceConfig.nicheId,
      providerType: contentSourceConfig.providerType,
      name: contentSourceConfig.name,
      config: contentSourceConfig.settings as object,
      licenseType: contentSourceConfig.license.licenseType,
      licenseReference: contentSourceConfig.license.licenseReference,
      isActive: contentSourceConfig.isActive,
    }

    await prisma.contentSourceConfig.upsert({
      where: { id: contentSourceConfig.id },
      create: { id: contentSourceConfig.id, ...data },
      update: data,
    })
  }
}
