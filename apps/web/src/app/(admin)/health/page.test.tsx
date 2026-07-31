import { screen } from "@testing-library/react"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import AdminHealthPage from "./page"

describe("AdminHealthPage", () => {
  it("should render the platform health heading and dashboard", async () => {
    renderWithProviders(<AdminHealthPage />)

    expect(screen.getByRole("heading", { name: "Saúde da plataforma" })).toBeInTheDocument()
    expect(await screen.findByText("video")).toBeInTheDocument()
  })
})
