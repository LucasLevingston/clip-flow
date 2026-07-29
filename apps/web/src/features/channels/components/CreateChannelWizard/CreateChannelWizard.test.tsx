import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { CreateChannelWizard } from "./CreateChannelWizard"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

async function fillConfigStep(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Nome do canal"), "Meu Canal de Futebol")
  await user.clear(screen.getByLabelText("Idioma"))
  await user.type(screen.getByLabelText("Idioma"), "pt-BR")
  await user.clear(screen.getByLabelText("Vídeos por dia"))
  await user.type(screen.getByLabelText("Vídeos por dia"), "1")
  await user.type(screen.getByLabelText("Horário de geração"), "06:00")
}

async function completeWizard(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => expect(screen.getByLabelText("Futebol")).toBeInTheDocument())
  await user.click(screen.getByLabelText("Futebol"))
  await user.click(screen.getByRole("button", { name: "Avançar" }))

  await fillConfigStep(user)
  await user.click(screen.getByRole("button", { name: "Avançar" }))

  await user.click(screen.getByLabelText("Apenas YouTube Shorts"))
}

describe("CreateChannelWizard", () => {
  it("should render the niche step first", async () => {
    renderWithProviders(<CreateChannelWizard />)

    expect(await screen.findByText("Futebol")).toBeInTheDocument()
    expect(screen.queryByLabelText("Nome do canal")).not.toBeInTheDocument()
  })

  it("should block advancing past the niche step without a selection", async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateChannelWizard />)

    await waitFor(() => expect(screen.getByLabelText("Futebol")).toBeInTheDocument())
    await user.click(screen.getByRole("button", { name: "Avançar" }))

    expect(screen.queryByLabelText("Nome do canal")).not.toBeInTheDocument()
  })

  it("should walk through every step and create the channel", async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateChannelWizard />)

    await completeWizard(user)
    await user.click(screen.getByRole("button", { name: "Criar canal" }))

    expect(await screen.findByText("Canal criado com sucesso!")).toBeInTheDocument()
  })

  it("should show an upgrade CTA when the plan's channel limit is exceeded", async () => {
    server.use(
      http.post(`${API_BASE_URL}/v1/channels`, () =>
        HttpResponse.json(
          { error: { code: "PLAN_LIMIT_EXCEEDED", message: "Channel limit reached" } },
          { status: 422 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<CreateChannelWizard />)

    await completeWizard(user)
    await user.click(screen.getByRole("button", { name: "Criar canal" }))

    expect(await screen.findByText("Limite de canais do seu plano atingido.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Fazer upgrade de plano" })).toHaveAttribute(
      "href",
      "/billing",
    )
  })
})
