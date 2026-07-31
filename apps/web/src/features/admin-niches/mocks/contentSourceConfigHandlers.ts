import { http, HttpResponse } from "msw"
import { contentSourceConfigsStore } from "./contentSourceConfigsStore"
import type { ContentSourceConfigAdmin, CreateContentSourceConfigInput } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

export const contentSourceConfigHandlers = [
  http.get(`${API_BASE_URL}/v1/admin/niches/:nicheId/content-sources`, ({ params }) =>
    HttpResponse.json(
      contentSourceConfigsStore.items.filter((source) => source.nicheId === params.nicheId),
    ),
  ),
  http.post(
    `${API_BASE_URL}/v1/admin/niches/:nicheId/content-sources`,
    async ({ params, request }) => {
      const body = (await request.json()) as CreateContentSourceConfigInput
      const source: ContentSourceConfigAdmin = {
        id: `content-source-${contentSourceConfigsStore.items.length + 1}`,
        nicheId: params.nicheId as string,
        providerType: body.providerType,
        name: body.name,
        settings: body.settings,
        licenseType: body.licenseType,
        licenseReference: body.licenseReference,
        isActive: true,
        createdAt: "2026-07-31T00:00:00.000Z",
      }
      contentSourceConfigsStore.items = [...contentSourceConfigsStore.items, source]
      return HttpResponse.json(source, { status: 201 })
    },
  ),
  http.post(`${API_BASE_URL}/v1/admin/niches/:nicheId/content-sources/discover`, () =>
    HttpResponse.json({ discovered: 0, ingested: 0, skipped: 0, failedSources: [] }),
  ),
]
