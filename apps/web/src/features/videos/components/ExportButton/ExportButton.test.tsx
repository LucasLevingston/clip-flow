import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { ExportButton } from "./ExportButton"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

describe("ExportButton", () => {
  beforeAll(() => {
    URL.createObjectURL = jest.fn(() => "blob:mock-url")
    URL.revokeObjectURL = jest.fn()
  })

  it("should download the CSV with the applied filters and disable while exporting", async () => {
    let capturedUrl = ""
    server.use(
      http.get(`${API_BASE_URL}/v1/videos/export`, ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse("id,name\n1,a", { status: 200 })
      }),
    )
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
    const user = userEvent.setup()

    renderWithProviders(<ExportButton filters={{ channelId: "channel-1", platform: "YOUTUBE" }} />)
    const button = screen.getByRole("button", { name: "Exportar CSV" })

    await user.click(button)

    await waitFor(() => expect(button).not.toBeDisabled())
    expect(capturedUrl).toContain("channelId=channel-1")
    expect(capturedUrl).toContain("platform=YOUTUBE")
    expect(clickSpy).toHaveBeenCalled()

    clickSpy.mockRestore()
  })
})
