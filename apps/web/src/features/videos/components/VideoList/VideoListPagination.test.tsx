import { fireEvent, render, screen } from "@testing-library/react"
import { VideoListPagination } from "./VideoListPagination"

describe("VideoListPagination", () => {
  it("should disable Anterior on the first page and Próxima on the last page", () => {
    render(
      <VideoListPagination
        page={1}
        pageSize={20}
        total={5}
        onPrevious={jest.fn()}
        onNext={jest.fn()}
      />,
    )

    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled()
    expect(screen.getByText("Página 1 de 1")).toBeInTheDocument()
  })

  it("should enable both controls and call the callbacks when clicked", () => {
    const onPrevious = jest.fn()
    const onNext = jest.fn()
    render(
      <VideoListPagination
        page={2}
        pageSize={20}
        total={60}
        onPrevious={onPrevious}
        onNext={onNext}
      />,
    )

    expect(screen.getByText("Página 2 de 3")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Anterior" }))
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }))

    expect(onPrevious).toHaveBeenCalledTimes(1)
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})
