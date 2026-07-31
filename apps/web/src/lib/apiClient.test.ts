import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { apiClient } from "./apiClient"
import { ApiError } from "./ApiError"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

describe("apiClient", () => {
  it("should GET and parse JSON", async () => {
    server.use(http.get(`${API_BASE_URL}/v1/ping`, () => HttpResponse.json({ ok: true })))

    const result = await apiClient.get<{ ok: boolean }>("/v1/ping")

    expect(result).toEqual({ ok: true })
  })

  it("should treat a 204 response as null", async () => {
    server.use(http.get(`${API_BASE_URL}/v1/empty`, () => new HttpResponse(null, { status: 204 })))

    const result = await apiClient.get("/v1/empty")

    expect(result).toBeNull()
  })

  it("should throw ApiError with the response envelope on a non-ok response", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/fail`, () =>
        HttpResponse.json({ error: { code: "SOMETHING", message: "boom" } }, { status: 422 }),
      ),
    )

    await expect(apiClient.get("/v1/fail")).rejects.toMatchObject({
      statusCode: 422,
      code: "SOMETHING",
    })
  })

  it("should download a blob via getBlob", async () => {
    server.use(
      http.get(
        `${API_BASE_URL}/v1/export`,
        () => new HttpResponse("id,name\n1,a", { status: 200 }),
      ),
    )

    const blob = await apiClient.getBlob("/v1/export")

    expect(blob).toBeInstanceOf(Blob)
  })

  it("should throw ApiError when getBlob receives a non-ok response", async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/export-fail`, () => new HttpResponse(null, { status: 403 })),
    )

    await expect(apiClient.getBlob("/v1/export-fail")).rejects.toBeInstanceOf(ApiError)
  })
})
