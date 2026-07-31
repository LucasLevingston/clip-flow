import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { contentSourceConfigsStore } from "../../mocks/contentSourceConfigsStore"
import { ContentSourceManager } from "./ContentSourceManager"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

describe("ContentSourceManager", () => {
  afterEach(() => {
    contentSourceConfigsStore.reset()
  })

  it("should hide the form and list until a niche is selected", async () => {
    renderWithProviders(<ContentSourceManager />)

    await screen.findByRole("option", { name: "Futebol" })
    expect(screen.queryByPlaceholderText("Nome da fonte")).not.toBeInTheDocument()
  })

  it("should create an RSS content source for the selected niche", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContentSourceManager />)

    await screen.findByRole("option", { name: "Futebol" })
    await user.selectOptions(screen.getByDisplayValue("Selecione um nicho"), "niche-1")
    await user.type(screen.getByPlaceholderText("Nome da fonte"), "Feed do Parceiro")
    await user.type(
      screen.getByPlaceholderText("URL do feed"),
      "https://partner.example.com/feed.xml",
    )
    await user.type(screen.getByPlaceholderText("Referência da licença"), "contract-123")
    await user.click(screen.getByRole("button", { name: "Adicionar fonte" }))

    expect(await screen.findByText("Feed do Parceiro")).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "Feed RSS" })).toBeInTheDocument()
  })

  it("should switch the settings fields when the provider type changes", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContentSourceManager />)

    await screen.findByRole("option", { name: "Futebol" })
    await user.selectOptions(screen.getByDisplayValue("Selecione um nicho"), "niche-1")
    await user.selectOptions(screen.getByDisplayValue("Feed RSS"), "LOCAL_FOLDER")

    expect(screen.getByPlaceholderText("Caminho da pasta")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("URL base (servida via HTTP)")).toBeInTheDocument()

    await user.selectOptions(screen.getByDisplayValue("Pasta local"), "PARTNER_API")

    expect(screen.getByPlaceholderText("URL da API")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Chave da API")).toBeInTheDocument()

    await user.selectOptions(screen.getByDisplayValue("Acordo com parceiro"), "PUBLIC_DOMAIN")

    expect(screen.getByDisplayValue("Domínio público")).toBeInTheDocument()
  })

  it("should show an inactive badge for a disabled content source", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/admin/niches/:nicheId/content-sources`, () =>
        HttpResponse.json([
          {
            id: "content-source-1",
            nicheId: "niche-1",
            providerType: "RSS_FEED",
            name: "Feed Antigo",
            settings: { feedUrl: "https://partner.example.com/feed.xml" },
            licenseType: "PARTNER_AGREEMENT",
            licenseReference: "contract-123",
            isActive: false,
            createdAt: "2026-07-31T00:00:00.000Z",
          },
        ]),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<ContentSourceManager />)

    await screen.findByRole("option", { name: "Futebol" })
    await user.selectOptions(screen.getByDisplayValue("Selecione um nicho"), "niche-1")

    expect(await screen.findByText("Inativa")).toBeInTheDocument()
  })

  it("should use the canned default discover result when no override is set", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContentSourceManager />)

    await screen.findByRole("option", { name: "Futebol" })
    await user.selectOptions(screen.getByDisplayValue("Selecione um nicho"), "niche-1")
    await user.click(screen.getByRole("button", { name: "Buscar conteúdo agora" }))

    expect(await screen.findByText("0 encontrados, 0 novos, 0 já existentes.")).toBeInTheDocument()
  })

  it("should run discovery and show the result summary", async () => {
    server.use(
      http.post(`${API_BASE_URL}/v1/admin/niches/:nicheId/content-sources/discover`, () =>
        HttpResponse.json({ discovered: 3, ingested: 2, skipped: 1, failedSources: [] }),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<ContentSourceManager />)

    await screen.findByRole("option", { name: "Futebol" })
    await user.selectOptions(screen.getByDisplayValue("Selecione um nicho"), "niche-1")
    await user.click(screen.getByRole("button", { name: "Buscar conteúdo agora" }))

    expect(await screen.findByText("3 encontrados, 2 novos, 1 já existentes.")).toBeInTheDocument()
  })

  it("should show the failed-sources count when discovery partially fails", async () => {
    server.use(
      http.post(`${API_BASE_URL}/v1/admin/niches/:nicheId/content-sources/discover`, () =>
        HttpResponse.json({
          discovered: 1,
          ingested: 1,
          skipped: 0,
          failedSources: [{ contentSourceConfigId: "config-1", name: "Feed", message: "boom" }],
        }),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<ContentSourceManager />)

    await screen.findByRole("option", { name: "Futebol" })
    await user.selectOptions(screen.getByDisplayValue("Selecione um nicho"), "niche-1")
    await user.click(screen.getByRole("button", { name: "Buscar conteúdo agora" }))

    await waitFor(() => expect(screen.getByText(/1 fonte\(s\) falharam/)).toBeInTheDocument())
  })

  it("should show an empty state when the niche has no configured sources", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContentSourceManager />)

    await screen.findByRole("option", { name: "Futebol" })
    await user.selectOptions(screen.getByDisplayValue("Selecione um nicho"), "niche-1")

    expect(
      await screen.findByText("Nenhuma fonte configurada para este nicho."),
    ).toBeInTheDocument()
  })
})
