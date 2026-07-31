import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { LogoutButton } from "./LogoutButton"

const pushMock = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}))

describe("LogoutButton", () => {
  afterEach(() => {
    pushMock.mockClear()
  })

  it("should log out and redirect to /login", async () => {
    const user = userEvent.setup()
    renderWithProviders(<LogoutButton />)

    await user.click(screen.getByRole("button", { name: "Sair" }))

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login"))
  })
})
