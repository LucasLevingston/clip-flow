import { Queue, Worker } from "bullmq"
import IORedis from "ioredis"
import { createQueueWorker } from "./createQueueWorker"

const MockedIORedis = IORedis as unknown as jest.Mock
const MockedWorker = Worker as unknown as jest.Mock
const MockedQueue = Queue as unknown as jest.Mock

jest.mock("bullmq")
jest.mock("ioredis")

function getFailedHandler(): (job: unknown, error: Error) => void {
  const workerInstance = MockedWorker.mock.instances[0] as unknown as {
    on: jest.Mock
  }
  const call = workerInstance.on.mock.calls.find(([event]: [string]) => event === "failed")
  if (!call) {
    throw new Error("no 'failed' handler was registered")
  }
  return call[1]
}

function getDeadLetterQueue(): { add: jest.Mock } {
  return MockedQueue.mock.instances[0] as { add: jest.Mock }
}

function buildJob(overrides: Record<string, unknown> = {}) {
  return {
    id: "job-1",
    name: "GenerationScheduled",
    data: { generatedVideoId: "gv-1" },
    attemptsMade: 3,
    opts: { attempts: 3 },
    ...overrides,
  }
}

describe("createQueueWorker", () => {
  it("should create a BullMQ Worker bound to the given queue name and processor", () => {
    const processor = jest.fn()

    createQueueWorker("scheduler", processor)

    expect(Worker).toHaveBeenCalledWith(
      "scheduler",
      processor,
      expect.objectContaining({ connection: expect.any(MockedIORedis) }),
    )
  })

  it("should forward extra worker options", () => {
    const processor = jest.fn()

    createQueueWorker("ai", processor, { concurrency: 3 })

    expect(Worker).toHaveBeenCalledWith(
      "ai",
      processor,
      expect.objectContaining({ concurrency: 3 }),
    )
  })

  it("should default to localhost when REDIS_URL is not set", () => {
    delete process.env.REDIS_URL

    createQueueWorker("upload", jest.fn())

    expect(MockedIORedis).toHaveBeenCalledWith(
      "redis://localhost:6379",
      expect.objectContaining({ maxRetriesPerRequest: null }),
    )
  })
})

describe("createQueueWorker dead-letter forwarding", () => {
  it("should create the sibling <queueName>-dlq queue", () => {
    createQueueWorker("ai", jest.fn())

    expect(MockedQueue).toHaveBeenCalledWith("ai-dlq", expect.anything())
  })

  it("should forward a job once retries are exhausted", () => {
    createQueueWorker("ai", jest.fn())
    const handler = getFailedHandler()
    const deadLetterQueue = getDeadLetterQueue()

    handler(buildJob(), new Error("boom"))

    expect(deadLetterQueue.add).toHaveBeenCalledWith("GenerationScheduled", {
      originalJobId: "job-1",
      data: { generatedVideoId: "gv-1" },
      failedReason: "boom",
      attemptsMade: 3,
    })
  })

  it("should not forward while retries remain", () => {
    createQueueWorker("ai", jest.fn())
    const handler = getFailedHandler()
    const deadLetterQueue = getDeadLetterQueue()

    handler(buildJob({ attemptsMade: 1 }), new Error("boom"))

    expect(deadLetterQueue.add).not.toHaveBeenCalled()
  })

  it("should do nothing when BullMQ passes an undefined job", () => {
    createQueueWorker("ai", jest.fn())
    const handler = getFailedHandler()
    const deadLetterQueue = getDeadLetterQueue()

    expect(() => handler(undefined, new Error("boom"))).not.toThrow()
    expect(deadLetterQueue.add).not.toHaveBeenCalled()
  })

  it("should default to 1 attempt when the job has no attempts configured", () => {
    createQueueWorker("ai", jest.fn())
    const handler = getFailedHandler()
    const deadLetterQueue = getDeadLetterQueue()

    handler(buildJob({ attemptsMade: 1, opts: {} }), new Error("boom"))

    expect(deadLetterQueue.add).toHaveBeenCalled()
  })
})
