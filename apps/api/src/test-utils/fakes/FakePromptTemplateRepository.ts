import type { PromptTemplate } from "../../domain/catalog/entities/PromptTemplate"
import type { PromptTemplateRepository } from "../../domain/catalog/repositories/PromptTemplateRepository"
import type { PromptTemplateType } from "../../domain/catalog/types"

export class FakePromptTemplateRepository implements PromptTemplateRepository {
  private readonly promptTemplates: PromptTemplate[] = []

  seed(promptTemplate: PromptTemplate): void {
    this.promptTemplates.push(promptTemplate)
  }

  findLatestVersion(nicheId: string, type: PromptTemplateType): Promise<number> {
    const matching = this.promptTemplates.filter(
      (promptTemplate) => promptTemplate.nicheId === nicheId && promptTemplate.type === type,
    )
    return Promise.resolve(matching.reduce((max, pt) => Math.max(max, pt.version), 0))
  }

  save(promptTemplate: PromptTemplate): Promise<void> {
    this.promptTemplates.push(promptTemplate)
    return Promise.resolve()
  }
}
