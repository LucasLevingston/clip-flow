import { AuditLog } from "../../../domain/audit/entities/AuditLog"
import type { AuditLogRepository } from "../../../domain/audit/repositories/AuditLogRepository"
import { SourceVideoNotFoundError } from "../../../domain/catalog/errors/SourceVideoNotFoundError"
import { SourceVideoNotPendingError } from "../../../domain/catalog/errors/SourceVideoNotPendingError"
import type { SourceVideoRepository } from "../../../domain/catalog/repositories/SourceVideoRepository"
import type { IdGenerator } from "../../../domain/identity/services/IdGenerator"
import { mapSourceVideoToDto, type SourceVideoDto } from "./mapSourceVideoToDto"

export interface ReviewSourceVideoInput {
  actorUserId: string
  sourceVideoId: string
  decision: "APPROVED" | "REJECTED"
  reason?: string | undefined
}

export interface ReviewSourceVideoUseCaseDeps {
  sourceVideoRepository: SourceVideoRepository
  auditLogRepository: AuditLogRepository
  idGenerator: IdGenerator
}

/** RF-07 — `PATCH /v1/admin/source-videos/:id/review`. */
export class ReviewSourceVideoUseCase {
  constructor(private readonly deps: ReviewSourceVideoUseCaseDeps) {}

  async execute(input: ReviewSourceVideoInput): Promise<SourceVideoDto> {
    const sourceVideo = await this.deps.sourceVideoRepository.findById(input.sourceVideoId)
    if (!sourceVideo) {
      throw new SourceVideoNotFoundError(input.sourceVideoId)
    }
    if (sourceVideo.status !== "PENDING_REVIEW") {
      throw new SourceVideoNotPendingError(input.sourceVideoId)
    }

    const reviewed = input.decision === "APPROVED" ? sourceVideo.approve() : sourceVideo.reject()
    await this.deps.sourceVideoRepository.save(reviewed)

    await this.deps.auditLogRepository.save(
      AuditLog.create({
        id: this.deps.idGenerator.generate(),
        actorUserId: input.actorUserId,
        actorType: "PLATFORM_ADMIN",
        action: input.decision === "APPROVED" ? "source_video.approved" : "source_video.rejected",
        targetType: "SourceVideo",
        targetId: reviewed.id,
        metadata: input.reason ? { reason: input.reason } : null,
      }),
    )

    return mapSourceVideoToDto(reviewed)
  }
}
