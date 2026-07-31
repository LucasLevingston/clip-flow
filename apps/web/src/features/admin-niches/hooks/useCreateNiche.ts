import { useMutation, useQueryClient } from "@tanstack/react-query"
import { adminNichesService } from "../services/adminNichesService"
import { adminNichesKeys } from "./queryKeys"

export function useCreateNiche() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminNichesService.createNiche,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminNichesKeys.niches() })
    },
  })
}
