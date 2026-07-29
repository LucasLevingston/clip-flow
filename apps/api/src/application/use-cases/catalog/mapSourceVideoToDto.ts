import type { SourceVideo } from "../../../domain/catalog/entities/SourceVideo"
import type { LicenseType, SourceVideoStatus } from "../../../domain/catalog/types"

export interface SourceVideoDto {
  id: string
  nicheId: string
  durationSeconds: number
  licenseType: LicenseType
  licenseReference: string
  status: SourceVideoStatus
  storageUrl: string
  createdAt: Date
}

export function mapSourceVideoToDto(sourceVideo: SourceVideo): SourceVideoDto {
  return {
    id: sourceVideo.id,
    nicheId: sourceVideo.nicheId,
    durationSeconds: sourceVideo.durationSeconds,
    licenseType: sourceVideo.license.licenseType,
    licenseReference: sourceVideo.license.licenseReference,
    status: sourceVideo.status,
    storageUrl: sourceVideo.storageUrl,
    createdAt: sourceVideo.createdAt,
  }
}
