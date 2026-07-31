import { useMutation, useQueryClient } from "@tanstack/react-query"
import { socialAccountsService } from "../services/socialAccountsService"
import { channelKeys } from "./queryKeys"

export function useDisconnectSocialAccount(channelId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (accountId: string) => socialAccountsService.disconnect(channelId, accountId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: channelKeys.detail(channelId) })
    },
  })
}
