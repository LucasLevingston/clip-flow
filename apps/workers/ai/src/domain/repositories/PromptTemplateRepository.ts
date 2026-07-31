import type { PromptTemplateType } from "../types"

export interface PromptTemplateSnapshot {
  content: string
  version: number
}

/** "Active" template = latest version for that (niche, type) pair — see comment in PromptTemplatePrismaRepository. */
export interface PromptTemplateRepository {
  findLatestByNicheAndType(
    nicheId: string,
    type: PromptTemplateType,
  ): Promise<PromptTemplateSnapshot | null>
}
