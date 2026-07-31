import { http, HttpResponse } from "msw"
import { channelDetailStore } from "./channelDetailStore"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

export const socialAccountsHandlers = [
  http.get(`${API_BASE_URL}/v1/channels/:channelId/social-accounts/:platform/oauth-url`, () =>
    HttpResponse.json({ url: "https://accounts.google.com/o/oauth2/v2/auth?mock=1" }),
  ),
  http.post(
    `${API_BASE_URL}/v1/channels/:channelId/social-accounts/:platform/oauth-callback`,
    ({ params }) => {
      const account = {
        id: "social-account-1",
        platform: params.platform,
        externalAccountId: "external-1",
        status: "CONNECTED" as const,
        connectedAt: "2026-07-31T00:00:00.000Z",
      }
      channelDetailStore.state = {
        ...channelDetailStore.state,
        socialAccounts: [...channelDetailStore.state.socialAccounts, account],
      }
      return HttpResponse.json(account, { status: 201 })
    },
  ),
  http.post(`${API_BASE_URL}/v1/channels/:channelId/social-accounts/:id/reauth`, ({ params }) => {
    const reconnected = {
      id: params.id,
      platform: "YOUTUBE",
      externalAccountId: "external-1",
      status: "CONNECTED" as const,
    }
    channelDetailStore.state = {
      ...channelDetailStore.state,
      socialAccounts: channelDetailStore.state.socialAccounts.map((account) =>
        (account as { id: string }).id === params.id
          ? { ...(account as object), status: "CONNECTED" }
          : account,
      ),
    }
    return HttpResponse.json(reconnected)
  }),
  http.delete(`${API_BASE_URL}/v1/channels/:channelId/social-accounts/:id`, ({ params }) => {
    channelDetailStore.state = {
      ...channelDetailStore.state,
      socialAccounts: channelDetailStore.state.socialAccounts.filter(
        (account) => (account as { id: string }).id !== params.id,
      ),
    }
    return new HttpResponse(null, { status: 204 })
  }),
]
