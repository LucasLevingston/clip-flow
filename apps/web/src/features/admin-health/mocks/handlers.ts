import { http, HttpResponse } from "msw"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

export const adminHealthHandlers = [
  http.get(`${API_BASE_URL}/v1/admin/health`, () =>
    HttpResponse.json({
      queues: [
        { name: "video", waiting: 3, active: 1, failed: 0 },
        { name: "ai", waiting: 60, active: 2, failed: 5 },
      ],
      integrations: [
        { name: "youtube", status: "UP" },
        { name: "tiktok", status: "DEGRADED" },
      ],
    }),
  ),
]
