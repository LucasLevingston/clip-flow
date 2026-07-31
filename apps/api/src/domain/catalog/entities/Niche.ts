export type NicheStatus = "ACTIVE" | "INACTIVE"

export interface NicheProps {
  id: string
  name: string
  slug: string
  description: string
  category: string
  previewThumbnailUrl: string | null
  status: NicheStatus
  createdAt: Date
}

/** Shared, tenant-less catalog entry — see ADR-0006. Read-only for tenants. */
export class Niche {
  private constructor(private readonly props: NicheProps) {}

  static create(props: NicheProps): Niche {
    return new Niche(props)
  }

  get id(): string {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get slug(): string {
    return this.props.slug
  }

  get description(): string {
    return this.props.description
  }

  get category(): string {
    return this.props.category
  }

  get previewThumbnailUrl(): string | null {
    return this.props.previewThumbnailUrl
  }

  get status(): NicheStatus {
    return this.props.status
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  update(patch: {
    name?: string | undefined
    description?: string | undefined
    status?: NicheStatus | undefined
  }): Niche {
    return new Niche({
      ...this.props,
      name: patch.name ?? this.props.name,
      description: patch.description ?? this.props.description,
      status: patch.status ?? this.props.status,
    })
  }
}
