import { screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { RequireAuth } from "./RequireAuth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"
const replaceMock = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

describe("RequireAuth", () => {
  afterEach(() => {
    replaceMock.mockClear()
  })

  it("should render children when there is a valid session", async () => {
    renderWithProviders(
      <RequireAuth>
        <p>Conteúdo protegido</p>
      </RequireAuth>,
    )

    expect(await screen.findByText("Conteúdo protegido")).toBeInTheDocument()
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it("should redirect to /login when there is no valid session", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/auth/me`, () =>
        HttpResponse.json({ error: { code: "UNAUTHORIZED", message: "boom" } }, { status: 401 }),
      ),
    )

    renderWithProviders(
      <RequireAuth>
        <p>Conteúdo protegido</p>
      </RequireAuth>,
    )

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"))
    expect(screen.queryByText("Conteúdo protegido")).not.toBeInTheDocument()
  })
})
