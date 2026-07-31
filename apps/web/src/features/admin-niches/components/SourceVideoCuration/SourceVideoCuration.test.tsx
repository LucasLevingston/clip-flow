import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { renderWithProviders } from "@/test-utils/renderWithProviders"
import { sourceVideosStore } from "../../mocks/sourceVideosStore"
import { SourceVideoCuration } from "./SourceVideoCuration"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

describe("SourceVideoCuration", () => {
  afterEach(() => {
    sourceVideosStore.reset()
  })

  it("should list pending source videos", async () => {
    renderWithProviders(<SourceVideoCuration />)

    expect(await screen.findByText("s3://bucket/video.mp4")).toBeInTheDocument()
    expect(screen.getAllByText("Aguardando revisão").length).toBeGreaterThan(0)
  })

  it("should approve a pending source video and remove it from the pending filter", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SourceVideoCuration />)

    await screen.findByText("s3://bucket/video.mp4")
    await user.click(screen.getByRole("button", { name: "Aprovar" }))

    await waitFor(() => expect(screen.queryByText("s3://bucket/video.mp4")).not.toBeInTheDocument())
  })

  it("should reject a pending source video", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SourceVideoCuration />)

    await screen.findByText("s3://bucket/video.mp4")
    await user.click(screen.getByRole("button", { name: "Rejeitar" }))

    await waitFor(() => expect(screen.queryByText("s3://bucket/video.mp4")).not.toBeInTheDocument())
  })

  it("should ingest a new source video", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SourceVideoCuration />)

    await screen.findByText("s3://bucket/video.mp4")
    await screen.findByRole("option", { name: "Futebol" })
    await user.selectOptions(screen.getByDisplayValue("Nicho"), "niche-1")
    await user.type(screen.getByPlaceholderText("URL de armazenamento"), "s3://bucket/new.mp4")
    await user.type(screen.getByPlaceholderText("Duração (s)"), "300")
    await user.type(screen.getByPlaceholderText("Referência da licença"), "https://example.com/ref")
    await user.click(screen.getByRole("button", { name: "Adicionar vídeo-fonte" }))

    expect(await screen.findByText("s3://bucket/new.mp4")).toBeInTheDocument()
  })

  it("should filter by status", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SourceVideoCuration />)

    await screen.findByText("s3://bucket/video.mp4")
    await user.selectOptions(screen.getByDisplayValue("Aguardando revisão"), "APPROVED")

    await waitFor(() =>
      expect(screen.getByText("Nenhum vídeo-fonte encontrado.")).toBeInTheDocument(),
    )
  })

  it("should show an error message when the list request fails", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/admin/source-videos`, () =>
        HttpResponse.json({ error: { code: "INTERNAL_ERROR", message: "boom" } }, { status: 500 }),
      ),
    )

    renderWithProviders(<SourceVideoCuration />)

    expect(
      await screen.findByText("Não foi possível carregar os vídeos-fonte."),
    ).toBeInTheDocument()
  })
})
