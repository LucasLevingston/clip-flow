import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { AdminGate } from "./AdminGate"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

describe("AdminGate", () => {
  it("should render children when the current user is a platform admin", async () => {
    renderWithProviders(
      <AdminGate>
        <p>Conteúdo administrativo</p>
      </AdminGate>,
    )

    expect(await screen.findByText("Conteúdo administrativo")).toBeInTheDocument()
  })

  it("should show an access-restricted message for a non-admin user", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/auth/me`, () =>
        HttpResponse.json({
          user: { id: "user-1", email: "user@clipflow.app", isPlatformAdmin: false },
          tenant: { id: "tenant-1", name: "Clip Flow" },
          role: "OWNER",
        }),
      ),
    )

    renderWithProviders(
      <AdminGate>
        <p>Conteúdo administrativo</p>
      </AdminGate>,
    )

    expect(await screen.findByText("Acesso restrito")).toBeInTheDocument()
    expect(screen.queryByText("Conteúdo administrativo")).not.toBeInTheDocument()
  })

  it("should show an access-restricted message when the current-user request fails", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/auth/me`, () =>
        HttpResponse.json({ error: { code: "UNAUTHORIZED", message: "boom" } }, { status: 401 }),
      ),
    )

    renderWithProviders(
      <AdminGate>
        <p>Conteúdo administrativo</p>
      </AdminGate>,
    )

    expect(await screen.findByText("Acesso restrito")).toBeInTheDocument()
  })
})
