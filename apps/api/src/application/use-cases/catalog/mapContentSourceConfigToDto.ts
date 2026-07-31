import type {
  ContentSourceConfig,
  ContentSourceConfigSettings,
} from "../../../domain/catalog/entities/ContentSourceConfig"
import type { ContentSourceProviderType, LicenseType } from "../../../domain/catalog/types"

export interface ContentSourceConfigDto {
  id: string
  nicheId: string
  providerType: ContentSourceProviderType
  name: string
  settings: ContentSourceConfigSettings
  licenseType: LicenseType
  licenseReference: string
  isActive: boolean
  createdAt: Date
}

export function mapContentSourceConfigToDto(
  contentSourceConfig: ContentSourceConfig,
): ContentSourceConfigDto {
  return {
    id: contentSourceConfig.id,
    nicheId: contentSourceConfig.nicheId,
    providerType: contentSourceConfig.providerType,
    name: contentSourceConfig.name,
    settings: contentSourceConfig.settings,
    licenseType: contentSourceConfig.license.licenseType,
    licenseReference: contentSourceConfig.license.licenseReference,
    isActive: contentSourceConfig.isActive,
    createdAt: contentSourceConfig.createdAt,
  }
}
