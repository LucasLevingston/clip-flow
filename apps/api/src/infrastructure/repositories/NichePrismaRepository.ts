import { prisma, type Niche as PrismaNiche } from "@clip-flow/database"
import { Niche } from "../../domain/catalog/entities/Niche"
import type {
  NicheListFilter,
  NicheListResult,
  NicheRepository,
} from "../../domain/catalog/repositories/NicheRepository"

function toDomain(record: PrismaNiche): Niche {
  return Niche.create({
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    category: record.category,
    previewThumbnailUrl: record.previewThumbnailUrl,
    status: record.status,
    createdAt: record.createdAt,
  })
}

export class NichePrismaRepository implements NicheRepository {
  async findActivePaginated(filter: NicheListFilter): Promise<NicheListResult> {
    const where = {
      status: "ACTIVE" as const,
      ...(filter.category ? { category: filter.category } : {}),
    }

    const [records, total] = await Promise.all([
      prisma.niche.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
      }),
      prisma.niche.count({ where }),
    ])

    return { items: records.map(toDomain), total }
  }

  async findActiveById(id: string): Promise<Niche | null> {
    const record = await prisma.niche.findFirst({ where: { id, status: "ACTIVE" } })
    return record ? toDomain(record) : null
  }
}
