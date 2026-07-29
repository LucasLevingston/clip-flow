import { Queue } from "bullmq"
import IORedis from "ioredis"
import { createQueueProducer } from "./createQueueProducer"

const MockedIORedis = IORedis as unknown as jest.Mock

jest.mock("bullmq")
jest.mock("ioredis")

describe("createQueueProducer", () => {
  it("should create a BullMQ Queue bound to the given queue name", () => {
    createQueueProducer("scheduler")

    expect(Queue).toHaveBeenCalledWith(
      "scheduler",
      expect.objectContaining({ connection: expect.any(MockedIORedis) }),
    )
  })

  it("should forward extra queue options", () => {
    createQueueProducer("scheduler", { prefix: "clipflow" })

    expect(Queue).toHaveBeenCalledWith("scheduler", expect.objectContaining({ prefix: "clipflow" }))
  })

  it("should default to localhost when REDIS_URL is not set", () => {
    delete process.env.REDIS_URL

    createQueueProducer("scheduler")

    expect(MockedIORedis).toHaveBeenCalledWith(
      "redis://localhost:6379",
      expect.objectContaining({ maxRetriesPerRequest: null }),
    )
  })
})
