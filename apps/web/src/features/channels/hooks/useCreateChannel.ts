import { useMutation, useQueryClient } from "@tanstack/react-query"
import { channelsService } from "../services/channelsService"
import { channelKeys } from "./queryKeys"

export function useCreateChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: channelsService.createChannel,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: channelKeys.all })
    },
  })
}
