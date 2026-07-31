import type { PromptTemplate } from "../entities/PromptTemplate"
import type { PromptTemplateType } from "../types"

export interface PromptTemplateRepository {
  /** 0 when no version exists yet for this (nicheId, type) pair. */
  findLatestVersion(nicheId: string, type: PromptTemplateType): Promise<number>
  save(promptTemplate: PromptTemplate): Promise<void>
}
