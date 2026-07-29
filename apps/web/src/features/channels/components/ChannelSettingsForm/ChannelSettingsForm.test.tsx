import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { channelDetailStore } from "../../mocks/channelDetailStore"
import { ChannelSettingsForm } from "./ChannelSettingsForm"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

describe("ChannelSettingsForm", () => {
  afterEach(() => {
    channelDetailStore.reset()
  })

  it("should load the channel and show its current config", async () => {
    renderWithProviders(<ChannelSettingsForm channelId="channel-1" />)

    expect(await screen.findByDisplayValue("Meu Canal")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Futebol")).toBeDisabled()
    expect(screen.getByText("Status atual: ACTIVE")).toBeInTheDocument()
  })

  it("should save updated config", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ChannelSettingsForm channelId="channel-1" />)

    await screen.findByDisplayValue("Meu Canal")
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }))

    expect(await screen.findByText("Configuração salva!")).toBeInTheDocument()
  })

  it("should pause an active channel", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ChannelSettingsForm channelId="channel-1" />)

    await screen.findByText("Status atual: ACTIVE")
    await user.click(screen.getByRole("button", { name: "Pausar" }))

    await waitFor(() => expect(screen.getByText("Status atual: PAUSED")).toBeInTheDocument())
  })

  it("should show an error when the channel is not ready to activate", async () => {
    server.use(
      http.patch(`${API_BASE_URL}/v1/channels/:channelId/status`, () =>
        HttpResponse.json(
          { error: { code: "CHANNEL_NOT_READY", message: "Channel is not ready to publish" } },
          { status: 422 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<ChannelSettingsForm channelId="channel-1" />)

    await screen.findByText("Status atual: ACTIVE")
    await user.click(screen.getByRole("button", { name: "Pausar" }))

    expect(await screen.findByText("Channel is not ready to publish")).toBeInTheDocument()
  })

  it("should resume a paused channel", async () => {
    server.use(
      http.get(
        `${API_BASE_URL}/v1/channels/:channelId`,
        () =>
          HttpResponse.json({
            id: "channel-1",
            nicheId: "niche-1",
            nicheName: "Futebol",
            name: "Meu Canal",
            language: "pt-BR",
            promptOverride: null,
            videosPerDay: 1,
            publishTimes: ["09:00"],
            generationTime: "09:00",
            platforms: "SHORTS_ONLY",
            thumbnailEnabled: true,
            status: "PAUSED",
            socialAccounts: [],
          }),
        { once: true },
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<ChannelSettingsForm channelId="channel-1" />)

    await screen.findByText("Status atual: PAUSED")
    await user.click(screen.getByRole("button", { name: "Retomar" }))

    await waitFor(() => expect(screen.getByText("Status atual: ACTIVE")).toBeInTheDocument())
  })

  it("should show the connect-account prompt for a DRAFT channel", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/channels/:channelId`, () =>
        HttpResponse.json({
          id: "channel-1",
          nicheId: "niche-1",
          nicheName: "Futebol",
          name: "Meu Canal",
          language: "pt-BR",
          promptOverride: null,
          videosPerDay: 1,
          publishTimes: ["09:00"],
          generationTime: "09:00",
          platforms: "SHORTS_ONLY",
          thumbnailEnabled: true,
          status: "DRAFT",
          socialAccounts: [],
        }),
      ),
    )
    renderWithProviders(<ChannelSettingsForm channelId="channel-1" />)

    expect(
      await screen.findByText("Conecte ao menos uma conta social para ativar este canal."),
    ).toBeInTheDocument()
  })

  it("should show an error when saving the config fails", async () => {
    server.use(
      http.patch(`${API_BASE_URL}/v1/channels/:channelId`, () =>
        HttpResponse.json(
          { error: { code: "VALIDATION_ERROR", message: "Invalid config" } },
          { status: 422 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<ChannelSettingsForm channelId="channel-1" />)

    await screen.findByDisplayValue("Meu Canal")
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }))

    expect(await screen.findByText("Não foi possível salvar a configuração.")).toBeInTheDocument()
  })
})
