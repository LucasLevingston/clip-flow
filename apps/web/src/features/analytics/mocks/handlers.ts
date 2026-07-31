import { http, HttpResponse } from "msw"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

export const analyticsHandlers = [
  http.get(`${API_BASE_URL}/v1/analytics/summary`, () =>
    HttpResponse.json({
      totalVideos: 3,
      totalViews: 1500,
      totalLikes: 120,
      totalComments: 45,
      totalShares: 20,
      subscribersGrowth: 0,
      byPlatform: { YOUTUBE: { videos: 2, views: 1000 }, TIKTOK: { videos: 1, views: 500 } },
      topVideos: [{ generatedVideoId: "video-1", views: 1000 }],
    }),
  ),
]
