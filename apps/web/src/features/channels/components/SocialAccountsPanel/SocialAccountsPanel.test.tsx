import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { channelDetailStore } from "../../mocks/channelDetailStore"
import type { ChannelDetail } from "../../types"
import { SocialAccountsPanel } from "./SocialAccountsPanel"

function buildChannel(overrides: Partial<ChannelDetail> = {}): ChannelDetail {
  return {
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
    status: "ACTIVE",
    socialAccounts: [],
    ...overrides,
  }
}

describe("SocialAccountsPanel", () => {
  afterEach(() => {
    channelDetailStore.reset()
    window.sessionStorage.clear()
  })

  it("should show a not-connected badge and a connect button when there's no account", () => {
    renderWithProviders(<SocialAccountsPanel channel={buildChannel()} />)

    expect(screen.getByText("YouTube")).toBeInTheDocument()
    expect(screen.getByText("Não conectado")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Conectar" })).toBeInTheDocument()
  })

  it("should start the OAuth flow and stash the pending connection on connect", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SocialAccountsPanel channel={buildChannel()} />)

    await user.click(screen.getByRole("button", { name: "Conectar" }))

    await waitFor(() => {
      const pending = window.sessionStorage.getItem("clipflow_oauth_pending")
      expect(pending).toBeTruthy()
    })
    const pending = JSON.parse(window.sessionStorage.getItem("clipflow_oauth_pending") ?? "{}") as {
      channelId: string
      platform: string
      accountId: string | null
    }
    expect(pending).toEqual({ channelId: "channel-1", platform: "YOUTUBE", accountId: null })
  })

  it("should show a connected badge and a disconnect button for a connected account", () => {
    const channel = buildChannel({
      socialAccounts: [
        {
          id: "account-1",
          platform: "YOUTUBE",
          externalAccountId: "yt-1",
          status: "CONNECTED",
          connectedAt: "2026-07-01T00:00:00.000Z",
        },
      ],
    })

    renderWithProviders(<SocialAccountsPanel channel={channel} />)

    expect(screen.getByText("Conectado")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Desconectar" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Reconectar" })).not.toBeInTheDocument()
  })

  it("should show a reauth prompt for a NEEDS_REAUTH account", () => {
    const channel = buildChannel({
      socialAccounts: [
        {
          id: "account-1",
          platform: "YOUTUBE",
          externalAccountId: "yt-1",
          status: "NEEDS_REAUTH",
          connectedAt: "2026-07-01T00:00:00.000Z",
        },
      ],
    })

    renderWithProviders(<SocialAccountsPanel channel={channel} />)

    expect(screen.getByText("Reconexão necessária")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Reconectar" })).toBeInTheDocument()
  })

  it("should call the disconnect endpoint and remove the account from the backing store", async () => {
    const user = userEvent.setup()
    channelDetailStore.state = {
      ...channelDetailStore.state,
      socialAccounts: [
        {
          id: "account-1",
          platform: "YOUTUBE",
          externalAccountId: "yt-1",
          status: "CONNECTED",
          connectedAt: "2026-07-01T00:00:00.000Z",
        },
      ],
    }
    const channel = buildChannel({
      socialAccounts: channelDetailStore.state.socialAccounts as ChannelDetail["socialAccounts"],
    })
    renderWithProviders(<SocialAccountsPanel channel={channel} />)

    await user.click(screen.getByRole("button", { name: "Desconectar" }))

    await waitFor(() => expect(channelDetailStore.state.socialAccounts).toHaveLength(0))
  })

  it("should list both platforms when the channel publishes to BOTH", () => {
    renderWithProviders(<SocialAccountsPanel channel={buildChannel({ platforms: "BOTH" })} />)

    expect(screen.getByText("YouTube")).toBeInTheDocument()
    expect(screen.getByText("TikTok")).toBeInTheDocument()
  })
})
