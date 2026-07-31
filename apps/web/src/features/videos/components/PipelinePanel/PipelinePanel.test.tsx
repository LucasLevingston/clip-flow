import { screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { PipelinePanel } from "./PipelinePanel"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

describe("PipelinePanel", () => {
  it("should show the stage breakdown and queue for in-progress videos", async () => {
    renderWithProviders(<PipelinePanel channelId="channel-1" />)

    expect(await screen.findByText("Cortando: 1")).toBeInTheDocument()
    expect(screen.getByText(/^#1/)).toBeInTheDocument()
  })

  it("should show an empty state when nothing is in progress", async () => {
    server.use(http.get(`${API_BASE_URL}/v1/videos/pipeline`, () => HttpResponse.json([])))

    renderWithProviders(<PipelinePanel channelId="channel-1" />)

    expect(await screen.findByText("Nenhum vídeo em processamento no momento.")).toBeInTheDocument()
  })

  it("should show a breakdown entry per distinct stage", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/videos/pipeline`, () =>
        HttpResponse.json([
          {
            id: "video-2",
            channelId: "channel-1",
            status: "SOURCING",
            sourceVideoId: "source-2",
            thumbnailUrl: null,
            finalAssetUrl: null,
            scheduledPublishAt: "2026-07-01T09:00:00.000Z",
            createdAt: "2026-07-01T00:00:00.000Z",
            publishRecords: [],
          },
          {
            id: "video-3",
            channelId: "channel-1",
            status: "SOURCING",
            sourceVideoId: "source-3",
            thumbnailUrl: null,
            finalAssetUrl: null,
            scheduledPublishAt: "2026-07-01T09:00:00.000Z",
            createdAt: "2026-07-01T00:01:00.000Z",
            publishRecords: [],
          },
          {
            id: "video-4",
            channelId: "channel-1",
            status: "CUTTING",
            sourceVideoId: "source-4",
            thumbnailUrl: null,
            finalAssetUrl: null,
            scheduledPublishAt: "2026-07-01T09:00:00.000Z",
            createdAt: "2026-07-01T00:02:00.000Z",
            publishRecords: [],
          },
        ]),
      ),
    )

    renderWithProviders(<PipelinePanel channelId="channel-1" />)

    await waitFor(() => expect(screen.getByText("Buscando fonte: 2")).toBeInTheDocument())
    expect(screen.getByText("Cortando: 1")).toBeInTheDocument()
  })
})
