import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ChangeChannelStatusInput } from "../types"
import { channelsService } from "../services/channelsService"
import { channelKeys } from "./queryKeys"

export function useChangeChannelStatus(channelId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ChangeChannelStatusInput) =>
      channelsService.changeChannelStatus(channelId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: channelKeys.detail(channelId) })
    },
  })
}
