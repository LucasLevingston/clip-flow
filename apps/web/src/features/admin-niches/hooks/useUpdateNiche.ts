import { useMutation, useQueryClient } from "@tanstack/react-query"
import { adminNichesService } from "../services/adminNichesService"
import type { UpdateNicheInput } from "../types"
import { adminNichesKeys } from "./queryKeys"

export function useUpdateNiche() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNicheInput }) =>
      adminNichesService.updateNiche(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminNichesKeys.niches() })
    },
  })
}
