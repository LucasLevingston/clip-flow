import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { nichesStore } from "../../mocks/nichesStore"
import { NicheManager } from "./NicheManager"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

describe("NicheManager", () => {
  afterEach(() => {
    nichesStore.reset()
  })

  it("should list niches with their status", async () => {
    renderWithProviders(<NicheManager />)

    expect(await screen.findByText("Futebol")).toBeInTheDocument()
    expect(screen.getByText("Basquete")).toBeInTheDocument()
    expect(screen.getByText("Ativo")).toBeInTheDocument()
    expect(screen.getByText("Inativo")).toBeInTheDocument()
  })

  it("should create a niche via the form", async () => {
    const user = userEvent.setup()
    renderWithProviders(<NicheManager />)

    await screen.findByText("Futebol")
    await user.type(screen.getByLabelText("Nome"), "Vôlei")
    await user.type(screen.getByLabelText("Slug"), "volei")
    await user.type(screen.getByLabelText("Categoria"), "Esportes")
    await user.click(screen.getByRole("button", { name: "Criar nicho" }))

    await waitFor(() => expect(screen.getByLabelText("Nome")).toHaveValue(""))
  })

  it("should toggle a niche's status", async () => {
    const user = userEvent.setup()
    renderWithProviders(<NicheManager />)

    await screen.findByText("Futebol")
    await user.click(screen.getByRole("button", { name: "Desativar" }))

    await waitFor(() => expect(screen.getAllByText("Inativo")).toHaveLength(2))
  })

  it("should show an error message when the list request fails", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/admin/niches`, () =>
        HttpResponse.json({ error: { code: "INTERNAL_ERROR", message: "boom" } }, { status: 500 }),
      ),
    )

    renderWithProviders(<NicheManager />)

    expect(await screen.findByText("Não foi possível carregar os nichos.")).toBeInTheDocument()
  })
})
