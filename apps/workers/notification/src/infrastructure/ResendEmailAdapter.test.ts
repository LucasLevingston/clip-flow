import { ResendEmailAdapter } from "./ResendEmailAdapter"

const input = { to: "user@example.com", subject: "Subject", body: "Body" }

function mockFetch(response: unknown) {
  const fetchMock = jest.fn().mockResolvedValueOnce(response)
  global.fetch = fetchMock
  return fetchMock
}

describe("ResendEmailAdapter", () => {
  it("should POST to the Resend API with the bearer key and email fields", async () => {
    const fetchMock = mockFetch({ ok: true, status: 200 })
    const adapter = new ResendEmailAdapter("secret-key", "noreply@clipflow.app")

    await adapter.send(input)

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer secret-key" }),
      }),
    )
  })

  it("should never leak the API key in a thrown error message", async () => {
    mockFetch({ ok: false, status: 401 })
    const adapter = new ResendEmailAdapter("secret-key", "noreply@clipflow.app")

    await adapter.send(input).catch((error: Error) => {
      expect(error.message).not.toContain("secret-key")
    })
  })

  it("should throw when the Resend API responds with a non-ok status", async () => {
    mockFetch({ ok: false, status: 500 })
    const adapter = new ResendEmailAdapter("secret-key", "noreply@clipflow.app")

    await expect(adapter.send(input)).rejects.toThrow("status 500")
  })
})
