import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { ChannelList } from "./ChannelList"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

describe("ChannelList", () => {
  it("should list the tenant's channels with status and platform", async () => {
    renderWithProviders(<ChannelList />)

    expect(await screen.findByText("Canal Futebol")).toBeInTheDocument()
    expect(screen.getByText("Ativo")).toBeInTheDocument()
    expect(screen.getByText("Futebol")).toBeInTheDocument()
  })

  it("should show an empty state with a CTA to create the first channel", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/channels`, () =>
        HttpResponse.json({ data: [], meta: { page: 1, pageSize: 20, total: 0 } }),
      ),
    )

    renderWithProviders(<ChannelList />)

    expect(await screen.findByText("Você ainda não tem nenhum canal.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Criar meu primeiro canal" })).toHaveAttribute(
      "href",
      "/channels/new",
    )
  })

  it("should show an error message when the request fails", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/channels`, () =>
        HttpResponse.json({ error: { code: "INTERNAL_ERROR", message: "boom" } }, { status: 500 }),
      ),
    )

    renderWithProviders(<ChannelList />)

    expect(await screen.findByText("Não foi possível carregar seus canais.")).toBeInTheDocument()
  })
})
