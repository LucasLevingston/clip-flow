import type { ContentSourceProviderType } from "../types"
import type { LicenseInfo } from "../value-objects/LicenseInfo"

export interface RssFeedConfig {
  feedUrl: string
}

export interface LocalFolderConfig {
  folderPath: string
  baseUrl: string
}

export interface PartnerApiConfig {
  apiUrl: string
  apiKey: string
}

export type ContentSourceConfigSettings = RssFeedConfig | LocalFolderConfig | PartnerApiConfig

export interface ContentSourceConfigProps {
  id: string
  nicheId: string
  providerType: ContentSourceProviderType
  name: string
  settings: ContentSourceConfigSettings
  license: LicenseInfo
  isActive: boolean
  createdAt: Date
}

/** ADR-0006 — a pre-vetted, licensed discovery source. Discovery output always lands as SourceVideo(PENDING_REVIEW); never auto-approved. */
export class ContentSourceConfig {
  private constructor(private readonly props: ContentSourceConfigProps) {}

  static create(
    props: Omit<ContentSourceConfigProps, "isActive" | "createdAt"> & {
      isActive?: boolean
      createdAt?: Date
    },
  ): ContentSourceConfig {
    return new ContentSourceConfig({
      ...props,
      isActive: props.isActive ?? true,
      createdAt: props.createdAt ?? new Date(),
    })
  }

  get id(): string {
    return this.props.id
  }

  get nicheId(): string {
    return this.props.nicheId
  }

  get providerType(): ContentSourceProviderType {
    return this.props.providerType
  }

  get name(): string {
    return this.props.name
  }

  get settings(): ContentSourceConfigSettings {
    return this.props.settings
  }

  get license(): LicenseInfo {
    return this.props.license
  }

  get isActive(): boolean {
    return this.props.isActive
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  deactivate(): ContentSourceConfig {
    return new ContentSourceConfig({ ...this.props, isActive: false })
  }
}
