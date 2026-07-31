import { screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { HealthDashboard } from "./HealthDashboard"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

describe("HealthDashboard", () => {
  it("should render queue stats and integration statuses", async () => {
    renderWithProviders(<HealthDashboard />)

    expect(await screen.findByText("video")).toBeInTheDocument()
    expect(screen.getByText("ai")).toBeInTheDocument()
    expect(screen.getByText("youtube")).toBeInTheDocument()
    expect(screen.getByText("Operacional")).toBeInTheDocument()
    expect(screen.getByText("Degradado")).toBeInTheDocument()
  })

  it("should show empty states when no snapshot has been written yet", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/admin/health`, () =>
        HttpResponse.json({ queues: [], integrations: [] }),
      ),
    )

    renderWithProviders(<HealthDashboard />)

    expect(await screen.findByText("Nenhum dado de fila ainda.")).toBeInTheDocument()
    expect(screen.getByText("Nenhum dado de integração ainda.")).toBeInTheDocument()
  })

  it("should show an error message when the request fails", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/admin/health`, () =>
        HttpResponse.json({ error: { code: "INTERNAL_ERROR", message: "boom" } }, { status: 500 }),
      ),
    )

    renderWithProviders(<HealthDashboard />)

    expect(
      await screen.findByText("Não foi possível carregar a saúde da plataforma."),
    ).toBeInTheDocument()
  })
})
