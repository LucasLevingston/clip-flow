import { AuditLog } from "../../../domain/audit/entities/AuditLog"
import type { AuditLogRepository } from "../../../domain/audit/repositories/AuditLogRepository"
import { NicheNotFoundError } from "../../../domain/catalog/errors/NicheNotFoundError"
import { SourceVideo } from "../../../domain/catalog/entities/SourceVideo"
import type { NicheRepository } from "../../../domain/catalog/repositories/NicheRepository"
import type { SourceVideoRepository } from "../../../domain/catalog/repositories/SourceVideoRepository"
import type { LicenseType } from "../../../domain/catalog/types"
import { LicenseInfo } from "../../../domain/catalog/value-objects/LicenseInfo"
import type { IdGenerator } from "../../../domain/identity/services/IdGenerator"
import { mapSourceVideoToDto, type SourceVideoDto } from "./mapSourceVideoToDto"

export interface IngestSourceVideoInput {
  actorUserId: string
  nicheId: string
  storageUrl: string
  durationSeconds: number
  licenseType: LicenseType
  licenseReference: string
}

export interface IngestSourceVideoUseCaseDeps {
  nicheRepository: NicheRepository
  sourceVideoRepository: SourceVideoRepository
  auditLogRepository: AuditLogRepository
  idGenerator: IdGenerator
}

/** RF-07 — `POST /v1/admin/source-videos`. ADR-0006: no ingestion without a documented license. */
export class IngestSourceVideoUseCase {
  constructor(private readonly deps: IngestSourceVideoUseCaseDeps) {}

  async execute(input: IngestSourceVideoInput): Promise<SourceVideoDto> {
    const niche = await this.deps.nicheRepository.findById(input.nicheId)
    if (!niche) {
      throw new NicheNotFoundError(input.nicheId)
    }

    const sourceVideo = SourceVideo.create({
      id: this.deps.idGenerator.generate(),
      nicheId: input.nicheId,
      durationSeconds: input.durationSeconds,
      license: LicenseInfo.create(input.licenseType, input.licenseReference),
      storageUrl: input.storageUrl,
    })
    await this.deps.sourceVideoRepository.save(sourceVideo)

    await this.deps.auditLogRepository.save(
      AuditLog.create({
        id: this.deps.idGenerator.generate(),
        actorUserId: input.actorUserId,
        actorType: "PLATFORM_ADMIN",
        action: "source_video.ingested",
        targetType: "SourceVideo",
        targetId: sourceVideo.id,
        metadata: { nicheId: input.nicheId },
      }),
    )

    return mapSourceVideoToDto(sourceVideo)
  }
}
