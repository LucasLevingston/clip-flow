import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { PromptTemplateForm } from "./PromptTemplateForm"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

describe("PromptTemplateForm", () => {
  it("should create a prompt template and show the resulting version", async () => {
    const user = userEvent.setup()
    renderWithProviders(<PromptTemplateForm />)

    await screen.findByRole("option", { name: "Futebol" })
    await user.selectOptions(screen.getByDisplayValue("Selecione um nicho"), "niche-1")
    await user.type(
      screen.getByPlaceholderText("Conteúdo do prompt"),
      "Selecione os melhores momentos",
    )
    await user.click(screen.getByRole("button", { name: "Salvar prompt" }))

    expect(await screen.findByText("Prompt salvo como versão 1.")).toBeInTheDocument()
  })

  it("should disable the submit button until a niche is selected", () => {
    renderWithProviders(<PromptTemplateForm />)

    expect(screen.getByRole("button", { name: "Salvar prompt" })).toBeDisabled()
  })

  it("should show an error message when saving fails", async () => {
    server.use(
      http.post(`${API_BASE_URL}/v1/admin/niches/:nicheId/prompt-templates`, () =>
        HttpResponse.json({ error: { code: "NICHE_NOT_FOUND", message: "boom" } }, { status: 404 }),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<PromptTemplateForm />)

    await screen.findByRole("option", { name: "Futebol" })
    await user.selectOptions(screen.getByDisplayValue("Selecione um nicho"), "niche-1")
    await user.type(screen.getByPlaceholderText("Conteúdo do prompt"), "conteudo")
    await user.click(screen.getByRole("button", { name: "Salvar prompt" }))

    expect(await screen.findByText("Não foi possível salvar o prompt.")).toBeInTheDocument()
  })
})
