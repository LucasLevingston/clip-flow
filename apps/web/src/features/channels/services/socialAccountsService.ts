import { apiClient } from "@/lib/apiClient"
import type { OAuthCallbackInput } from "@clip-flow/shared-schemas"

export type SocialAccountPlatform = "YOUTUBE" | "TIKTOK"

export interface ConnectedSocialAccount {
  id: string
  platform: SocialAccountPlatform
  externalAccountId: string
  status: "CONNECTED" | "NEEDS_REAUTH" | "DISCONNECTED"
}

export const socialAccountsService = {
  getOAuthUrl: (channelId: string, platform: SocialAccountPlatform): Promise<{ url: string }> =>
    apiClient.get<{ url: string }>(
      `/v1/channels/${channelId}/social-accounts/${platform}/oauth-url`,
    ),
  connect: (
    channelId: string,
    platform: SocialAccountPlatform,
    input: OAuthCallbackInput,
  ): Promise<ConnectedSocialAccount> =>
    apiClient.post<ConnectedSocialAccount>(
      `/v1/channels/${channelId}/social-accounts/${platform}/oauth-callback`,
      input,
    ),
  reauth: (
    channelId: string,
    accountId: string,
    input: OAuthCallbackInput,
  ): Promise<ConnectedSocialAccount> =>
    apiClient.post<ConnectedSocialAccount>(
      `/v1/channels/${channelId}/social-accounts/${accountId}/reauth`,
      input,
    ),
  disconnect: (channelId: string, accountId: string): Promise<void> =>
    apiClient.delete<void>(`/v1/channels/${channelId}/social-accounts/${accountId}`),
}
