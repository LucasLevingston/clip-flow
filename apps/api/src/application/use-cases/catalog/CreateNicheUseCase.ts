import { AuditLog } from "../../../domain/audit/entities/AuditLog"
import { Niche } from "../../../domain/catalog/entities/Niche"
import { SlugAlreadyExistsError } from "../../../domain/catalog/errors/SlugAlreadyExistsError"
import type { AuditLogRepository } from "../../../domain/audit/repositories/AuditLogRepository"
import type { NicheRepository } from "../../../domain/catalog/repositories/NicheRepository"
import type { IdGenerator } from "../../../domain/identity/services/IdGenerator"
import { mapNicheToDto, type NicheDto } from "./mapNicheToDto"

export interface CreateNicheInput {
  actorUserId: string
  name: string
  slug: string
  description: string
  category: string
}

export interface CreateNicheUseCaseDeps {
  nicheRepository: NicheRepository
  auditLogRepository: AuditLogRepository
  idGenerator: IdGenerator
}

/** RF-15 — `POST /v1/admin/niches`. Always created INACTIVE; activated manually once curated. */
export class CreateNicheUseCase {
  constructor(private readonly deps: CreateNicheUseCaseDeps) {}

  async execute(input: CreateNicheInput): Promise<NicheDto> {
    const existing = await this.deps.nicheRepository.findBySlug(input.slug)
    if (existing) {
      throw new SlugAlreadyExistsError(input.slug)
    }

    const niche = Niche.create({
      id: this.deps.idGenerator.generate(),
      name: input.name,
      slug: input.slug,
      description: input.description,
      category: input.category,
      previewThumbnailUrl: null,
      status: "INACTIVE",
      createdAt: new Date(),
    })
    await this.deps.nicheRepository.save(niche)

    await this.deps.auditLogRepository.save(
      AuditLog.create({
        id: this.deps.idGenerator.generate(),
        actorUserId: input.actorUserId,
        actorType: "PLATFORM_ADMIN",
        action: "niche.created",
        targetType: "Niche",
        targetId: niche.id,
        metadata: { slug: niche.slug },
      }),
    )

    return mapNicheToDto(niche)
  }
}
