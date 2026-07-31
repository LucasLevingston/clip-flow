import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { RegisterForm } from "./RegisterForm"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"
const pushMock = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}))

describe("RegisterForm", () => {
  afterEach(() => {
    pushMock.mockClear()
  })

  it("should create the tenant and redirect to the dashboard on success", async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterForm />)

    await user.type(screen.getByLabelText("Nome da organização"), "Minha Empresa")
    await user.type(screen.getByLabelText("E-mail"), "user@example.com")
    await user.type(screen.getByLabelText("Senha"), "Senha123")
    await user.click(screen.getByRole("button", { name: "Criar conta" }))

    await screen.findByRole("button", { name: "Criar conta" })
    expect(pushMock).toHaveBeenCalledWith("/")
  })

  it("should show a validation error for a weak password", async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterForm />)

    await user.type(screen.getByLabelText("Nome da organização"), "Minha Empresa")
    await user.type(screen.getByLabelText("E-mail"), "user@example.com")
    await user.type(screen.getByLabelText("Senha"), "weak")
    await user.click(screen.getByRole("button", { name: "Criar conta" }))

    expect(await screen.findByRole("alert")).toBeInTheDocument()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it("should show an error message when registration fails", async () => {
    server.use(
      http.post(`${API_BASE_URL}/v1/auth/register`, () =>
        HttpResponse.json(
          { error: { code: "EMAIL_ALREADY_IN_USE", message: "boom" } },
          { status: 409 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<RegisterForm />)

    await user.type(screen.getByLabelText("Nome da organização"), "Minha Empresa")
    await user.type(screen.getByLabelText("E-mail"), "user@example.com")
    await user.type(screen.getByLabelText("Senha"), "Senha123")
    await user.click(screen.getByRole("button", { name: "Criar conta" }))

    expect(await screen.findByText("Não foi possível criar sua conta.")).toBeInTheDocument()
  })

  it("should link to the login page", () => {
    renderWithProviders(<RegisterForm />)

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login")
  })
})
