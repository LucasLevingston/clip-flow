import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { VideoList } from "./VideoList"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

describe("VideoList", () => {
  it("should list the channel's videos with status and platform", async () => {
    renderWithProviders(<VideoList channelId="channel-1" />)

    expect(await screen.findByText("Publicado")).toBeInTheDocument()
    expect(screen.getByText("YouTube")).toBeInTheDocument()
  })

  it("should refetch when the platform filter changes", async () => {
    const user = userEvent.setup()
    let capturedUrl = ""
    server.use(
      http.get(`${API_BASE_URL}/v1/videos`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ data: [], meta: { page: 1, pageSize: 20, total: 0 } })
      }),
    )

    renderWithProviders(<VideoList channelId="channel-1" />)
    await screen.findByText("Nenhum vídeo encontrado.")

    await user.selectOptions(screen.getByLabelText("Filtrar por plataforma"), "TIKTOK")

    expect(await screen.findByText("Nenhum vídeo encontrado.")).toBeInTheDocument()
    expect(capturedUrl).toContain("platform=TIKTOK")
  })

  it("should show an empty state when there are no videos", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/videos`, () =>
        HttpResponse.json({ data: [], meta: { page: 1, pageSize: 20, total: 0 } }),
      ),
    )

    renderWithProviders(<VideoList channelId="channel-1" />)

    expect(await screen.findByText("Nenhum vídeo encontrado.")).toBeInTheDocument()
  })

  it("should show an error message when the request fails", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/videos`, () =>
        HttpResponse.json({ error: { code: "INTERNAL_ERROR", message: "boom" } }, { status: 500 }),
      ),
    )

    renderWithProviders(<VideoList channelId="channel-1" />)

    expect(await screen.findByText("Não foi possível carregar os vídeos.")).toBeInTheDocument()
  })
})
