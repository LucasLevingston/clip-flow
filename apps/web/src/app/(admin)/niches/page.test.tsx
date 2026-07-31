import { screen } from "@testing-library/react"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import AdminNichesPage from "./page"

describe("AdminNichesPage", () => {
  it("should render the admin niches heading and its sections", async () => {
    renderWithProviders(<AdminNichesPage />)

    expect(screen.getByRole("heading", { name: "Administração de nichos" })).toBeInTheDocument()
    expect(await screen.findAllByText("Futebol")).not.toHaveLength(0)
  })
})
