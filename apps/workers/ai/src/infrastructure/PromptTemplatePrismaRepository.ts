import { prisma } from "@clip-flow/database"
import type {
  PromptTemplateRepository,
  PromptTemplateSnapshot,
} from "../domain/repositories/PromptTemplateRepository"
import type { PromptTemplateType } from "../domain/types"

/** "Active" = latest version for (niche, type) — Niche.activePromptTemplateId isn't wired to a
 * specific type yet, that activation flow belongs to the EPIC-10 admin console (Sprint 11). */
export class PromptTemplatePrismaRepository implements PromptTemplateRepository {
  findLatestByNicheAndType(
    nicheId: string,
    type: PromptTemplateType,
  ): Promise<PromptTemplateSnapshot | null> {
    return prisma.promptTemplate.findFirst({
      where: { nicheId, type },
      orderBy: { version: "desc" },
      select: { content: true, version: true },
    })
  }
}
