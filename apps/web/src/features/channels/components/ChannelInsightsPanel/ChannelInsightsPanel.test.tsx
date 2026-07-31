import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { ChannelInsightsPanel } from "./ChannelInsightsPanel"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

describe("ChannelInsightsPanel", () => {
  it("should render the computed insights", async () => {
    renderWithProviders(<ChannelInsightsPanel channelId="channel-1" />)

    expect(await screen.findByText(/9h, 20h/)).toBeInTheDocument()
    expect(screen.getByText(/incrivel, gol/)).toBeInTheDocument()
    expect(screen.getByText(/0:31/)).toBeInTheDocument()
  })

  it("should show an explanatory empty state on a 204 response, without an infinite spinner", async () => {
    server.use(
      http.get(
        `${API_BASE_URL}/v1/channels/:channelId/insights`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    )

    renderWithProviders(<ChannelInsightsPanel channelId="channel-1" />)

    expect(await screen.findByText(/Ainda não há histórico suficiente/)).toBeInTheDocument()
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("should show an error message when the request fails", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/channels/:channelId/insights`, () =>
        HttpResponse.json(
          { error: { code: "CHANNEL_NOT_FOUND", message: "boom" } },
          { status: 404 },
        ),
      ),
    )

    renderWithProviders(<ChannelInsightsPanel channelId="channel-1" />)

    expect(await screen.findByText("Não foi possível carregar os insights.")).toBeInTheDocument()
  })
})
