import { prisma, type SourceVideo as PrismaSourceVideo } from "@clip-flow/database"
import { SourceVideo } from "../../domain/catalog/entities/SourceVideo"
import type {
  SourceVideoListFilter,
  SourceVideoListResult,
  SourceVideoRepository,
} from "../../domain/catalog/repositories/SourceVideoRepository"
import { LicenseInfo } from "../../domain/catalog/value-objects/LicenseInfo"

function toDomain(record: PrismaSourceVideo): SourceVideo {
  return SourceVideo.create({
    id: record.id,
    nicheId: record.nicheId,
    durationSeconds: record.durationSeconds,
    license: LicenseInfo.create(record.licenseType, record.licenseReference),
    status: record.status,
    storageUrl: record.storageUrl,
    externalRef: record.externalRef,
    language: record.language,
    qualityScore: record.qualityScore,
    createdAt: record.createdAt,
  })
}

export class SourceVideoPrismaRepository implements SourceVideoRepository {
  async findById(id: string): Promise<SourceVideo | null> {
    const record = await prisma.sourceVideo.findUnique({ where: { id } })
    return record ? toDomain(record) : null
  }

  async findPaginated(filter: SourceVideoListFilter): Promise<SourceVideoListResult> {
    const where = {
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.nicheId ? { nicheId: filter.nicheId } : {}),
    }
    const [records, total] = await Promise.all([
      prisma.sourceVideo.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
      }),
      prisma.sourceVideo.count({ where }),
    ])
    return { items: records.map(toDomain), total }
  }

  async save(sourceVideo: SourceVideo): Promise<void> {
    const data = {
      nicheId: sourceVideo.nicheId,
      durationSeconds: sourceVideo.durationSeconds,
      licenseType: sourceVideo.license.licenseType,
      licenseReference: sourceVideo.license.licenseReference,
      status: sourceVideo.status,
      storageUrl: sourceVideo.storageUrl,
      externalRef: sourceVideo.externalRef,
      language: sourceVideo.language,
      qualityScore: sourceVideo.qualityScore,
    }

    await prisma.sourceVideo.upsert({
      where: { id: sourceVideo.id },
      create: { id: sourceVideo.id, ...data },
      update: data,
    })
  }

  async existsByExternalRef(nicheId: string, externalRef: string): Promise<boolean> {
    const record = await prisma.sourceVideo.findFirst({
      where: { nicheId, externalRef },
      select: { id: true },
    })
    return record !== null
  }
}
