import { http, HttpResponse } from "msw"
import { nichesStore } from "./nichesStore"
import { sourceVideoHandlers } from "./sourceVideoHandlers"
import type { NicheStatus } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

export const adminNichesHandlers = [
  http.get(`${API_BASE_URL}/v1/admin/niches`, () =>
    HttpResponse.json({
      data: nichesStore.items,
      meta: { page: 1, pageSize: 20, total: nichesStore.items.length },
    }),
  ),
  http.post(`${API_BASE_URL}/v1/admin/niches`, async ({ request }) => {
    const body = (await request.json()) as {
      name: string
      slug: string
      description: string
      category: string
    }
    const niche = {
      id: `niche-${nichesStore.items.length + 1}`,
      name: body.name,
      slug: body.slug,
      description: body.description,
      category: body.category,
      previewThumbnailUrl: null,
      status: "INACTIVE" as NicheStatus,
      createdAt: "2026-07-31T00:00:00.000Z",
    }
    nichesStore.items = [...nichesStore.items, niche]
    return HttpResponse.json(niche, { status: 201 })
  }),
  http.patch(`${API_BASE_URL}/v1/admin/niches/:id`, async ({ params, request }) => {
    const body = (await request.json()) as { status?: NicheStatus }
    const existing = nichesStore.items.find((niche) => niche.id === params.id)
    if (!existing) {
      return HttpResponse.json(
        { error: { code: "NICHE_NOT_FOUND", message: "not found" } },
        { status: 404 },
      )
    }
    const updated = { ...existing, status: body.status ?? existing.status }
    nichesStore.items = nichesStore.items.map((niche) => (niche.id === params.id ? updated : niche))
    return HttpResponse.json(updated)
  }),
  http.post(
    `${API_BASE_URL}/v1/admin/niches/:nicheId/prompt-templates`,
    async ({ params, request }) => {
      const body = (await request.json()) as { type: string; content: string }
      return HttpResponse.json(
        {
          id: "prompt-template-1",
          nicheId: params.nicheId,
          type: body.type,
          content: body.content,
          version: 1,
          createdAt: "2026-07-31T00:00:00.000Z",
        },
        { status: 201 },
      )
    },
  ),
  ...sourceVideoHandlers,
]
