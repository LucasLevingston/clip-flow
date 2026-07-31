import { useMutation } from "@tanstack/react-query"
import { channelsService } from "../services/channelsService"

export function useTriggerGeneration(channelId: string) {
  return useMutation({
    mutationFn: () => channelsService.triggerGeneration(channelId),
  })
}
