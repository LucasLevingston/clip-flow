import { http, HttpResponse } from "msw"
import { channelDetailStore } from "./channelDetailStore"
import { socialAccountsHandlers } from "./socialAccountsHandlers"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

function toChannelDto(detail: typeof channelDetailStore.state) {
  return {
    id: detail.id,
    nicheId: detail.nicheId,
    name: detail.name,
    language: detail.language,
    promptOverride: detail.promptOverride,
    videosPerDay: detail.videosPerDay,
    publishTimes: detail.publishTimes,
    generationTime: detail.generationTime,
    platforms: detail.platforms,
    thumbnailEnabled: detail.thumbnailEnabled,
    status: detail.status,
  }
}

export const channelsHandlers = [
  http.get(`${API_BASE_URL}/v1/channels`, () =>
    HttpResponse.json({
      data: [
        {
          id: "channel-1",
          name: "Canal Futebol",
          nicheId: "niche-1",
          nicheName: "Futebol",
          status: "ACTIVE",
          platforms: "SHORTS_ONLY",
          videosPerDay: 1,
          createdAt: "2026-07-01T00:00:00.000Z",
        },
      ],
      meta: { page: 1, pageSize: 20, total: 1 },
    }),
  ),
  http.get(`${API_BASE_URL}/v1/niches`, () =>
    HttpResponse.json({
      data: [
        {
          id: "niche-1",
          name: "Futebol",
          slug: "futebol",
          description: "Melhores momentos do futebol",
          category: "Esportes",
          previewThumbnailUrl: null,
        },
      ],
      meta: { page: 1, pageSize: 20, total: 1 },
    }),
  ),
  http.post(`${API_BASE_URL}/v1/channels`, () =>
    HttpResponse.json(
      {
        id: "channel-1",
        tenantId: "tenant-1",
        nicheId: "niche-1",
        name: "Meu Canal",
        language: "pt-BR",
        videosPerDay: 1,
        publishTimes: ["06:00"],
        generationTime: "06:00",
        platforms: "SHORTS_ONLY",
        thumbnailEnabled: true,
        status: "DRAFT",
      },
      { status: 201 },
    ),
  ),
  http.get(`${API_BASE_URL}/v1/channels/:channelId`, () =>
    HttpResponse.json(channelDetailStore.state),
  ),
  http.patch(`${API_BASE_URL}/v1/channels/:channelId`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    channelDetailStore.state = { ...channelDetailStore.state, ...body }
    return HttpResponse.json(toChannelDto(channelDetailStore.state))
  }),
  http.patch(`${API_BASE_URL}/v1/channels/:channelId/status`, async ({ request }) => {
    const body = (await request.json()) as { status: "ACTIVE" | "PAUSED" }
    channelDetailStore.state = { ...channelDetailStore.state, status: body.status }
    return HttpResponse.json(toChannelDto(channelDetailStore.state))
  }),
  http.get(`${API_BASE_URL}/v1/channels/:channelId/insights`, () =>
    HttpResponse.json({
      channelId: "channel-1",
      bestPublishHours: [9, 20],
      topTitlePatterns: ["incrivel", "gol"],
      topHashtags: ["#futebol", "#gol"],
      avgOptimalDurationMs: 31_000,
      computedAt: "2026-07-30T00:00:00.000Z",
    }),
  ),
  ...socialAccountsHandlers,
]
