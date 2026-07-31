import { prisma, type Niche as PrismaNiche } from "@clip-flow/database"
import { Niche } from "../../domain/catalog/entities/Niche"
import type {
  NicheAdminListFilter,
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

  async findById(id: string): Promise<Niche | null> {
    const record = await prisma.niche.findUnique({ where: { id } })
    return record ? toDomain(record) : null
  }

  async findBySlug(slug: string): Promise<Niche | null> {
    const record = await prisma.niche.findUnique({ where: { slug } })
    return record ? toDomain(record) : null
  }

  async findAllPaginated(filter: NicheAdminListFilter): Promise<NicheListResult> {
    const where = filter.status ? { status: filter.status } : {}

    const [records, total] = await Promise.all([
      prisma.niche.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
      }),
      prisma.niche.count({ where }),
    ])

    return { items: records.map(toDomain), total }
  }

  async save(niche: Niche): Promise<void> {
    const data = {
      name: niche.name,
      slug: niche.slug,
      description: niche.description,
      category: niche.category,
      previewThumbnailUrl: niche.previewThumbnailUrl,
      status: niche.status,
    }
    await prisma.niche.upsert({
      where: { id: niche.id },
      create: { id: niche.id, ...data },
      update: data,
    })
  }
}
