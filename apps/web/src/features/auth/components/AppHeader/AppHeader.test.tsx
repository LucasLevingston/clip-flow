import { screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { AppHeader } from "./AppHeader"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

describe("AppHeader", () => {
  it("should show the tenant name and an admin link for a platform admin", async () => {
    renderWithProviders(<AppHeader />)

    expect(screen.getByRole("link", { name: "Clip Flow" })).toHaveAttribute("href", "/")
    await waitFor(() => expect(screen.getAllByText("Clip Flow")).toHaveLength(2))
    expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute("href", "/niches")
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument()
  })

  it("should hide the admin link for a non-admin user", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/auth/me`, () =>
        HttpResponse.json({
          user: { id: "user-1", email: "user@clipflow.app", isPlatformAdmin: false },
          tenant: { id: "tenant-1", name: "Minha Empresa" },
          role: "OWNER",
        }),
      ),
    )

    renderWithProviders(<AppHeader />)

    await screen.findByText("Minha Empresa")
    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument()
  })
})
