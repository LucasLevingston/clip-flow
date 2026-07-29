import type { PromptTemplateType } from "../types"

export class PromptTemplateNotFoundError extends Error {
  constructor(nicheId: string, type: PromptTemplateType) {
    super(`No ${type} prompt template found for niche ${nicheId}`)
    this.name = "PromptTemplateNotFoundError"
  }
}
