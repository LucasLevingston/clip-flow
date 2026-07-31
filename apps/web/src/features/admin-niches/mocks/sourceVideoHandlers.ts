import { http, HttpResponse } from "msw"
import { sourceVideosStore } from "./sourceVideosStore"
import type { LicenseType, SourceVideoStatus } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

export const sourceVideoHandlers = [
  http.get(`${API_BASE_URL}/v1/admin/source-videos`, ({ request }) => {
    const status = new URL(request.url).searchParams.get("status") as SourceVideoStatus | null
    const items = status
      ? sourceVideosStore.items.filter((sourceVideo) => sourceVideo.status === status)
      : sourceVideosStore.items
    return HttpResponse.json({ data: items, meta: { page: 1, pageSize: 20, total: items.length } })
  }),
  http.post(`${API_BASE_URL}/v1/admin/source-videos`, async ({ request }) => {
    const body = (await request.json()) as {
      nicheId: string
      storageUrl: string
      durationSeconds: number
      licenseType: LicenseType
      licenseReference: string
    }
    const sourceVideo = {
      id: `source-video-${sourceVideosStore.items.length + 1}`,
      nicheId: body.nicheId,
      durationSeconds: body.durationSeconds,
      licenseType: body.licenseType,
      licenseReference: body.licenseReference,
      status: "PENDING_REVIEW" as SourceVideoStatus,
      storageUrl: body.storageUrl,
      createdAt: "2026-07-31T00:00:00.000Z",
    }
    sourceVideosStore.items = [...sourceVideosStore.items, sourceVideo]
    return HttpResponse.json(sourceVideo, { status: 201 })
  }),
  http.patch(`${API_BASE_URL}/v1/admin/source-videos/:id/review`, async ({ params, request }) => {
    const body = (await request.json()) as { decision: "APPROVED" | "REJECTED" }
    const existing = sourceVideosStore.items.find((sourceVideo) => sourceVideo.id === params.id)
    if (!existing) {
      return HttpResponse.json(
        { error: { code: "SOURCE_VIDEO_NOT_FOUND", message: "not found" } },
        { status: 404 },
      )
    }
    const updated = { ...existing, status: body.decision as SourceVideoStatus }
    sourceVideosStore.items = sourceVideosStore.items.map((sourceVideo) =>
      sourceVideo.id === params.id ? updated : sourceVideo,
    )
    return HttpResponse.json(updated)
  }),
]
