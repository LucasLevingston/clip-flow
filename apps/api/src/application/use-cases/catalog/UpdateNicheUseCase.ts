import { AuditLog } from "../../../domain/audit/entities/AuditLog"
import { NicheNotFoundError } from "../../../domain/catalog/errors/NicheNotFoundError"
import type { AuditLogRepository } from "../../../domain/audit/repositories/AuditLogRepository"
import type { NicheStatus } from "../../../domain/catalog/entities/Niche"
import type { NicheRepository } from "../../../domain/catalog/repositories/NicheRepository"
import type { IdGenerator } from "../../../domain/identity/services/IdGenerator"
import { mapNicheToDto, type NicheDto } from "./mapNicheToDto"

export interface UpdateNicheInput {
  actorUserId: string
  nicheId: string
  name?: string | undefined
  description?: string | undefined
  status?: NicheStatus | undefined
}

export interface UpdateNicheUseCaseDeps {
  nicheRepository: NicheRepository
  auditLogRepository: AuditLogRepository
  idGenerator: IdGenerator
}

/** RF-15 — `PATCH /v1/admin/niches/:id`. */
export class UpdateNicheUseCase {
  constructor(private readonly deps: UpdateNicheUseCaseDeps) {}

  async execute(input: UpdateNicheInput): Promise<NicheDto> {
    const niche = await this.deps.nicheRepository.findById(input.nicheId)
    if (!niche) {
      throw new NicheNotFoundError(input.nicheId)
    }

    const updated = niche.update({
      name: input.name,
      description: input.description,
      status: input.status,
    })
    await this.deps.nicheRepository.save(updated)

    await this.deps.auditLogRepository.save(
      AuditLog.create({
        id: this.deps.idGenerator.generate(),
        actorUserId: input.actorUserId,
        actorType: "PLATFORM_ADMIN",
        action: "niche.updated",
        targetType: "Niche",
        targetId: updated.id,
        metadata: { name: input.name, description: input.description, status: input.status },
      }),
    )

    return mapNicheToDto(updated)
  }
}
