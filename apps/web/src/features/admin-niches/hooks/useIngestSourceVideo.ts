import { useMutation, useQueryClient } from "@tanstack/react-query"
import { adminNichesService } from "../services/adminNichesService"
import { adminNichesKeys } from "./queryKeys"

export function useIngestSourceVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminNichesService.ingestSourceVideo,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminNichesKeys.sourceVideos() })
    },
  })
}
