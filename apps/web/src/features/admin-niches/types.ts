export type NicheStatus = "ACTIVE" | "INACTIVE"

export interface NicheAdmin {
  id: string
  name: string
  slug: string
  description: string
  category: string
  previewThumbnailUrl: string | null
  status: NicheStatus
  createdAt: string
}

export interface ListNichesAdminResult {
  data: NicheAdmin[]
  meta: { page: number; pageSize: number; total: number }
}

export interface CreateNicheInput {
  name: string
  slug: string
  description: string
  category: string
}

export interface UpdateNicheInput {
  name?: string
  description?: string
  status?: NicheStatus
}

export type PromptTemplateType = "HIGHLIGHT_SELECTION" | "COPY_GENERATION"

export interface PromptTemplate {
  id: string
  nicheId: string
  type: PromptTemplateType
  content: string
  version: number
  createdAt: string
}

export interface CreatePromptTemplateInput {
  type: PromptTemplateType
  content: string
}

export type SourceVideoStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED"
export type LicenseType = "PUBLIC_DOMAIN" | "CREATIVE_COMMONS" | "PARTNER_AGREEMENT"

export interface SourceVideoAdmin {
  id: string
  nicheId: string
  durationSeconds: number
  licenseType: LicenseType
  licenseReference: string
  status: SourceVideoStatus
  storageUrl: string
  createdAt: string
}

export interface ListSourceVideosResult {
  data: SourceVideoAdmin[]
  meta: { page: number; pageSize: number; total: number }
}

export interface IngestSourceVideoInput {
  nicheId: string
  storageUrl: string
  durationSeconds: number
  licenseType: LicenseType
  licenseReference: string
}

export interface ReviewSourceVideoInput {
  decision: "APPROVED" | "REJECTED"
  reason?: string
}

export type ContentSourceProviderType = "RSS_FEED" | "LOCAL_FOLDER" | "PARTNER_API"

export type ContentSourceSettings =
  { feedUrl: string } | { folderPath: string; baseUrl: string } | { apiUrl: string; apiKey: string }

export interface ContentSourceConfigAdmin {
  id: string
  nicheId: string
  providerType: ContentSourceProviderType
  name: string
  settings: ContentSourceSettings
  licenseType: LicenseType
  licenseReference: string
  isActive: boolean
  createdAt: string
}

export interface CreateContentSourceConfigInput {
  providerType: ContentSourceProviderType
  name: string
  settings: ContentSourceSettings
  licenseType: LicenseType
  licenseReference: string
}

export interface DiscoverContentResult {
  discovered: number
  ingested: number
  skipped: number
  failedSources: Array<{ contentSourceConfigId: string; name: string; message: string }>
}
