import { prisma } from "@clip-flow/database"
import { PromptTemplate } from "../../domain/catalog/entities/PromptTemplate"
import type { PromptTemplateRepository } from "../../domain/catalog/repositories/PromptTemplateRepository"
import type { PromptTemplateType } from "../../domain/catalog/types"

export class PromptTemplatePrismaRepository implements PromptTemplateRepository {
  async findLatestVersion(nicheId: string, type: PromptTemplateType): Promise<number> {
    const record = await prisma.promptTemplate.findFirst({
      where: { nicheId, type },
      orderBy: { version: "desc" },
      select: { version: true },
    })
    return record?.version ?? 0
  }

  async save(promptTemplate: PromptTemplate): Promise<void> {
    await prisma.promptTemplate.create({
      data: {
        id: promptTemplate.id,
        nicheId: promptTemplate.nicheId,
        type: promptTemplate.type,
        content: promptTemplate.content,
        version: promptTemplate.version,
        createdAt: promptTemplate.createdAt,
      },
    })
  }
}
