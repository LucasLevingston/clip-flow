import { PromptTemplateNotFoundError } from "../../domain/errors/PromptTemplateNotFoundError"
import type {
  PromptTemplateRepository,
  PromptTemplateSnapshot,
} from "../../domain/repositories/PromptTemplateRepository"
import type { PromptTemplateType } from "../../domain/types"

export async function requirePromptTemplate(
  repository: PromptTemplateRepository,
  nicheId: string,
  type: PromptTemplateType,
): Promise<PromptTemplateSnapshot> {
  const template = await repository.findLatestByNicheAndType(nicheId, type)
  if (!template) {
    throw new PromptTemplateNotFoundError(nicheId, type)
  }
  return template
}
