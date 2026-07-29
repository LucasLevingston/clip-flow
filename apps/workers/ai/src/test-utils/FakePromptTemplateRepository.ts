import type {
  PromptTemplateRepository,
  PromptTemplateSnapshot,
} from "../domain/repositories/PromptTemplateRepository"
import type { PromptTemplateType } from "../domain/types"

export class FakePromptTemplateRepository implements PromptTemplateRepository {
  private readonly templates = new Map<string, PromptTemplateSnapshot>()

  seed(nicheId: string, type: PromptTemplateType, template: PromptTemplateSnapshot): void {
    this.templates.set(`${nicheId}:${type}`, template)
  }

  findLatestByNicheAndType(
    nicheId: string,
    type: PromptTemplateType,
  ): Promise<PromptTemplateSnapshot | null> {
    return Promise.resolve(this.templates.get(`${nicheId}:${type}`) ?? null)
  }
}
