import { OAuthExchangeFailedError } from "../../domain/channel-management/errors/OAuthExchangeFailedError"

const TOKEN_URL = "https://oauth2.googleapis.com/token"

export interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
}

/** Shared POST to Google's OAuth2 token endpoint — used for both the initial code exchange and silent refresh. */
export async function requestGoogleToken(
  params: Record<string, string>,
): Promise<GoogleTokenResponse> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  })
  if (!response.ok) {
    throw new OAuthExchangeFailedError(`Google token endpoint returned status ${response.status}`)
  }
  return (await response.json()) as GoogleTokenResponse
}
