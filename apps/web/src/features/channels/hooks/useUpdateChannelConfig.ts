import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { UpdateChannelConfigInput } from "../types"
import { channelsService } from "../services/channelsService"
import { channelKeys } from "./queryKeys"

export function useUpdateChannelConfig(channelId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateChannelConfigInput) =>
      channelsService.updateChannelConfig(channelId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: channelKeys.detail(channelId) })
    },
  })
}
