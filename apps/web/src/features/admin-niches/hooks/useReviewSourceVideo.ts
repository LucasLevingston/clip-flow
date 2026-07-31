import { useMutation, useQueryClient } from "@tanstack/react-query"
import { adminNichesService } from "../services/adminNichesService"
import type { ReviewSourceVideoInput } from "../types"
import { adminNichesKeys } from "./queryKeys"

export function useReviewSourceVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReviewSourceVideoInput }) =>
      adminNichesService.reviewSourceVideo(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminNichesKeys.sourceVideos() })
    },
  })
}
