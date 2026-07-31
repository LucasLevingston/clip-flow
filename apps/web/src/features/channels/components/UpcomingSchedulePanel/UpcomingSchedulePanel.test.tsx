import { screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { channelDetailStore } from "../../mocks/channelDetailStore"
import { UpcomingSchedulePanel } from "./UpcomingSchedulePanel"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

describe("UpcomingSchedulePanel", () => {
  afterEach(() => {
    channelDetailStore.reset()
  })

  it("should show the generation time and publish times for an active channel", async () => {
    renderWithProviders(<UpcomingSchedulePanel channelId="channel-1" />)

    expect(await screen.findByText("Próximos agendamentos")).toBeInTheDocument()
    expect(screen.getByText("Geração diária às 09:00")).toBeInTheDocument()
    expect(screen.getByText("09:00")).toBeInTheDocument()
  })

  it("should render nothing for a DRAFT channel", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/channels/:channelId`, () =>
        HttpResponse.json({ ...channelDetailStore.state, status: "DRAFT" }),
      ),
    )

    const { container } = renderWithProviders(<UpcomingSchedulePanel channelId="channel-1" />)

    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument())
    expect(container).toBeEmptyDOMElement()
  })
})
