import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { AnalyticsSummary } from "./AnalyticsSummary"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

describe("AnalyticsSummary", () => {
  it("should render the summary tiles with real data", async () => {
    renderWithProviders(<AnalyticsSummary channelId="channel-1" />)

    expect(await screen.findByText("1.500")).toBeInTheDocument()
    expect(screen.getByText("Vídeos publicados")).toBeInTheDocument()
  })

  it("should render an accessible data table alongside the chart", async () => {
    renderWithProviders(<AnalyticsSummary channelId="channel-1" />)

    await screen.findByText("1.500")
    expect(screen.getByText("Visualizações por plataforma")).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Plataforma" })).toBeInTheDocument()
  })

  it("should show an error message when the request fails", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/analytics/summary`, () =>
        HttpResponse.json({ error: { code: "INTERNAL_ERROR", message: "boom" } }, { status: 500 }),
      ),
    )

    renderWithProviders(<AnalyticsSummary channelId="channel-1" />)

    expect(await screen.findByText("Não foi possível carregar as métricas.")).toBeInTheDocument()
  })
})
