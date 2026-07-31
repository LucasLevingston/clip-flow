import { useMutation } from "@tanstack/react-query"
import { adminNichesService } from "../services/adminNichesService"
import type { CreatePromptTemplateInput } from "../types"

export function useCreatePromptTemplate() {
  return useMutation({
    mutationFn: ({ nicheId, input }: { nicheId: string; input: CreatePromptTemplateInput }) =>
      adminNichesService.createPromptTemplate(nicheId, input),
  })
}
