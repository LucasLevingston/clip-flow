import { screen } from "@testing-library/react"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import HomePage from "./page"

describe("HomePage", () => {
  it("should render the product name as the main heading", () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByRole("heading", { name: "Clip Flow" })).toBeInTheDocument()
  })

  it("should render the value proposition copy", () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByText(/crie um canal, escolha um nicho/i)).toBeInTheDocument()
  })

  it("should render the channel list", async () => {
    renderWithProviders(<HomePage />)

    expect(await screen.findByText("Canal Futebol")).toBeInTheDocument()
  })
})
