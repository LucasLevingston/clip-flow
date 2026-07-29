import { OAuthExchangeFailedError } from "../../domain/channel-management/errors/OAuthExchangeFailedError"

const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/"

export interface TiktokTokenResponse {
  open_id: string
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
}

/** Shared POST to TikTok's OAuth2 token endpoint — used for both the initial code exchange and silent refresh. */
export async function requestTiktokToken(
  params: Record<string, string>,
): Promise<TiktokTokenResponse> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  })
  if (!response.ok) {
    throw new OAuthExchangeFailedError(`TikTok token endpoint returned status ${response.status}`)
  }
  return (await response.json()) as TiktokTokenResponse
}
