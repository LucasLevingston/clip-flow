import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { VideoFilters } from "./VideoFilters"

describe("VideoFilters", () => {
  it("should call onChange with the updated platform", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<VideoFilters value={{ platform: "", status: "" }} onChange={onChange} />)

    await user.selectOptions(screen.getByLabelText("Filtrar por plataforma"), "YOUTUBE")

    expect(onChange).toHaveBeenCalledWith({ platform: "YOUTUBE", status: "" })
  })

  it("should call onChange with the updated status", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<VideoFilters value={{ platform: "", status: "" }} onChange={onChange} />)

    await user.selectOptions(screen.getByLabelText("Filtrar por status"), "PUBLISHED")

    expect(onChange).toHaveBeenCalledWith({ platform: "", status: "PUBLISHED" })
  })
})
