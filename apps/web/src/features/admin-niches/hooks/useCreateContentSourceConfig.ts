import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateContentSourceConfigInput } from "../types"
import { contentSourceConfigService } from "../services/contentSourceConfigService"
import { adminNichesKeys } from "./queryKeys"

export function useCreateContentSourceConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nicheId, input }: { nicheId: string; input: CreateContentSourceConfigInput }) =>
      contentSourceConfigService.createContentSource(nicheId, input),
    onSuccess: (_result, { nicheId }) => {
      void queryClient.invalidateQueries({ queryKey: adminNichesKeys.contentSources(nicheId) })
    },
  })
}
