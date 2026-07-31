import { AuditLog } from "../../../domain/audit/entities/AuditLog"
import type { AuditLogRepository } from "../../../domain/audit/repositories/AuditLogRepository"
import {
  ContentSourceConfig,
  type ContentSourceConfigSettings,
} from "../../../domain/catalog/entities/ContentSourceConfig"
import { NicheNotFoundError } from "../../../domain/catalog/errors/NicheNotFoundError"
import type { ContentSourceConfigRepository } from "../../../domain/catalog/repositories/ContentSourceConfigRepository"
import type { NicheRepository } from "../../../domain/catalog/repositories/NicheRepository"
import type { ContentSourceProviderType, LicenseType } from "../../../domain/catalog/types"
import { LicenseInfo } from "../../../domain/catalog/value-objects/LicenseInfo"
import type { IdGenerator } from "../../../domain/identity/services/IdGenerator"
import {
  mapContentSourceConfigToDto,
  type ContentSourceConfigDto,
} from "./mapContentSourceConfigToDto"

export interface CreateContentSourceConfigInput {
  actorUserId: string
  nicheId: string
  providerType: ContentSourceProviderType
  name: string
  settings: ContentSourceConfigSettings
  licenseType: LicenseType
  licenseReference: string
}

export interface CreateContentSourceConfigUseCaseDeps {
  nicheRepository: NicheRepository
  contentSourceConfigRepository: ContentSourceConfigRepository
  auditLogRepository: AuditLogRepository
  idGenerator: IdGenerator
}

/** RF-07/ADR-0006 — `POST /v1/admin/niches/:id/content-sources`. Registers a pre-licensed, admin-vetted discovery source. */
export class CreateContentSourceConfigUseCase {
  constructor(private readonly deps: CreateContentSourceConfigUseCaseDeps) {}

  async execute(input: CreateContentSourceConfigInput): Promise<ContentSourceConfigDto> {
    const niche = await this.deps.nicheRepository.findById(input.nicheId)
    if (!niche) {
      throw new NicheNotFoundError(input.nicheId)
    }

    const contentSourceConfig = ContentSourceConfig.create({
      id: this.deps.idGenerator.generate(),
      nicheId: input.nicheId,
      providerType: input.providerType,
      name: input.name,
      settings: input.settings,
      license: LicenseInfo.create(input.licenseType, input.licenseReference),
    })
    await this.deps.contentSourceConfigRepository.save(contentSourceConfig)

    await this.deps.auditLogRepository.save(
      AuditLog.create({
        id: this.deps.idGenerator.generate(),
        actorUserId: input.actorUserId,
        actorType: "PLATFORM_ADMIN",
        action: "content_source_config.created",
        targetType: "ContentSourceConfig",
        targetId: contentSourceConfig.id,
        metadata: { nicheId: input.nicheId, providerType: input.providerType },
      }),
    )

    return mapContentSourceConfigToDto(contentSourceConfig)
  }
}
