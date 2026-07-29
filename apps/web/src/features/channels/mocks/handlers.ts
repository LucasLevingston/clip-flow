import { http, HttpResponse } from "msw"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

export const channelsHandlers = [
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
]
