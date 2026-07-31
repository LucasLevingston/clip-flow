import { AuditLog } from "../../../domain/audit/entities/AuditLog"
import { PromptTemplate } from "../../../domain/catalog/entities/PromptTemplate"
import { NicheNotFoundError } from "../../../domain/catalog/errors/NicheNotFoundError"
import type { AuditLogRepository } from "../../../domain/audit/repositories/AuditLogRepository"
import type { NicheRepository } from "../../../domain/catalog/repositories/NicheRepository"
import type { PromptTemplateRepository } from "../../../domain/catalog/repositories/PromptTemplateRepository"
import type { PromptTemplateType } from "../../../domain/catalog/types"
import type { IdGenerator } from "../../../domain/identity/services/IdGenerator"

export interface CreatePromptTemplateInput {
  actorUserId: string
  nicheId: string
  type: PromptTemplateType
  content: string
}

export interface PromptTemplateDto {
  id: string
  nicheId: string
  type: PromptTemplateType
  content: string
  version: number
  createdAt: Date
}

export interface CreatePromptTemplateUseCaseDeps {
  nicheRepository: NicheRepository
  promptTemplateRepository: PromptTemplateRepository
  auditLogRepository: AuditLogRepository
  idGenerator: IdGenerator
}

/**
 * RF-15/O5 — `POST /v1/admin/niches/:id/prompt-templates`. Each save is a new immutable
 * version; the highest `version` per (nicheId, type) is always what the AI Worker reads.
 */
export class CreatePromptTemplateUseCase {
  constructor(private readonly deps: CreatePromptTemplateUseCaseDeps) {}

  async execute(input: CreatePromptTemplateInput): Promise<PromptTemplateDto> {
    const niche = await this.deps.nicheRepository.findById(input.nicheId)
    if (!niche) {
      throw new NicheNotFoundError(input.nicheId)
    }

    const latestVersion = await this.deps.promptTemplateRepository.findLatestVersion(
      input.nicheId,
      input.type,
    )
    const promptTemplate = PromptTemplate.create({
      id: this.deps.idGenerator.generate(),
      nicheId: input.nicheId,
      type: input.type,
      content: input.content,
      version: latestVersion + 1,
    })
    await this.deps.promptTemplateRepository.save(promptTemplate)

    await this.deps.auditLogRepository.save(
      AuditLog.create({
        id: this.deps.idGenerator.generate(),
        actorUserId: input.actorUserId,
        actorType: "PLATFORM_ADMIN",
        action: "prompt_template.created",
        targetType: "PromptTemplate",
        targetId: promptTemplate.id,
        metadata: { nicheId: input.nicheId, type: input.type, version: promptTemplate.version },
      }),
    )

    return {
      id: promptTemplate.id,
      nicheId: promptTemplate.nicheId,
      type: promptTemplate.type,
      content: promptTemplate.content,
      version: promptTemplate.version,
      createdAt: promptTemplate.createdAt,
    }
  }
}
