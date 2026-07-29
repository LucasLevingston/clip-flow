import type { PromptTemplateType } from "../types"

export interface PromptTemplateProps {
  id: string
  nicheId: string
  type: PromptTemplateType
  content: string
  version: number
  createdAt: Date
}

/** Each save is a new immutable version — the highest `version` per (nicheId, type) is the active one. */
export class PromptTemplate {
  private constructor(private readonly props: PromptTemplateProps) {}

  static create(
    props: Omit<PromptTemplateProps, "createdAt"> & { createdAt?: Date },
  ): PromptTemplate {
    return new PromptTemplate({ ...props, createdAt: props.createdAt ?? new Date() })
  }

  get id(): string {
    return this.props.id
  }

  get nicheId(): string {
    return this.props.nicheId
  }

  get type(): PromptTemplateType {
    return this.props.type
  }

  get content(): string {
    return this.props.content
  }

  get version(): number {
    return this.props.version
  }

  get createdAt(): Date {
    return this.props.createdAt
  }
}
