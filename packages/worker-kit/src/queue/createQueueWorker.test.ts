import { Worker } from "bullmq";
import IORedis from "ioredis";
import { createQueueWorker } from "./createQueueWorker";

const MockedIORedis = IORedis as unknown as jest.Mock;

jest.mock("bullmq");
jest.mock("ioredis");

describe("createQueueWorker", () => {
  it("should create a BullMQ Worker bound to the given queue name and processor", () => {
    const processor = jest.fn();

    createQueueWorker("scheduler", processor);

    expect(Worker).toHaveBeenCalledWith(
      "scheduler",
      processor,
      expect.objectContaining({ connection: expect.any(MockedIORedis) }),
    );
  });

  it("should forward extra worker options", () => {
    const processor = jest.fn();

    createQueueWorker("ai", processor, { concurrency: 3 });

    expect(Worker).toHaveBeenCalledWith(
      "ai",
      processor,
      expect.objectContaining({ concurrency: 3 }),
    );
  });

  it("should default to localhost when REDIS_URL is not set", () => {
    delete process.env.REDIS_URL;

    createQueueWorker("upload", jest.fn());

    expect(MockedIORedis).toHaveBeenCalledWith(
      "redis://localhost:6379",
      expect.objectContaining({ maxRetriesPerRequest: null }),
    );
  });
});
