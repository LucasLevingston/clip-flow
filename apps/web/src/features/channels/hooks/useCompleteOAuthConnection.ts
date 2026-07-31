import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { PendingOAuthConnection } from "../services/oauthPendingConnection"
import { socialAccountsService } from "../services/socialAccountsService"
import { channelKeys } from "./queryKeys"

interface CompleteOAuthConnectionInput {
  pending: PendingOAuthConnection
  code: string
  state: string
}

/** Resumes after the OAuth redirect: creates a fresh connection or reconnects an existing one. */
export function useCompleteOAuthConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pending, code, state }: CompleteOAuthConnectionInput) =>
      pending.accountId
        ? socialAccountsService.reauth(pending.channelId, pending.accountId, { code, state })
        : socialAccountsService.connect(pending.channelId, pending.platform, { code, state }),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: channelKeys.detail(variables.pending.channelId),
      })
    },
  })
}
