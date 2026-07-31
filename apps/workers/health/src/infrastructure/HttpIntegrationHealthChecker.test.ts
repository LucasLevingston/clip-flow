import { HttpIntegrationHealthChecker } from "./HttpIntegrationHealthChecker"

function mockFetch(implementation: () => Promise<{ status: number }>) {
  const fetchMock = jest.fn().mockImplementation(implementation)
  global.fetch = fetchMock as never
  return fetchMock
}

describe("HttpIntegrationHealthChecker", () => {
  it("should be healthy when the server responds with a status under 500", async () => {
    mockFetch(() => Promise.resolve({ status: 200 }))
    const checker = new HttpIntegrationHealthChecker("https://example.com")

    await expect(checker.isHealthy()).resolves.toBe(true)
  })

  it("should still be healthy on a 4xx response (server is reachable)", async () => {
    mockFetch(() => Promise.resolve({ status: 401 }))
    const checker = new HttpIntegrationHealthChecker("https://example.com")

    await expect(checker.isHealthy()).resolves.toBe(true)
  })

  it("should be unhealthy on a 5xx response", async () => {
    mockFetch(() => Promise.resolve({ status: 503 }))
    const checker = new HttpIntegrationHealthChecker("https://example.com")

    await expect(checker.isHealthy()).resolves.toBe(false)
  })

  it("should be unhealthy when the request throws (network failure/timeout)", async () => {
    mockFetch(() => Promise.reject(new Error("network down")))
    const checker = new HttpIntegrationHealthChecker("https://example.com")

    await expect(checker.isHealthy()).resolves.toBe(false)
  })
})
