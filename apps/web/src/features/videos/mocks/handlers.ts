import { http, HttpResponse } from "msw"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

export const videosHandlers = [
  http.get(`${API_BASE_URL}/v1/videos`, () =>
    HttpResponse.json({
      data: [
        {
          id: "video-1",
          channelId: "channel-1",
          status: "PUBLISHED",
          sourceVideoId: "source-1",
          thumbnailUrl: null,
          finalAssetUrl: "https://cdn/final.mp4",
          scheduledPublishAt: "2026-07-01T09:00:00.000Z",
          createdAt: "2026-07-01T00:00:00.000Z",
          publishRecords: [
            {
              platform: "YOUTUBE",
              status: "PUBLISHED",
              externalPostId: "yt-1",
              publishedAt: "2026-07-01T09:00:00.000Z",
            },
          ],
        },
      ],
      meta: { page: 1, pageSize: 20, total: 1 },
    }),
  ),
]
