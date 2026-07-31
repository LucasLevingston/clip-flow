import { useMutation } from "@tanstack/react-query"
import { oauthPendingConnection } from "../services/oauthPendingConnection"
import {
  socialAccountsService,
  type SocialAccountPlatform,
} from "../services/socialAccountsService"

interface StartOAuthConnectionInput {
  channelId: string
  platform: SocialAccountPlatform
  accountId: string | null
}

/** Fetches the provider's authorization URL, stashes what to resume with, then navigates away. */
export function useStartOAuthConnection() {
  return useMutation({
    mutationFn: async ({ channelId, platform, accountId }: StartOAuthConnectionInput) => {
      const { url } = await socialAccountsService.getOAuthUrl(channelId, platform)
      oauthPendingConnection.set({ channelId, platform, accountId })
      window.location.href = url
    },
  })
}
