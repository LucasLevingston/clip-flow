import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { RunNowButton } from "./RunNowButton"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

describe("RunNowButton", () => {
  it("should trigger generation and show a success message", async () => {
    const user = userEvent.setup()
    renderWithProviders(<RunNowButton channelId="channel-1" />)

    await user.click(screen.getByRole("button", { name: "Executar agora" }))

    expect(
      await screen.findByText("Geração disparada — acompanhe o progresso na lista de vídeos."),
    ).toBeInTheDocument()
  })

  it("should show an error message when the trigger fails", async () => {
    server.use(
      http.post(`${API_BASE_URL}/v1/channels/:channelId/generate-now`, () =>
        HttpResponse.json(
          { error: { code: "CHANNEL_NOT_ACTIVE", message: "boom" } },
          { status: 409 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<RunNowButton channelId="channel-1" />)

    await user.click(screen.getByRole("button", { name: "Executar agora" }))

    expect(
      await screen.findByText("Não foi possível disparar a geração agora."),
    ).toBeInTheDocument()
  })
})
