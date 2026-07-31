import { screen, waitFor } from "@testing-library/react"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import OAuthCallbackPage from "./page"

const replaceMock = jest.fn()
let searchParamsValue = new URLSearchParams()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => searchParamsValue,
}))

describe("OAuthCallbackPage", () => {
  afterEach(() => {
    replaceMock.mockClear()
    window.sessionStorage.clear()
    searchParamsValue = new URLSearchParams()
  })

  it("should complete a fresh connection and redirect to channel settings", async () => {
    window.sessionStorage.setItem(
      "clipflow_oauth_pending",
      JSON.stringify({ channelId: "channel-1", platform: "YOUTUBE", accountId: null }),
    )
    searchParamsValue = new URLSearchParams({ code: "auth-code", state: "signed-state" })

    renderWithProviders(<OAuthCallbackPage />)

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/channels/channel-1/settings"))
  })

  it("should show an error when there is no pending connection stashed", async () => {
    searchParamsValue = new URLSearchParams({ code: "auth-code", state: "signed-state" })

    renderWithProviders(<OAuthCallbackPage />)

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível concluir a conexão.",
    )
  })

  it("should show an error when the code or state is missing from the callback URL", async () => {
    window.sessionStorage.setItem(
      "clipflow_oauth_pending",
      JSON.stringify({ channelId: "channel-1", platform: "YOUTUBE", accountId: null }),
    )
    searchParamsValue = new URLSearchParams()

    renderWithProviders(<OAuthCallbackPage />)

    expect(await screen.findByRole("alert")).toBeInTheDocument()
  })
})
