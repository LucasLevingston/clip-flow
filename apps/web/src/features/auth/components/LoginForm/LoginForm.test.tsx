import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { LoginForm } from "./LoginForm"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"
const pushMock = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}))

describe("LoginForm", () => {
  afterEach(() => {
    pushMock.mockClear()
  })

  it("should log in and redirect to the dashboard on success", async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText("E-mail"), "user@example.com")
    await user.type(screen.getByLabelText("Senha"), "Senha123")
    await user.click(screen.getByRole("button", { name: "Entrar" }))

    await screen.findByRole("button", { name: "Entrar" })
    expect(pushMock).toHaveBeenCalledWith("/")
  })

  it("should show a validation error for an invalid e-mail", async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText("E-mail"), "not-an-email")
    await user.type(screen.getByLabelText("Senha"), "Senha123")
    await user.click(screen.getByRole("button", { name: "Entrar" }))

    expect(await screen.findByRole("alert")).toBeInTheDocument()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it("should show an error message when login fails", async () => {
    server.use(
      http.post(`${API_BASE_URL}/v1/auth/login`, () =>
        HttpResponse.json(
          { error: { code: "INVALID_CREDENTIALS", message: "boom" } },
          { status: 401 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText("E-mail"), "user@example.com")
    await user.type(screen.getByLabelText("Senha"), "wrong-password")
    await user.click(screen.getByRole("button", { name: "Entrar" }))

    expect(await screen.findByText("E-mail ou senha inválidos.")).toBeInTheDocument()
  })

  it("should link to the register page", () => {
    renderWithProviders(<LoginForm />)

    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/register")
  })
})
